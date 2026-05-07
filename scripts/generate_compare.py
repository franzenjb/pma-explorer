"""
Pre-generate read-across narratives for /compare?ids=… combinations.

Each input is a comma-separated list of accession ids. The script prompts
Claude (or falls back to a placeholder) for a 200-word "read across" essay
written like a museum wall card, then writes the result to
data/compare-narratives.json keyed by the sorted-id slug.

Usage:
    pip install -r scripts/requirements.txt
    export ANTHROPIC_API_KEY=sk-ant-...        # optional
    python scripts/generate_compare.py 1888.1 1996.12
    python scripts/generate_compare.py --combo 1996.38.29,1996.38.63
    python scripts/generate_compare.py --combos-file data/compare-seeds.txt
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import sys
import time
from pathlib import Path
from typing import Iterable

REPO = Path(__file__).resolve().parent.parent
WORKS_PATH = REPO / "data" / "works.json"
OUT_PATH = REPO / "data" / "compare-narratives.json"
INDEX_PATH = REPO / "data" / "index.json"

MODEL = "claude-haiku-4-5-20251001"
SYSTEM = (
    "You are a museum curator writing a 'read across' wall card for two to "
    "four works in the Portland Museum of Art's collection that have been "
    "deliberately placed side by side. Write 180–220 words. Open with a "
    "single concrete observation about how the works rhyme or argue with "
    "each other, then anchor that in the catalog metadata you are given "
    "(do NOT invent biographical or exhibition facts). Close with one "
    "sentence inviting the visitor to look again. Warm, Economist-style "
    "prose. Plain text, no markdown."
)


def slug_for(ids: list[str]) -> str:
    return "+".join(sorted(ids))


# ---------- RAG retrieval over the TF-IDF index ----------------------------

def load_index() -> dict | None:
    if not INDEX_PATH.exists():
        return None
    return json.loads(INDEX_PATH.read_text())


def retrieve_related(focal_ids: list[str], k: int = 6) -> list[str]:
    """Return ids of the top-k corpus works most similar to the focal works,
    excluding the focal works themselves. Pure cosine over TF-IDF vectors."""
    index = load_index()
    if not index:
        return []
    docs = {d["id"]: d for d in index["docs"]}
    focal = [docs[i] for i in focal_ids if i in docs]
    if not focal:
        return []

    # Sum focal TF-IDF vectors → query vector. Re-normalize.
    query: dict[int, float] = {}
    for d in focal:
        for k_str, v in d["tf"].items():
            ki = int(k_str)
            query[ki] = query.get(ki, 0.0) + v
    qn = sum(v * v for v in query.values()) ** 0.5 or 1.0

    scored: list[tuple[float, str]] = []
    focal_set = set(focal_ids)
    for d in index["docs"]:
        if d["id"] in focal_set:
            continue
        dot = 0.0
        tf = d["tf"]
        # Iterate the smaller side (query is typically smaller)
        for ki, qv in query.items():
            dv = tf.get(str(ki))
            if dv:
                dot += qv * dv
        if dot <= 0:
            continue
        score = dot / (qn * d["norm"])
        scored.append((score, d["id"]))
    scored.sort(reverse=True)
    return [wid for _, wid in scored[:k]]


def placeholder_narrative(works: list[dict]) -> str:
    titles = [
        f"{w.get('title','Untitled')} ({w.get('artist','—')}, {w.get('year','—')})"
        for w in works
    ]
    return (
        "Placeholder narrative. These works — "
        + "; ".join(titles)
        + " — have been pulled from different rooms of the Portland "
        "Museum of Art so the visitor can read them against one another. "
        "Set ANTHROPIC_API_KEY and re-run `python scripts/generate_compare.py "
        + " ".join(w["id"] for w in works)
        + "` to replace this with a curator-grade essay grounded only in the "
        "cataloged metadata."
    )


def format_work_block(w: dict, label: str) -> str:
    return (
        f"[{label}]\n"
        f"Title: {w.get('title')}\n"
        f"Artist: {w.get('artist')}\n"
        f"Nationality / dates: {w.get('artist_nationality') or '—'}\n"
        f"Year: {w.get('year') or '—'}\n"
        f"Medium: {w.get('medium') or '—'}\n"
        f"Dimensions: {w.get('dimensions') or '—'}\n"
        f"Credit line: {w.get('credit_line') or '—'}\n"
        f"Category: {w.get('category') or '—'}\n"
        f"Accession: {w.get('accession_number') or '—'}\n"
    )


def call_anthropic(
    works: list[dict],
    api_key: str,
    related: list[dict] | None = None,
) -> str:
    try:
        from anthropic import Anthropic
    except ImportError:
        print("anthropic package not installed; placeholder", file=sys.stderr)
        return placeholder_narrative(works)
    client = Anthropic(api_key=api_key)

    focal_blocks = [
        format_work_block(w, f"Work {i}") for i, w in enumerate(works, start=1)
    ]
    related_blocks = []
    if related:
        for i, w in enumerate(related, start=1):
            related_blocks.append(format_work_block(w, f"Related {i}"))
    related_section = (
        "\nThese RELATED works are also in the PMA collection. You may "
        "reference them as comparanda where genuinely useful, but the "
        "essay's subject is the FOCAL works above; do not let the related "
        "list dominate.\n\n" + "\n".join(related_blocks)
        if related_blocks
        else ""
    )
    prompt = (
        "Write the 'read across' essay for these "
        f"{len(works)} FOCAL works. Stay strictly within the metadata "
        "provided in this prompt. Do not invent biography, exhibition "
        "history, or quotes.\n\n"
        + "\n".join(focal_blocks)
        + related_section
    )
    msg = client.messages.create(
        model=MODEL,
        max_tokens=700,
        system=SYSTEM,
        messages=[{"role": "user", "content": prompt}],
    )
    text = "".join(
        block.text for block in msg.content if getattr(block, "type", None) == "text"
    )
    return text.strip()


def parse_combo(combo: str) -> list[str]:
    parts = [p.strip() for p in re.split(r"[,\s]+", combo) if p.strip()]
    return parts


def iter_combos(args: argparse.Namespace) -> Iterable[list[str]]:
    if args.combo:
        yield parse_combo(args.combo)
    if args.combos_file:
        for line in Path(args.combos_file).read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            yield parse_combo(line)
    if args.ids:
        yield args.ids


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="*", help="Accession ids of 2–4 works")
    ap.add_argument("--combo", help='One combo string, e.g. "1888.1,1996.12"')
    ap.add_argument("--combos-file", help="Newline-delimited combos file")
    ap.add_argument("-k", type=int, default=6, help="RAG top-K related works")
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    works_index = {w["id"]: w for w in json.loads(WORKS_PATH.read_text())["works"]}
    cache = json.loads(OUT_PATH.read_text()) if OUT_PATH.exists() else {}
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ANTHROPIC_API_KEY not set — placeholder essays", file=sys.stderr)

    combos = list(iter_combos(args))
    if not combos:
        print("No combos provided. Use positional ids, --combo, or --combos-file.", file=sys.stderr)
        return 1

    written = 0
    for ids in combos:
        if not 2 <= len(ids) <= 4:
            print(f"  ! skip {ids}: need 2–4 ids", file=sys.stderr)
            continue
        works = [works_index.get(i) for i in ids]
        if not all(works):
            missing = [i for i, w in zip(ids, works) if not w]
            print(f"  ! unknown ids in {ids}: {missing}", file=sys.stderr)
            continue
        slug = slug_for(ids)
        if not args.force and slug in cache:
            print(f"  · {slug} cached")
            continue
        related_ids = retrieve_related(ids, k=args.k)
        related = [works_index[i] for i in related_ids if i in works_index]
        narrative = (
            call_anthropic(works, api_key, related=related)
            if api_key
            else placeholder_narrative(works)
        )
        cache[slug] = {
            "ids": sorted(ids),
            "narrative": narrative,
            "related_ids": related_ids,
            "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
            "generated_by": "anthropic" if api_key else "placeholder",
        }
        written += 1
        print(f"  ✓ {slug}  ({len(narrative)} chars)")
        if api_key:
            time.sleep(0.5)

    OUT_PATH.write_text(json.dumps(cache, indent=2, ensure_ascii=False))
    print(f"\nWrote {written} new entries to {OUT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
