"use client";

import { useEffect } from "react";
import { dossier } from "@/lib/scroll/store";

/**
 * Reports which file is under the viewport's centre line to the HUD.
 * Mounted per page, so it re-scans whenever a page (re)appears.
 * Pass `pin` on pages without sections (e.g. a case file) to hold one value.
 */
export function SectionTracker({ pin }: { pin?: string }) {
  useEffect(() => {
    if (pin) {
      dossier.set({ section: pin });
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) dossier.set({ section: (e.target as HTMLElement).dataset.section! });
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    document.querySelectorAll<HTMLElement>("[data-section]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pin]);
  return null;
}
