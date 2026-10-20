/** Shared cipher vocabulary: every scramble on the site draws from these sets. */

export const HEX = "0123456789ABCDEF";
export const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
export const CIPHER = HEX + "+/=#%&<>";

export const randomGlyph = (set: string = HEX) => set[(Math.random() * set.length) | 0];

export const randomHex = (bytes: number) => {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
};

/** Real SHA-256 when SubtleCrypto is available (secure contexts); FNV-based fallback otherwise. */
export async function sha256Hex(input: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
    return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
  }
  let out = "";
  for (let r = 0; r < 8; r++) {
    let h = 0x811c9dc5 ^ r;
    for (let i = 0; i < input.length; i++) h = Math.imul(h ^ input.charCodeAt(i), 0x01000193);
    out += (h >>> 0).toString(16).padStart(8, "0");
  }
  return out;
}

/**
 * Animate `from` → `to`, one character locking in at a time, with unresolved
 * characters cycling through cipher glyphs. Calls `onFrame` with the current
 * string; returns a cancel function. Spaces are never scrambled.
 */
export function scrambleTo(
  to: string,
  onFrame: (s: string, done: boolean) => void,
  { duration = 600, set = HEX, fps = 30 }: { duration?: number; set?: string; fps?: number } = {},
) {
  const lock = Array.from(to, (_, i) => (i / Math.max(1, to.length)) * duration * 0.75 + Math.random() * duration * 0.25);
  const start = performance.now();
  const step = 1000 / fps;
  let last = 0;
  let raf = 0;
  const tick = (now: number) => {
    const t = now - start;
    if (now - last >= step || t >= duration) {
      last = now;
      let s = "";
      for (let i = 0; i < to.length; i++) s += to[i] === " " || t >= lock[i] ? to[i] : randomGlyph(set);
      const done = t >= duration;
      onFrame(done ? to : s, done);
      if (done) return;
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
