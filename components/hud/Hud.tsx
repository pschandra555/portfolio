"use client";

import { useEffect, useState } from "react";
import { sections, type Classification, type ThreatLevel } from "@/content/site";
import { useDossier } from "@/lib/scroll/store";
import { useSessionId } from "@/lib/session";
import { sha256Hex } from "@/lib/cipher";
import { ScrambleValue } from "@/components/text/ScrambleValue";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { IndexButton } from "@/components/ui/IndexButton";
import { SessionClock } from "./SessionClock";

const LEVELS: Classification[] = ["TOP SECRET", "SECRET", "CONFIDENTIAL", "RESTRICTED", "DECLASSIFIED"];
const THREATS: ThreatLevel[] = ["HIGH", "ELEVATED", "GUARDED", "LOW", "NONE"];

/**
 * The persistent heads-up display. Four corners of fixed mono text that
 * report how far the visitor has decrypted the file.
 * Purely informational: it's not a live region, so it never interrupts a screen reader.
 */
export function Hud() {
  const progress = useDossier((s) => s.progress);
  const sectionId = useDossier((s) => s.section);
  const section = sections.find((s) => s.id === sectionId) ?? sections[0];
  const open = section.classification === "DECLASSIFIED";
  const level = LEVELS.indexOf(section.classification);
  const threat = THREATS.indexOf(section.threat);

  return (
    <aside aria-label="Dossier status" className="t-label pointer-events-none fixed inset-0 z-40 select-none">
      {/* top */}
      <div className="pointer-events-auto absolute inset-x-0 top-0 flex items-start justify-between gap-4 bg-gradient-to-b from-bg via-bg/80 to-transparent px-[var(--gutter)] pb-6 pt-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="flex items-center gap-2 whitespace-nowrap">
            {open ? (
              <span className="decrypted flex items-center gap-2">
                <span aria-hidden="true" className="inline-block size-1.5 animate-pulse rounded-full bg-accent" />
                <ScrambleValue value="CHANNEL OPEN" />
              </span>
            ) : (
              <>
                <span className="text-muted">
                  <span className="hidden sm:inline">CLASSIFICATION:</span>
                  <span className="sm:hidden">CLASS:</span>
                </span>
                <ScrambleValue value={section.classification} />
              </>
            )}
          </p>
          {/* TOP SECRET → DECLASSIFIED track */}
          <ol aria-hidden="true" className="hidden items-center gap-1 sm:flex">
            {LEVELS.map((l, i) => (
              <li
                key={l}
                className={`h-[3px] w-6 ${i <= level ? "bg-accent" : "bg-rule"}`}
                style={{ transition: "background-color var(--dur-med) var(--ease-decrypt)" }}
              />
            ))}
            <li className="ml-1 text-[10px] text-muted">→ DECLASSIFIED</li>
          </ol>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex flex-col items-end gap-1.5">
            <p className="whitespace-nowrap">
              <span className="hidden text-muted sm:inline">DECRYPTED </span>
              <span className="decrypted tabular-nums">{String(Math.round(progress * 100)).padStart(3, "0")}%</span>
            </p>
            <SectionHash sectionId={section.id} />
          </div>
          <IndexButton />
          <ThemeToggle />
        </div>
      </div>

      {/* bottom */}
      <div className="pointer-events-auto absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-bg via-bg/80 to-transparent px-[var(--gutter)] pb-3 pt-6">
        <div className="flex items-center gap-3">
          <SessionClock />
          <SoundToggle />
        </div>
        <p className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-muted">
            <span className="hidden sm:inline">THREAT LEVEL</span>
            <span className="sm:hidden">THREAT</span>
          </span>
          <span aria-hidden="true" className="flex items-end gap-[2px]">
            {THREATS.slice(0, 4).map((t, i) => (
              <span
                key={t}
                className={`w-[3px] ${i < 4 - threat ? "bg-ink" : "bg-rule"}`}
                style={{ height: 4 + (4 - i) * 2, transition: "background-color var(--dur-med) var(--ease-decrypt)" }}
              />
            ))}
          </span>
          <ScrambleValue value={section.threat} className={section.threat === "NONE" ? "decrypted" : undefined} />
        </p>
      </div>
    </aside>
  );
}

/** Rolling SHA-256 of (session, section): re-keys every time you enter a new file. */
function SectionHash({ sectionId }: { sectionId: string }) {
  const session = useSessionId();
  const [hash, setHash] = useState("0".repeat(64));

  useEffect(() => {
    let alive = true;
    sha256Hex(`${session}:${sectionId}`).then((h) => alive && setHash(h));
    return () => {
      alive = false;
    };
  }, [session, sectionId]);

  return (
    <p className="hidden whitespace-nowrap text-muted md:block">
      SHA-256 <ScrambleValue value={`${hash.slice(0, 8)}…${hash.slice(-8)}`} duration={650} />
    </p>
  );
}
