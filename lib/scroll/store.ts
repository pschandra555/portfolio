"use client";
import { useSyncExternalStore } from "react";
import { sections } from "@/content/site";

/**
 * Global decryption state. Scroll progress *is* decryption progress:
 * the HUD, cipher field and section reveals all read from here.
 */
export interface DossierState {
  /** 0..1 page scroll progress. */
  progress: number;
  /** id of the section crossing the viewport's centre line. */
  section: string;
}

let state: DossierState = { progress: 0, section: sections[0].id };
const listeners = new Set<() => void>();

export const dossier = {
  get: () => state,
  set(patch: Partial<DossierState>) {
    const next = { ...state, ...patch };
    if (next.progress === state.progress && next.section === state.section) return;
    state = next;
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

const serverState: DossierState = { progress: 0, section: sections[0].id };

export function useDossier<T>(select: (s: DossierState) => T): T {
  return useSyncExternalStore(
    dossier.subscribe,
    () => select(state),
    () => select(serverState),
  );
}
