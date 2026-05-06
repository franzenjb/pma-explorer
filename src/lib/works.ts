import worksJson from "../../data/works.json";

export type Work = {
  id: string;
  title: string;
  artist: string | null;
  year: string | null;
  medium: string | null;
  dimensions: string | null;
  image_url: string | null;
  credit_line: string | null;
  accession_number: string | null;
  description: string | null;
  category: string | null;
  source_url: string | null;
  artist_nationality?: string | null;
  copyright_notice?: string | null;
  raw_caption?: string | null;
  dominant_hex?: string | null;
  dominant_hsl?: { h: number; s: number; l: number } | null;
  hue_bucket?: string | null;
};

export type WorksFile = {
  scraped_at: string;
  source: string;
  count: number;
  works: Work[];
};

const file = worksJson as WorksFile;

export function loadWorks(): Work[] {
  return file.works ?? [];
}

export function loadCategories(): string[] {
  const set = new Set<string>();
  for (const w of loadWorks()) {
    if (w.category) set.add(w.category);
  }
  return Array.from(set).sort();
}

export function loadMeta() {
  return {
    scraped_at: file.scraped_at,
    source: file.source,
    count: file.count ?? loadWorks().length,
  };
}

export function findWork(id: string): Work | undefined {
  return loadWorks().find((w) => w.id === id);
}

export function findWorkIndex(id: string): number {
  return loadWorks().findIndex((w) => w.id === id);
}

export function neighbors(id: string): { prev: Work | null; next: Work | null } {
  const all = loadWorks();
  const idx = all.findIndex((w) => w.id === id);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}

const YEAR_DIGITS = /(\d{4})/;

export function parseYear(year: string | null): number | null {
  if (!year) return null;
  const m = year.match(YEAR_DIGITS);
  return m ? parseInt(m[1], 10) : null;
}

export function decadeFor(year: string | null): string | null {
  const y = parseYear(year);
  if (y == null) return null;
  return `${Math.floor(y / 10) * 10}s`;
}

export type ArtistEntry = { artist: string; count: number; works: Work[] };

export function loadArtists(): ArtistEntry[] {
  const map = new Map<string, Work[]>();
  for (const w of loadWorks()) {
    const a = w.artist?.trim() || "Artist unknown";
    const list = map.get(a) ?? [];
    list.push(w);
    map.set(a, list);
  }
  return Array.from(map.entries())
    .map(([artist, works]) => ({ artist, count: works.length, works }))
    .sort((a, b) => a.artist.localeCompare(b.artist));
}

export type DecadeBucket = { decade: string; count: number; sortKey: number };

export function loadDecades(): DecadeBucket[] {
  const map = new Map<string, number>();
  for (const w of loadWorks()) {
    const d = decadeFor(w.year);
    if (!d) continue;
    map.set(d, (map.get(d) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([decade, count]) => ({
      decade,
      count,
      sortKey: parseInt(decade, 10),
    }))
    .sort((a, b) => a.sortKey - b.sortKey);
}

export type CategoryBucket = { category: string; count: number };

export function loadCategoryBuckets(): CategoryBucket[] {
  const map = new Map<string, number>();
  for (const w of loadWorks()) {
    const c = w.category || "Uncategorized";
    map.set(c, (map.get(c) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

export type MediumBucket = { medium: string; count: number };

export function loadMediumBuckets(limit = 8): MediumBucket[] {
  const map = new Map<string, number>();
  for (const w of loadWorks()) {
    if (!w.medium) continue;
    const key = simplifyMedium(w.medium);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([medium, count]) => ({ medium, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function simplifyMedium(m: string): string {
  const lower = m.toLowerCase();
  if (lower.includes("oil")) return "Oil paint";
  if (lower.includes("watercolor")) return "Watercolor";
  if (lower.includes("gelatin silver")) return "Gelatin silver print";
  if (lower.includes("photograph") || lower.includes("print")) return "Photograph / print";
  if (lower.includes("marble") || lower.includes("bronze") || lower.includes("stone"))
    return "Sculpture";
  if (lower.includes("glass")) return "Glass";
  if (lower.includes("ceramic") || lower.includes("porcelain") || lower.includes("pottery"))
    return "Ceramics";
  if (lower.includes("silver") || lower.includes("gold")) return "Silver / metal";
  if (lower.includes("wood") || lower.includes("furniture")) return "Wood / furniture";
  if (lower.includes("acrylic")) return "Acrylic";
  if (lower.includes("graphite") || lower.includes("ink") || lower.includes("charcoal"))
    return "Drawing";
  return m.split(",")[0].trim();
}

export function searchAndSort(
  works: Work[],
  opts: { q?: string; sort?: string; category?: string; decade?: string; artist?: string }
): Work[] {
  let out = works;

  if (opts.category) {
    out = out.filter((w) => w.category === opts.category);
  }
  if (opts.decade) {
    out = out.filter((w) => decadeFor(w.year) === opts.decade);
  }
  if (opts.artist) {
    out = out.filter((w) => w.artist === opts.artist);
  }
  if (opts.q) {
    const q = opts.q.toLowerCase();
    out = out.filter((w) => {
      const hay = [
        w.title,
        w.artist,
        w.category,
        w.medium,
        w.year,
        w.accession_number,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  switch (opts.sort) {
    case "color":
      return [...out].sort((a, b) => hueOf(a) - hueOf(b));
    case "year-asc":
      return [...out].sort(
        (a, b) => (parseYear(a.year) ?? 9999) - (parseYear(b.year) ?? 9999)
      );
    case "year-desc":
      return [...out].sort(
        (a, b) => (parseYear(b.year) ?? -9999) - (parseYear(a.year) ?? -9999)
      );
    case "artist":
      return [...out].sort((a, b) =>
        (a.artist ?? "zzz").localeCompare(b.artist ?? "zzz")
      );
    case "title":
      return [...out].sort((a, b) => a.title.localeCompare(b.title));
    default:
      return out;
  }
}

export function hueOf(w: Work): number {
  return w.dominant_hsl?.h ?? 9999;
}

export function loadByHue(): Work[] {
  return [...loadWorks()]
    .filter((w) => w.dominant_hsl)
    .sort((a, b) => hueOf(a) - hueOf(b));
}

export function loadHueBuckets(): { bucket: string; count: number; hex: string }[] {
  const map = new Map<string, { count: number; sumHue: number; rep: string }>();
  for (const w of loadWorks()) {
    if (!w.hue_bucket || !w.dominant_hex) continue;
    const cur = map.get(w.hue_bucket) ?? { count: 0, sumHue: 0, rep: w.dominant_hex };
    cur.count += 1;
    cur.sumHue += w.dominant_hsl?.h ?? 0;
    map.set(w.hue_bucket, cur);
  }
  return Array.from(map.entries())
    .map(([bucket, v]) => ({
      bucket,
      count: v.count,
      hex: v.rep,
    }))
    .sort((a, b) => bucketOrder(a.bucket) - bucketOrder(b.bucket));
}

const BUCKET_ORDER = ["red", "orange", "yellow", "green", "teal", "blue", "purple", "pink"];
function bucketOrder(b: string): number {
  const i = BUCKET_ORDER.indexOf(b);
  return i === -1 ? 99 : i;
}

export function pickRandom<T>(arr: T[], n: number, seed = 0): T[] {
  // Deterministic, seed-based pick so SSR == CSR.
  const out: T[] = [];
  const used = new Set<number>();
  let s = seed || 1;
  while (out.length < Math.min(n, arr.length)) {
    s = (s * 1664525 + 1013904223) % 2 ** 32;
    const i = s % arr.length;
    if (!used.has(i)) {
      used.add(i);
      out.push(arr[i]);
    }
  }
  return out;
}
