"""
Re-parse works whose `artist` field contains the entire caption blob.

The original scraper assumed alt text always uses newlines as field separators.
Some alts on portlandmuseum.org/collection/ ship as a single line, so the
parser put the whole caption into `artist`. This script splits those by
nationality keyword and rebuilds the structured fields in place.

Run after the main scraper:
    python scripts/fix_artists.py
"""

from __future__ import annotations

import json
import re
from pathlib import Path

WORKS = Path(__file__).resolve().parent.parent / "data" / "works.json"

COUNTRIES = [
    "United States", "France", "England", "Germany", "Italy", "Spain",
    "Belgium", "Netherlands", "Sweden", "Russia", "Japan", "Mexico",
    "Austria", "Switzerland", "Denmark", "Norway", "Finland", "Greece",
    "Poland", "Hungary", "Brazil", "Cuba", "Iran", "Iraq", "Senegal",
    "Nigeria", "Canada", "Australia", "Scotland", "Ireland", "Wales",
]

ARTIST_RE = re.compile(
    r"^(?P<artist>.+?)\s+(?P<country>"
    + "|".join(re.escape(c) for c in COUNTRIES)
    + r")(?P<locator>\s\([^)]+\))?,\s*(?P<dates>born\s+\d{3,4}|\d{3,4}[–\-]\d{0,4})\s+(?P<rest>.+)$"
)
TITLE_YEAR_RE = re.compile(
    r"^(?P<title>.+?),\s*(?P<year>circa\s+\d{3,4}(?:[–\-]\d{0,4})?|c\.?\s*\d{3,4}(?:[–\-]\d{0,4})?|before\s+\d{3,4}|after\s+\d{3,4}|\d{3,4}(?:[–\-]\d{2,4})?)\s+(?P<rest>.+)$"
)
MEDIUM_DIM_RE = re.compile(
    r"^(?P<medium>.+?),\s*(?P<dim>[\d/][^,]*?(?:inches|in\.|cm|mm)[^,]*)(?:\s+(?P<credit>.+))?$"
)
ACCESSION_TAIL_RE = re.compile(r",\s*(\d{4}\.[\d.]+)\s*$")


def reparse(blob: str) -> dict | None:
    m = ARTIST_RE.match(blob.strip())
    if not m:
        return None
    artist = m.group("artist").strip()
    country = m.group("country")
    locator = (m.group("locator") or "").strip()
    dates = m.group("dates")
    nationality = f"{country}{(' ' + locator) if locator else ''}, {dates}"
    rest = m.group("rest")

    out: dict[str, str | None] = {
        "artist": artist,
        "artist_nationality": nationality,
        "title": rest,
        "year": None,
        "medium": None,
        "dimensions": None,
        "credit_line": None,
        "accession_number": None,
    }

    tym = TITLE_YEAR_RE.match(rest)
    if tym:
        out["title"] = tym.group("title").strip()
        out["year"] = tym.group("year").strip()
        rest2 = tym.group("rest").strip()
    else:
        return out  # title-only; no year/medium

    mdm = MEDIUM_DIM_RE.match(rest2)
    if mdm:
        out["medium"] = mdm.group("medium").strip()
        out["dimensions"] = mdm.group("dim").strip()
        credit = (mdm.group("credit") or "").strip()
    else:
        out["medium"] = rest2
        credit = ""

    if credit:
        am = ACCESSION_TAIL_RE.search(credit)
        if am:
            out["accession_number"] = am.group(1)
            credit = credit[: am.start()].rstrip(", ")
        out["credit_line"] = credit or None

    return out


def main() -> int:
    data = json.loads(WORKS.read_text())
    works = data["works"]
    fixed = 0
    skipped = 0
    for w in works:
        artist = (w.get("artist") or "").strip()
        if len(artist) <= 60:
            continue
        parsed = reparse(artist)
        if not parsed:
            print(f"  ! could not reparse {w['id']}: {artist[:60]}…")
            skipped += 1
            continue
        for k, v in parsed.items():
            if v:
                w[k] = v
        # Refresh id when it was the slugified blob
        if w["id"].startswith(("stuart-", "katherine-", "david-c-", "kara-")) and parsed.get("accession_number"):
            w["id"] = parsed["accession_number"]
        fixed += 1
        print(f"  ✓ {w['id']:14s}  {parsed['artist']:32s}  {parsed.get('title', '')[:40]}")

    WORKS.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    print(f"\nFixed {fixed} works, skipped {skipped}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
