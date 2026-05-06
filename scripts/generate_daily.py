"""
Pre-generate one Daily Painting essay per day for the next N days.

Picks a deterministic work from data/works.json by hashing the date, then
calls the Anthropic API to write a 200-word essay grounded in the catalog
metadata. Writes data/daily.json keyed by ISO date.

If ANTHROPIC_API_KEY is not set, this script falls back to a placeholder
essay so the demo still ships. Replace later by setting the key and re-running.

Usage:
    pip install -r scripts/requirements.txt
    export ANTHROPIC_API_KEY=sk-ant-...      # optional
    python scripts/generate_daily.py [--days 30] [--start 2026-05-06]
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import sys
import time
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
WORKS_PATH = REPO / "data" / "works.json"
DAILY_PATH = REPO / "data" / "daily.json"

MODEL = "claude-haiku-4-5-20251001"
SYSTEM = (
    "You are a museum curator writing the Daily Painting feature for the "
    "Portland Museum of Art. Each essay is exactly ~200 words, factually "
    "grounded in the catalog metadata you are given (do NOT invent biographical "
    "facts not present), and written in clear, warm, Economist-style prose. "
    "Open with one specific observation about the work itself, then place the "
    "artist in their moment, then end with one sentence inviting the reader "
    "to look again."
)


def pick_for_date(works: list[dict], date: dt.date) -> dict:
    h = hashlib.sha1(date.isoformat().encode()).hexdigest()
    idx = int(h, 16) % len(works)
    return works[idx]


def placeholder_essay(work: dict) -> str:
    title = work.get("title") or "Untitled"
    artist = work.get("artist") or "an unidentified artist"
    year = work.get("year") or "an unrecorded year"
    medium = work.get("medium") or "mixed media"
    nationality = work.get("artist_nationality") or ""
    credit = work.get("credit_line") or ""
    return (
        f"Today’s painting is *{title}*, a {medium.lower()} work by {artist} "
        f"({nationality}) dated {year}. The piece arrived at the museum "
        f"through the following gift: {credit}. "
        "This is placeholder copy. Set ANTHROPIC_API_KEY and re-run "
        "`python scripts/generate_daily.py` to replace every essay with a "
        "freshly generated, curator-grade meditation on this specific work, "
        "drawing only on the cataloged metadata above. The feature rotates "
        "through 22,000 works in production, with a permalink for every "
        "calendar day so subscribers can collect favorites and share them."
    )


def call_anthropic(work: dict, api_key: str) -> str:
    try:
        from anthropic import Anthropic
    except ImportError:
        print("anthropic package not installed; falling back to placeholder", file=sys.stderr)
        return placeholder_essay(work)
    client = Anthropic(api_key=api_key)
    prompt = (
        "Write the Daily Painting essay for this work. Stay strictly within "
        "the metadata I provide; do not invent biography, exhibition history, "
        "or quotes.\n\n"
        f"Title: {work.get('title')}\n"
        f"Artist: {work.get('artist')}\n"
        f"Nationality / dates: {work.get('artist_nationality') or '—'}\n"
        f"Year: {work.get('year') or '—'}\n"
        f"Medium: {work.get('medium') or '—'}\n"
        f"Dimensions: {work.get('dimensions') or '—'}\n"
        f"Credit line: {work.get('credit_line') or '—'}\n"
        f"Category: {work.get('category') or '—'}\n"
        f"Accession: {work.get('accession_number') or '—'}\n"
    )
    msg = client.messages.create(
        model=MODEL,
        max_tokens=600,
        system=SYSTEM,
        messages=[{"role": "user", "content": prompt}],
    )
    text = "".join(
        block.text for block in msg.content if getattr(block, "type", None) == "text"
    )
    return text.strip()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=30)
    ap.add_argument("--start", type=str, default=dt.date.today().isoformat())
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    works = json.loads(WORKS_PATH.read_text())["works"]
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ANTHROPIC_API_KEY not set — using placeholder essays", file=sys.stderr)

    daily = json.loads(DAILY_PATH.read_text()) if DAILY_PATH.exists() else {}

    start = dt.date.fromisoformat(args.start)
    for i in range(args.days):
        d = start + dt.timedelta(days=i)
        key = d.isoformat()
        if not args.force and key in daily:
            continue
        work = pick_for_date(works, d)
        essay = call_anthropic(work, api_key) if api_key else placeholder_essay(work)
        daily[key] = {
            "date": key,
            "work_id": work["id"],
            "essay": essay,
            "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
            "generated_by": "anthropic" if api_key else "placeholder",
        }
        print(f"  {key}  {work['id']:10s}  {work['title'][:50]}")
        if api_key:
            time.sleep(0.5)

    DAILY_PATH.write_text(json.dumps(daily, indent=2, ensure_ascii=False))
    print(f"\nWrote {len(daily)} entries to {DAILY_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
