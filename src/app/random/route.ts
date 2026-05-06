import { NextResponse } from "next/server";
import { loadWorks } from "@/lib/works";

export const dynamic = "force-dynamic";

export function GET() {
  const works = loadWorks();
  if (works.length === 0) {
    return NextResponse.redirect(new URL("/", "https://pma-explorer.jbf.com"));
  }
  const w = works[Math.floor(Math.random() * works.length)];
  // Use relative redirect — Next resolves it against the request origin.
  return NextResponse.redirect(`/work/${encodeURIComponent(w.id)}`, 307);
}
