import { buildEvents } from "@/lib/events";
import { Section } from "./Section";
import { SiemLog } from "./SiemLog";
import { DecryptText } from "@/components/text/DecryptText";

/** 04 — INCIDENT TIMELINE. The journey, logged like a SIEM. */
export function Timeline() {
  return (
    <Section id="timeline">
      <div className="mb-12 grid gap-6 md:grid-cols-12 md:items-end">
        <h2 id="timeline-title" className="t-display text-[clamp(3.5rem,12vw,10rem)] md:col-span-8">
          <DecryptText text="INCIDENT TIMELINE" />
        </h2>
        <p className="max-w-[40ch] text-muted md:col-span-4">
          Education, certifications, CTFs and projects, logged as events. Certifications show their real status: scheduled
          isn&apos;t earned.
        </p>
      </div>
      <SiemLog events={buildEvents()} />
    </Section>
  );
}
