"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Group = {
  heading: string;
  rows: Array<{ keys: string[]; label: string }>;
};

const GROUPS: Group[] = [
  {
    heading: "Global",
    rows: [
      { keys: ["⌘", "K"], label: "Open command palette" },
      { keys: ["/"], label: "Open command palette" },
      { keys: ["?"], label: "Show this help" },
      { keys: ["Esc"], label: "Close any modal" },
    ],
  },
  {
    heading: "Go to (press g, then letter)",
    rows: [
      { keys: ["g", "h"], label: "Home / collection" },
      { keys: ["g", "c"], label: "Color of Maine" },
      { keys: ["g", "a"], label: "Artists A→Z" },
      { keys: ["g", "x"], label: "Compare" },
      { keys: ["g", "d"], label: "Daily Painting" },
      { keys: ["g", "s"], label: "Stats" },
    ],
  },
  {
    heading: "On a work page",
    rows: [
      { keys: ["j"], label: "Next work" },
      { keys: ["→"], label: "Next work" },
      { keys: ["k"], label: "Previous work" },
      { keys: ["←"], label: "Previous work" },
      { keys: ["Esc"], label: "Back to collection" },
    ],
  },
];

const ROUTES: Record<string, string> = {
  h: "/",
  c: "/color",
  a: "/artists",
  x: "/compare",
  d: "/daily",
  s: "/stats",
};

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (el.isContentEditable) return true;
  return false;
}

export function KeyboardShortcuts() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const leaderRef = useRef<number | null>(null);
  const armedRef = useRef(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      // ?  → open help. Shift+/ on US keyboards.
      if (e.key === "?") {
        e.preventDefault();
        setOpen(true);
        return;
      }

      // Two-key leader sequence: g, then h/c/a/x/d/s
      if (armedRef.current) {
        const target = ROUTES[e.key.toLowerCase()];
        armedRef.current = false;
        if (leaderRef.current) {
          window.clearTimeout(leaderRef.current);
          leaderRef.current = null;
        }
        if (target) {
          e.preventDefault();
          router.push(target);
        }
        return;
      }

      if (e.key === "g") {
        armedRef.current = true;
        if (leaderRef.current) window.clearTimeout(leaderRef.current);
        leaderRef.current = window.setTimeout(() => {
          armedRef.current = false;
          leaderRef.current = null;
        }, 900);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (leaderRef.current) window.clearTimeout(leaderRef.current);
    };
  }, [router]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 w-8 items-center justify-center border border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="size-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl border border-border bg-card p-0">
          <div className="border-b border-border px-6 py-4">
            <DialogHeader>
              <DialogTitle className="font-headline text-xl tracking-tight">
                Keyboard shortcuts
              </DialogTitle>
              <DialogDescription className="text-[12px] text-muted-foreground">
                Built for keyboard-first browsing of the collection.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="grid gap-6 px-6 py-5 sm:grid-cols-2">
            {GROUPS.map((g) => (
              <section key={g.heading}>
                <h3 className="font-data text-[10px] uppercase tracking-[0.22em] text-primary">
                  {g.heading}
                </h3>
                <ul className="mt-3 space-y-2">
                  {g.rows.map((r, i) => (
                    <li
                      key={`${r.label}-${i}`}
                      className="flex items-center justify-between gap-3 text-[13px]"
                    >
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className="flex items-center gap-1">
                        {r.keys.map((k, idx) => (
                          <kbd
                            key={`${k}-${idx}`}
                            className="inline-flex min-w-[1.6em] items-center justify-center border border-border bg-background px-1.5 py-0.5 font-data text-[11px]"
                          >
                            {k}
                          </kbd>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <div className="border-t border-border px-6 py-3 font-data text-[11px] text-muted-foreground">
            Press <kbd className="border border-border bg-background px-1">?</kbd> any
            time to reopen this panel.
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
