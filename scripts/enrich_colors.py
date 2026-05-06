"""
Enrich data/works.json with a dominant color per work.

For each work that has an `image_url`, this script:
  1. Downloads the image (cached in scripts/.cache/) at 1 req/sec
  2. Extracts the dominant non-background color using Pillow's quantize
  3. Writes back: dominant_hex, dominant_hsl, hue_bucket

Usage:
    pip install -r scripts/requirements.txt   # pillow + httpx + bs4
    python scripts/enrich_colors.py [--limit N] [--force]
"""

from __future__ import annotations

import argparse
import colorsys
import hashlib
import io
import json
import time
from pathlib import Path

import httpx
from PIL import Image

REPO = Path(__file__).resolve().parent.parent
WORKS = REPO / "data" / "works.json"
CACHE = Path(__file__).resolve().parent / ".cache"
USER_AGENT = "PMA-Explorer-Demo/0.2 (+https://pma-explorer.jbf.com)"


def fetch_image(url: str, client: httpx.Client) -> bytes | None:
    h = hashlib.sha1(url.encode()).hexdigest()[:16]
    cached = CACHE / f"{h}.bin"
    if cached.exists():
        return cached.read_bytes()
    try:
        r = client.get(url)
        r.raise_for_status()
    except httpx.HTTPError as exc:
        print(f"  ! fetch failed: {url} ({exc})")
        return None
    CACHE.mkdir(parents=True, exist_ok=True)
    cached.write_bytes(r.content)
    return r.content


def dominant_color(data: bytes) -> tuple[int, int, int] | None:
    """Return RGB of the most-saturated dominant cluster."""
    try:
        img = Image.open(io.BytesIO(data)).convert("RGB")
    except Exception as exc:
        print(f"  ! decode failed: {exc}")
        return None
    img.thumbnail((128, 128))
    quantized = img.quantize(colors=8, method=Image.Quantize.MEDIANCUT)
    palette = quantized.getpalette()
    counts = sorted(quantized.getcolors() or [], reverse=True)  # (n, idx)
    # Score each candidate by frequency * saturation, so we don't pick pure
    # cream/white background as "dominant".
    best = None
    best_score = -1.0
    for n, idx in counts[:6]:
        r, g, b = palette[idx * 3 : idx * 3 + 3]
        h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
        # Penalize near-white and near-black: we want a real hue.
        if l > 0.95 or l < 0.05:
            continue
        score = n * (0.3 + s)
        if score > best_score:
            best_score = score
            best = (r, g, b)
    if best is None and counts:
        n, idx = counts[0]
        best = tuple(palette[idx * 3 : idx * 3 + 3])
    return best  # type: ignore[return-value]


def hue_bucket(h: float) -> str:
    """Map hue [0,1] → coarse bucket name."""
    deg = (h * 360) % 360
    table = [
        (15, "red"),
        (45, "orange"),
        (65, "yellow"),
        (170, "green"),
        (200, "teal"),
        (255, "blue"),
        (290, "purple"),
        (335, "pink"),
        (360, "red"),
    ]
    for upper, name in table:
        if deg < upper:
            return name
    return "red"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--force", action="store_true", help="Re-extract even if cached")
    ap.add_argument("--delay", type=float, default=0.5)
    args = ap.parse_args()

    payload = json.loads(WORKS.read_text())
    works = payload["works"]

    with httpx.Client(
        headers={"User-Agent": USER_AGENT},
        timeout=20,
        follow_redirects=True,
    ) as client:
        last = 0.0
        for i, w in enumerate(works):
            if args.limit and i >= args.limit:
                break
            if not args.force and w.get("dominant_hex"):
                continue
            url = w.get("image_url")
            if not url:
                continue

            wait = args.delay - (time.monotonic() - last)
            if wait > 0:
                time.sleep(wait)
            data = fetch_image(url, client)
            last = time.monotonic()
            if not data:
                continue
            rgb = dominant_color(data)
            if not rgb:
                continue
            r, g, b = rgb
            h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
            w["dominant_hex"] = "#{:02x}{:02x}{:02x}".format(r, g, b)
            w["dominant_hsl"] = {
                "h": round(h * 360),
                "s": round(s * 100),
                "l": round(l * 100),
            }
            w["hue_bucket"] = hue_bucket(h)
            print(f"  {i+1:2d}/{len(works)}  {w['dominant_hex']}  {w['hue_bucket']:7s}  {w['title'][:50]}")

    WORKS.write_text(json.dumps(payload, indent=2, ensure_ascii=False))
    print(f"\nSaved enriched {WORKS}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
