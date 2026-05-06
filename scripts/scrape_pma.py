"""
PMA Explorer — collection scraper.

Scrapes featured artworks from https://www.portlandmuseum.org/collection/
and writes them to data/works.json.

Constraints (intentional):
  * Only the main marketing domain `www.portlandmuseum.org` is fetched. The
    EmbARK collection database at `collections.portlandmuseum.org` disallows
    `*` and the `/objects-1/` artwork path in robots.txt, so it is NOT crawled.
  * robots.txt is checked at runtime against our user agent before every fetch.
  * 1 request / second rate limit (configurable via --delay).
  * Exponential backoff on 5xx/429 with jitter, up to 5 retries.

Usage:
    python scripts/scrape_pma.py [--delay 1.0] [--max N] [--out data/works.json]

Dependencies: httpx, beautifulsoup4. Install with:
    pip install httpx beautifulsoup4
"""

from __future__ import annotations

import argparse
import json
import random
import re
import sys
import time
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, Iterator
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser

import httpx
from bs4 import BeautifulSoup, Tag

USER_AGENT = "PMA-Explorer-Demo/0.1 (+https://pma-explorer.jbf.com; contact: jbf@jbf.com)"
COLLECTION_URL = "https://www.portlandmuseum.org/collection/"

# Image filenames look like 1888.1.avif or 1962.6_pm.avif — accession is the
# leading dotted-numeric prefix.
ACCESSION_FILENAME_RE = re.compile(r"^(\d{4}\.[\d.]+?)(?:[_.-].*)?$")
# Trailing accession numbers in credit lines, e.g. "Gift of …, 1962.6"
ACCESSION_TAIL_RE = re.compile(r",\s*(\d{4}\.[\d.]+)\s*$")
# A trailing year in a title line: "The Dead Pearl Diver, 1858"
# Accepts "1858", "circa 1830", "c. 1830", "before 1959", "1972–1973"
YEAR_TAIL_RE = re.compile(
    r",\s*((?:circa|c\.?|before|after|ca\.?)\s*\d{3,4}(?:[–—-]\d{2,4})?|\d{3,4}(?:[–—-]\d{2,4})?)\s*$",
    re.IGNORECASE,
)


@dataclass
class Work:
    id: str
    title: str
    artist: str | None
    year: str | None
    medium: str | None
    dimensions: str | None
    image_url: str | None
    credit_line: str | None
    accession_number: str | None
    description: str | None
    category: str | None
    source_url: str | None
    artist_nationality: str | None = None
    copyright_notice: str | None = None
    raw_caption: str | None = field(default=None, repr=False)


# ---------- HTTP plumbing ----------------------------------------------------

class RateLimitedClient:
    def __init__(self, delay: float = 1.0, timeout: float = 20.0) -> None:
        self._delay = delay
        self._last = 0.0
        self._client = httpx.Client(
            headers={"User-Agent": USER_AGENT, "Accept": "text/html,*/*"},
            timeout=timeout,
            follow_redirects=True,
        )

    def get(self, url: str) -> httpx.Response:
        # Pace requests
        wait = self._delay - (time.monotonic() - self._last)
        if wait > 0:
            time.sleep(wait)

        attempt = 0
        backoff = 1.5
        while True:
            attempt += 1
            try:
                resp = self._client.get(url)
                self._last = time.monotonic()
                if resp.status_code in (429, 500, 502, 503, 504):
                    raise httpx.HTTPStatusError(
                        f"retryable {resp.status_code}", request=resp.request, response=resp
                    )
                resp.raise_for_status()
                return resp
            except (httpx.TransportError, httpx.HTTPStatusError) as exc:
                if attempt >= 5:
                    raise
                sleep_for = backoff ** attempt + random.uniform(0, 0.5)
                print(f"  retry {attempt} after {sleep_for:.1f}s ({exc})", file=sys.stderr)
                time.sleep(sleep_for)

    def close(self) -> None:
        self._client.close()


def check_robots(url: str) -> None:
    """Fail loud if our user agent is not allowed to fetch `url`."""
    parsed = urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    rp = RobotFileParser()
    try:
        with httpx.Client(headers={"User-Agent": USER_AGENT}, timeout=10.0) as c:
            r = c.get(robots_url)
        if r.status_code == 200:
            rp.parse(r.text.splitlines())
        else:
            # No robots.txt → assume allowed
            return
    except httpx.HTTPError:
        return
    if not rp.can_fetch(USER_AGENT, url):
        raise SystemExit(f"robots.txt disallows {url} for {USER_AGENT}")


# ---------- Parsing ----------------------------------------------------------

def parse_alt_caption(alt: str) -> dict[str, str | None]:
    """Parse PMA's standard 5-line caption.

    Layout (each line separated by `\n`):
        0: Artist Name
        1: Nationality, dates  (e.g. "United States, 1825–1861" / "born 1953")
        2: Title, year
        3: Medium, dimensions
        4: Credit line, accession number
        5: © copyright (optional)

    Real captions in the wild are messy: lines may collapse, the title can
    contain extra commas, the year may use "circa"/"c.", dimensions may be
    missing, and copyright lines may be absent.
    """
    out = {
        "artist": None,
        "artist_nationality": None,
        "title": None,
        "year": None,
        "medium": None,
        "dimensions": None,
        "credit_line": None,
        "accession_number": None,
        "copyright_notice": None,
    }
    if not alt:
        return out

    lines = [l.strip() for l in alt.splitlines() if l.strip()]
    if not lines:
        return out

    out["artist"] = lines[0] or None

    # Detect optional nationality line: contains a year or "born"
    idx = 1
    if idx < len(lines) and re.search(r"\bborn\b|\d{3,4}", lines[idx]) and "," in lines[idx] and len(lines[idx]) < 80:
        out["artist_nationality"] = lines[idx]
        idx += 1

    # Title + year line
    if idx < len(lines):
        t = lines[idx]
        m = YEAR_TAIL_RE.search(t)
        if m:
            out["year"] = m.group(1).strip()
            out["title"] = t[: m.start()].rstrip(", ").strip() or None
        else:
            out["title"] = t
        idx += 1

    # Medium + dimensions
    if idx < len(lines):
        md = lines[idx]
        # split on the last comma before a dimension-looking chunk
        dim_match = re.search(r",\s*([0-9][^,]*?(?:inches|in\.|cm|mm)[^,]*)$", md)
        if dim_match:
            out["dimensions"] = dim_match.group(1).strip()
            out["medium"] = md[: dim_match.start()].strip() or None
        else:
            out["medium"] = md
        idx += 1

    # Credit line (may include accession at tail)
    if idx < len(lines):
        cl = lines[idx]
        am = ACCESSION_TAIL_RE.search(cl)
        if am:
            out["accession_number"] = am.group(1)
            out["credit_line"] = cl[: am.start()].strip() or None
        else:
            out["credit_line"] = cl
        idx += 1

    # Copyright (any remaining line starting with ©)
    for tail in lines[idx:]:
        if tail.startswith("©"):
            out["copyright_notice"] = tail
            break

    return out


def accession_from_image(src: str) -> str | None:
    name = src.rsplit("/", 1)[-1]
    name = name.rsplit(".", 1)[0]  # drop extension
    m = ACCESSION_FILENAME_RE.match(name)
    if m:
        return m.group(1)
    return None


def slugify(s: str) -> str:
    s = re.sub(r"[^\w\s-]", "", s.lower())
    s = re.sub(r"[\s_-]+", "-", s).strip("-")
    return s[:60]


def iter_works_from_collection(html: str) -> Iterator[Work]:
    soup = BeautifulSoup(html, "html.parser")

    # Walk the document in order, tracking the most recent h4 as category.
    # Then for every <img> we encounter under uploads/, build a Work.
    current_category: str | None = None

    for el in soup.find_all(True):
        if not isinstance(el, Tag):
            continue
        if el.name == "h4":
            text = el.get_text(" ", strip=True)
            if text:
                current_category = text
            continue
        if el.name != "img":
            continue
        src = el.get("src") or ""
        if "wp-content/uploads" not in src or "logo" in src.lower():
            continue

        alt = el.get("alt") or ""
        parsed = parse_alt_caption(alt)
        accession = parsed.get("accession_number") or accession_from_image(src)
        title = parsed.get("title") or "Untitled"
        artist = parsed.get("artist")

        wid_seed = accession or f"{slugify(artist or 'unknown')}-{slugify(title)}"
        wid = wid_seed or src.rsplit("/", 1)[-1]

        yield Work(
            id=wid,
            title=title,
            artist=artist,
            year=parsed.get("year"),
            medium=parsed.get("medium"),
            dimensions=parsed.get("dimensions"),
            image_url=src if src.startswith("http") else urljoin(COLLECTION_URL, src),
            credit_line=parsed.get("credit_line"),
            accession_number=accession,
            description=None,  # not present on the public collection page
            category=current_category,
            source_url=COLLECTION_URL,
            artist_nationality=parsed.get("artist_nationality"),
            copyright_notice=parsed.get("copyright_notice"),
            raw_caption=alt or None,
        )


def deduplicate(works: Iterable[Work]) -> list[Work]:
    seen: dict[str, Work] = {}
    for w in works:
        key = w.accession_number or w.id
        if key in seen:
            # Prefer the version with more populated fields
            existing = seen[key]
            score_existing = sum(1 for v in asdict(existing).values() if v)
            score_new = sum(1 for v in asdict(w).values() if v)
            if score_new > score_existing:
                seen[key] = w
        else:
            seen[key] = w
    return list(seen.values())


# ---------- Entry point ------------------------------------------------------

def main() -> int:
    ap = argparse.ArgumentParser(description="Scrape PMA featured works.")
    ap.add_argument("--delay", type=float, default=1.0, help="Seconds between requests")
    ap.add_argument("--max", type=int, default=0, help="Cap output (0 = no cap)")
    ap.add_argument(
        "--out",
        type=Path,
        default=Path(__file__).resolve().parent.parent / "data" / "works.json",
    )
    ap.add_argument("--verbose", action="store_true")
    args = ap.parse_args()

    print(f"Checking robots.txt for {COLLECTION_URL} …")
    check_robots(COLLECTION_URL)

    client = RateLimitedClient(delay=args.delay)
    try:
        print(f"Fetching {COLLECTION_URL} …")
        resp = client.get(COLLECTION_URL)
    finally:
        client.close()

    works = list(iter_works_from_collection(resp.text))
    works = deduplicate(works)
    if args.max:
        works = works[: args.max]

    payload = {
        "scraped_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": COLLECTION_URL,
        "user_agent": USER_AGENT,
        "count": len(works),
        "works": [asdict(w) for w in works],
    }

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, indent=2, ensure_ascii=False))

    print(f"Wrote {len(works)} works to {args.out}")
    if args.verbose:
        by_cat: dict[str, int] = {}
        for w in works:
            by_cat[w.category or "—"] = by_cat.get(w.category or "—", 0) + 1
        for cat, n in sorted(by_cat.items(), key=lambda x: -x[1]):
            print(f"  {n:3d}  {cat}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
