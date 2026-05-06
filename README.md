# PMA Explorer

A demo collection explorer for the **Portland Museum of Art**.

This is the proof-of-concept for a planned full-collection index covering all
~22,000 PMA objects. The demo uses only the ~80 featured artworks published on
the museum's public marketing page, scraped within `robots.txt`.

- **Live (target):** https://pma-explorer.jbf.com
- **Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui
- **Design:** Dragon Design System — Libre Baskerville headlines, Source Sans
  Pro body, IBM Plex Mono data, warm cream background, surgical red accents.

## Project layout

```
pma-explorer/
├── data/
│   └── works.json            # Scraped output, committed
├── scripts/
│   ├── scrape_pma.py         # Phase 1: HTML scraper (httpx + bs4)
│   └── requirements.txt
└── src/
    ├── app/                  # Next.js App Router
    ├── components/
    └── lib/works.ts
```

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
```

## Re-run the scraper

The scraper writes `data/works.json`. The Next.js app imports that file at
build time, so you re-run the scraper before committing or deploying.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt
python scripts/scrape_pma.py --verbose
```

Optional flags:

| Flag        | Default                | Meaning                                  |
|-------------|------------------------|------------------------------------------|
| `--delay`   | `1.0`                  | Seconds between requests (rate limit)    |
| `--max`     | `0` (no cap)           | Truncate output after N works            |
| `--out`     | `data/works.json`      | Output path                              |
| `--verbose` | off                    | Print per-category counts                |

## Scope and constraints

This demo deliberately scrapes only the marketing domain
`www.portlandmuseum.org`. The full collection database lives at
`collections.portlandmuseum.org`, which **disallows** all non-Google user
agents in `robots.txt` and explicitly blocks `/objects-1/` (the artwork detail
path). The scraper checks `robots.txt` at runtime via `urllib.robotparser` and
will refuse to fetch any disallowed URL.

For the planned 22K-object phase we will:

1. Contact PMA directly to request a data export or rate-limited API access
   from the EmbARK installation, **or**
2. Replace the data source with a museum that publishes an open API/CSV (Met,
   Cleveland, Smithsonian, etc.) and rebrand accordingly.

We will *not* bypass `robots.txt` even if Firecrawl makes it technically easy.

## Data shape

Each entry in `works.json` looks like:

```jsonc
{
  "id": "1888.1",
  "title": "The Dead Pearl Diver",
  "artist": "Benjamin Paul Akers",
  "year": "1858",
  "medium": "Marble",
  "dimensions": "27 x 67 x 28 inches",
  "image_url": "https://portlandmuseum.org/wp-content/uploads/2025/11/1888.1.avif",
  "credit_line": "Museum purchase with support from …",
  "accession_number": "1888.1",
  "description": null,
  "category": "American Art",
  "source_url": "https://www.portlandmuseum.org/collection/",
  "artist_nationality": "United States, 1825–1861",
  "copyright_notice": null,
  "raw_caption": "…full alt text…"
}
```

Field coverage on the current dataset:

| Field              | Coverage |
|--------------------|----------|
| id, title, artist, image, category | 100% |
| accession_number   | ~88% |
| medium, dimensions | ~70% |
| credit_line, year  | ~70% |
| copyright_notice   | ~12% (only when ©-tagged in alt) |
| description        | 0% (lives only on the locked-down EmbARK pages) |

## Deploy (Vercel)

```bash
vercel link              # link to Vercel project `pma-explorer`
vercel --prod
```

Custom domain `pma-explorer.jbf.com` is wired via Cloudflare CNAME (DNS only,
not proxied) once the Vercel domain is added in the dashboard.

## License & attribution

Unofficial demo. All images and metadata © Portland Museum of Art and
respective artists, used for non-commercial demonstration purposes.
