"use client";
import { useSyncExternalStore } from "react";
import { randomHex } from "@/lib/cipher";

const KEY = "sc-session";
let cached: string | null = null;

/** A per-tab session id, e.g. "9F2A41C7". Stable for the browser session. */
function read() {
  if (cached) return cached;
  try {
    cached = sessionStorage.getItem(KEY);
    if (!cached) {
      cached = randomHex(4);
      sessionStorage.setItem(KEY, cached);
    }
  } catch {
    cached = randomHex(4);
  }
  return cached;
}

const noop = () => () => {};

export function useSessionId() {
  return useSyncExternalStore(noop, read, () => "········");
}
