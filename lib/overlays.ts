"use client";

import { useSyncExternalStore } from "react";
import { getLenis } from "@/lib/scroll/lenis";

export type Overlay = "palette" | "terminal" | null;

let current: Overlay = null;
const listeners = new Set<() => void>();

/** One overlay at a time (⌘K file index or the ` terminal). Pauses smooth scroll while open. */
export const overlays = {
  get: () => current,
  open(o: Exclude<Overlay, null>) {
    current = o;
    getLenis()?.stop();
    listeners.forEach((l) => l());
  },
  close() {
    current = null;
    getLenis()?.start();
    listeners.forEach((l) => l());
  },
  toggle(o: Exclude<Overlay, null>) {
    if (current === o) this.close();
    else this.open(o);
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useOverlay() {
  return useSyncExternalStore(overlays.subscribe, overlays.get, () => null);
}
