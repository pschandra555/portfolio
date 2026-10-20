import { profile } from "@/content/site";
import { HEX } from "@/lib/cipher";
import { HandshakeDone } from "./HandshakeDone";

/**
 * 00 — HANDSHAKE. A fake TLS handshake that runs before the dossier opens.
 *
 * Pure CSS on purpose: it starts on the very first paint, before any JS has
 * loaded, and dismisses itself after ~1.45s even if JS never arrives. It only
 * shows when the inline boot script sets html[data-handshake]: first visit of
 * the session, home page, motion allowed. The hero underneath is painted the
 * whole time, so it doesn't delay LCP.
 */

const LOG: [string, string, string][] = [
  ["→", "ClientHello", "TLS 1.3 · x25519 · AES_256_GCM_SHA384"],
  ["←", "ServerHello", "cipher suite accepted"],
  ["←", "Certificate", `CN=${profile.name.toUpperCase()} · CASE ${profile.caseNo}`],
  ["⇄", "Key exchange", "ECDHE x25519 · shared secret derived"],
  ["✓", "Finished", "transcript hash verified"],
];

// Deterministic "random" glyphs so server and client markup always match.
const glyphsFor = (i: number, n: number) =>
  Array.from({ length: n }, (_, k) => HEX[(i * 7 + k * 11 + ((i * k) % 5)) % HEX.length]);

export function Handshake() {
  const name = profile.name.toUpperCase();
  return (
    <div className="handshake" aria-hidden="true">
      <HandshakeDone />
      <div className="mx-[var(--gutter)] flex w-full max-w-5xl flex-col gap-10">
        <ol className="t-label space-y-1.5 text-muted">
          <li className="hs-line text-ink" style={{ "--i": 0 } as React.CSSProperties}>
            $ openssl s_client -connect dossier.sc:443
          </li>
          {LOG.map(([dir, step, detail], i) => (
            <li key={step} className="hs-line flex gap-3" style={{ "--i": i + 1 } as React.CSSProperties}>
              <span className="w-3 text-accent-text">{dir}</span>
              <span className="w-28 shrink-0 text-ink">{step}</span>
              <span className="truncate">{detail}</span>
            </li>
          ))}
          <li className="hs-line decrypted pt-2" style={{ "--i": LOG.length + 1 } as React.CSSProperties}>
            ■ SESSION ESTABLISHED
          </li>
        </ol>

        <p className="t-display text-[clamp(3.5rem,13vw,11rem)] leading-none">
          {Array.from(name).map((ch, i) =>
            ch === " " ? (
              <span key={i}> </span>
            ) : (
              <span key={i} className="hs-reel">
                <span className="hs-strip" style={{ "--n": 6, "--d": `${200 + i * 45}ms` } as React.CSSProperties}>
                  {glyphsFor(i, 6).map((g, k) => (
                    <span key={k} className="text-accent-text">
                      {g}
                    </span>
                  ))}
                  <span>{ch}</span>
                </span>
              </span>
            ),
          )}
        </p>

        <div className="t-label flex items-end justify-between text-muted">
          <span>DECRYPTING DOSSIER</span>
          <span className="hs-count text-[clamp(2rem,6vw,4rem)] leading-none text-ink tabular-nums" />
        </div>
        <div className="h-px w-full bg-rule">
          <div className="hs-bar h-px bg-accent" />
        </div>
      </div>
    </div>
  );
}
