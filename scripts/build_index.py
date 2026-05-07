"""
Build a tiny TF-IDF index over the demo collection so the compare narrative
generator can do RAG-style retrieval without a vector database. Real
embeddings (OpenAI / Anthropic) drop in later — same JSON shape, just
swap the `vector` field.

Output: data/index.json
{
  "vocab": {"term": idx, ...},
  "idf":   [...],          # length |vocab|
  "docs": [
    {"id": "1888.1", "tf": {idx: count, ...}, "norm": 12.34, "text": "..."},
    ...
  ]
}

Usage:
    pip install -r scripts/requirements.txt
    python scripts/build_index.py
"""

from __future__ import annotations

import json
import math
import re
from collections import Counter
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
WORKS = REPO / "data" / "works.json"
OUT = REPO / "data" / "index.json"

STOPWORDS = {
    "the", "and", "of", "in", "a", "an", "to", "by", "with", "on", "at",
    "for", "from", "is", "are", "was", "were", "be", "been", "being", "or",
    "as", "this", "that", "these", "those", "it", "its", "into", "her",
    "his", "their", "they", "she", "he", "we", "you", "i", "me", "my",
    "our", "your", "but", "not", "so", "no", "yes", "than", "then", "also",
    "after", "before", "during", "around", "about", "circa", "c", "ca",
    "untitled",
}

TOKEN_RE = re.compile(r"[A-Za-z][A-Za-z'\-]+")


def tokenize(text: str) -> list[str]:
    out: list[str] = []
    for m in TOKEN_RE.finditer(text.lower()):
        t = m.group(0)
        if len(t) < 2 or t in STOPWORDS:
            continue
        out.append(t)
    return out


def doc_text(w: dict) -> str:
    parts = [
        w.get("title") or "",
        w.get("artist") or "",
        w.get("artist_nationality") or "",
        w.get("year") or "",
        w.get("medium") or "",
        w.get("dimensions") or "",
        w.get("credit_line") or "",
        w.get("category") or "",
        w.get("raw_caption") or "",
        w.get("hue_bucket") or "",
    ]
    return " ".join(p for p in parts if p)


def main() -> int:
    data = json.loads(WORKS.read_text())
    works = data["works"]

    tokenized: list[tuple[str, str, list[str]]] = []
    for w in works:
        text = doc_text(w)
        tokenized.append((w["id"], text, tokenize(text)))

    # Build vocab + document frequency
    df: Counter[str] = Counter()
    for _, _, toks in tokenized:
        for term in set(toks):
            df[term] += 1
    vocab = {term: i for i, term in enumerate(sorted(df))}
    n_docs = len(tokenized)
    idf = [0.0] * len(vocab)
    for term, i in vocab.items():
        # Smoothed IDF
        idf[i] = math.log((1 + n_docs) / (1 + df[term])) + 1.0

    # Per-doc TF-IDF vectors (sparse) and L2 norm
    docs = []
    for wid, text, toks in tokenized:
        if not toks:
            continue
        tf: dict[int, float] = {}
        counts = Counter(toks)
        for term, c in counts.items():
            i = vocab[term]
            tf[i] = (1 + math.log(c)) * idf[i]
        norm = math.sqrt(sum(v * v for v in tf.values())) or 1.0
        docs.append(
            {
                "id": wid,
                "tf": {str(k): round(v, 4) for k, v in tf.items()},
                "norm": round(norm, 4),
            }
        )

    OUT.write_text(
        json.dumps(
            {"vocab": vocab, "idf": [round(x, 4) for x in idf], "docs": docs},
            ensure_ascii=False,
            indent=0,
        )
    )
    print(f"Wrote {OUT}: {len(docs)} docs, |vocab| = {len(vocab)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
