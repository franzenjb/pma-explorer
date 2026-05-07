"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavItem = { href: string; label: string };

type Props = {
  nav: NavItem[];
  worksCount: number;
  artistsCount: number;
};

export function MobileMenu({ nav, worksCount, artistsCount }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-9 border border-border lg:hidden"
            aria-label="Open menu"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[88vw] max-w-md overflow-y-auto p-0">
        <SheetHeader className="border-b border-border bg-card px-6 py-5">
          <SheetTitle className="font-headline text-2xl font-semibold uppercase tracking-tight">
            PMA Explorer
          </SheetTitle>
          <SheetDescription className="font-data text-[11px] uppercase tracking-[0.18em] text-primary">
            Portland Museum of Art · Demo
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-6 py-6">
          <p className="text-[14px] leading-6 text-muted-foreground">
            A demonstration index of the museum&rsquo;s public collection.{" "}
            <span className="font-data text-foreground">{worksCount}</span> works
            ·{" "}
            <span className="font-data text-foreground">{artistsCount}</span>{" "}
            artists.
          </p>

          <hr className="rule-red" />

          <nav className="grid gap-1">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-border py-3 text-[14px] uppercase tracking-[0.12em] hover:text-primary"
              >
                <span>{n.label}</span>
                <span aria-hidden className="text-muted-foreground">
                  →
                </span>
              </Link>
            ))}
            <a
              href="https://www.portlandmuseum.org/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between border-b border-border py-3 text-[14px] uppercase tracking-[0.12em] text-muted-foreground hover:text-primary"
            >
              <span>portlandmuseum.org</span>
              <span aria-hidden>↗</span>
            </a>
          </nav>

          <p className="font-data text-[11px] text-muted-foreground">
            Built for the leadership demo. Questions →{" "}
            <a className="hover:text-primary" href="mailto:jbf@jbf.com">
              jbf@jbf.com
            </a>
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
