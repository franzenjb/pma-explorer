"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  prevHref: string | null;
  nextHref: string | null;
  homeHref?: string;
};

export function WorkKeys({ prevHref, nextHref, homeHref = "/" }: Props) {
  const router = useRouter();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "j" || e.key === "ArrowRight") {
        if (nextHref) {
          e.preventDefault();
          router.push(nextHref);
        }
      } else if (e.key === "k" || e.key === "ArrowLeft") {
        if (prevHref) {
          e.preventDefault();
          router.push(prevHref);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        router.push(homeHref);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevHref, nextHref, homeHref, router]);
  return null;
}
