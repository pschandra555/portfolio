"use client";

import { useSyncExternalStore } from "react";
import { sha256Hex } from "@/lib/cipher";

/**
 * The mini-CTF. Three flags are hidden on the site:
 *   1. in the HTML source (a comment, see app/layout.tsx)
 *   2. in the browser console, ROT13'd (components/overlays/ConsoleBanner.tsx)
 *   3. on the page, base64-encoded (components/sections/About.tsx)
 *
 * The client only knows SHA-256 hashes, so grepping the JS bundle for
 * "FLAG{" finds nothing. To change a flag, edit it in all three places and
 * regenerate its hash with:  node scripts/flag-hash.mjs 'FLAG{...}'
 */
export const FLAGS = [
  { id: "source", label: "View source", sha256: "77e2410759b5cf6b48d7a9c79742509f5f96ee99b8b1be3c90c7de213b754f87" },
  { id: "console", label: "Console", sha256: "ffd45daffa439851533474d64eebf5272a52ff7344f9cf1e1059323d93f71a0a" },
  { id: "base64", label: "Plain sight", sha256: "fbe569e30d012fd778e24705ae8c609eaaf92f151a8ff4551e1429a97e0bec38" },
] as const;

export const FLAG_HINTS = [
  "1/3: Every page has a source. Some comments were never meant for you.",
  "2/3: The console has something to say, but it's been rotated by 13.",
  "3/3: Something on the page looks like noise. Base64 isn't encryption.",
];

const KEY = "sc-flags";
let found: string[] = [];
let loaded = false;
const listeners = new Set<() => void>();

const load = () => {
  if (loaded) return found;
  loaded = true;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    found = Array.isArray(raw) ? raw.filter((x) => FLAGS.some((f) => f.id === x)) : [];
  } catch {
    found = [];
  }
  return found;
};

export type SubmitResult = { status: "invalid-format" | "wrong" | "duplicate" | "accepted"; label?: string; count: number; total: number };

export async function submitFlag(input: string): Promise<SubmitResult> {
  const list = load();
  const total = FLAGS.length;
  const flag = input.trim();
  // Bound the input before hashing anything.
  if (flag.length > 80 || !/^FLAG\{[\x21-\x7E]{1,64}\}$/.test(flag)) return { status: "invalid-format", count: list.length, total };
  const h = await sha256Hex(flag);
  const hit = FLAGS.find((f) => f.sha256 === h);
  if (!hit) return { status: "wrong", count: list.length, total };
  if (list.includes(hit.id)) return { status: "duplicate", label: hit.label, count: list.length, total };
  found = [...list, hit.id];
  try {
    localStorage.setItem(KEY, JSON.stringify(found));
  } catch {}
  listeners.forEach((l) => l());
  return { status: "accepted", label: hit.label, count: found.length, total };
}

export const flagProgress = () => load().length;

export function useFlagCount() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => load().length,
    () => 0,
  );
}
