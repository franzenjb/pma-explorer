import { NextResponse, type NextRequest } from "next/server";
import { loadWorks } from "@/lib/works";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  const works = loadWorks();
  if (works.length === 0) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  const w = works[Math.floor(Math.random() * works.length)];
  return NextResponse.redirect(
    new URL(`/work/${encodeURIComponent(w.id)}`, req.url),
    { status: 307 }
  );
}
