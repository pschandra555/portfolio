import { Section } from "./Section";
import { InterrogateChat } from "./InterrogateChat";
import { DecryptText } from "@/components/text/DecryptText";

/** 05 — INTERROGATE THE FILE. Ask questions; the file answers from the record only. */
export function Interrogate() {
  return (
    <Section id="interrogate">
      <div className="mb-12 grid gap-6 md:grid-cols-12 md:items-end">
        <h2 id="interrogate-title" className="t-display text-[clamp(3.5rem,12vw,10rem)] md:col-span-8">
          <DecryptText text="INTERROGATE" />
        </h2>
        <p className="max-w-[40ch] text-muted md:col-span-4">
          Ask the file anything about the subject. It answers only from this dossier, and it won&apos;t claim a certification or
          a launch the record doesn&apos;t prove.
        </p>
      </div>
      <InterrogateChat />
    </Section>
  );
}
