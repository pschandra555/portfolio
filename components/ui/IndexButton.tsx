"use client";

import { overlays } from "@/lib/overlays";

/** Visible way into the ⌘K file index (essential on touch devices). */
export function IndexButton() {
  return (
    <button
      type="button"
      onClick={() => overlays.open("palette")}
      aria-label="Open file index (Command K)"
      aria-haspopup="dialog"
      className="t-label inline-flex min-h-6 items-center gap-1.5 border border-rule px-2 py-1 hover:border-accent-text hover:text-accent-text"
    >
      INDEX<kbd className="hidden font-mono text-muted sm:inline">⌘K</kbd>
    </button>
  );
}
