import { createHash } from "node:crypto";

/**
 * Fixed-window rate limiting for the chat API.
 * - Upstash Redis (REST) when UPSTASH_REDIS_REST_URL / _TOKEN are set: shared
 *   across all serverless instances, survives cold starts.
 * - Otherwise an in-memory map: fine for local dev and a light backstop on
 *   Vercel (per instance only).
 * IPs are hashed before they're used as keys; raw addresses are never stored.
 */

export interface Limit {
  name: string;
  max: number;
  windowSec: number;
}
export interface LimitResult {
  ok: boolean;
  retryAfter: number;
}

const memory = new Map<string, { count: number; reset: number }>();

const hashId = (id: string) => createHash("sha256").update(`sc-dossier:${id}`).digest("hex").slice(0, 24);

async function hitUpstash(key: string, windowSec: number): Promise<number | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, String(windowSec + 5)],
      ]),
      signal: AbortSignal.timeout(1500),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result: number }[];
    return Number(data[0]?.result ?? 0);
  } catch {
    return null; // fall back to memory rather than failing open on every request
  }
}

function hitMemory(key: string, windowSec: number, now: number) {
  if (memory.size > 5000) for (const [k, v] of memory) if (v.reset < now) memory.delete(k);
  const e = memory.get(key);
  if (!e || e.reset < now) {
    memory.set(key, { count: 1, reset: now + windowSec * 1000 });
    return 1;
  }
  e.count++;
  return e.count;
}

export async function rateLimit(id: string, limits: Limit[]): Promise<LimitResult> {
  const now = Date.now();
  const who = hashId(id);
  for (const l of limits) {
    const window = Math.floor(now / (l.windowSec * 1000));
    const key = `rl:${l.name}:${who}:${window}`;
    const count = (await hitUpstash(key, l.windowSec)) ?? hitMemory(key, l.windowSec, now);
    if (count > l.max) {
      const retryAfter = Math.ceil(((window + 1) * l.windowSec * 1000 - now) / 1000);
      return { ok: false, retryAfter };
    }
  }
  return { ok: true, retryAfter: 0 };
}
