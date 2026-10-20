"use client";

import { useEffect } from "react";
import { HANDSHAKE_MS } from "@/lib/theme";

/** Disarms the handshake once it has played, so later mounts don't wait for it. */
export function HandshakeDone() {
  useEffect(() => {
    const id = window.setTimeout(() => delete document.documentElement.dataset.handshake, HANDSHAKE_MS + 400);
    return () => clearTimeout(id);
  }, []);
  return null;
}
