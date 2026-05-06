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
