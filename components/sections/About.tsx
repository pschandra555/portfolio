import { about, profile } from "@/content/site";
import { Section } from "./Section";
import { DecryptText } from "@/components/text/DecryptText";
import { RedactedStory } from "@/components/dossier/RedactedStory";
import { IdBadge } from "@/components/dossier/IdBadge";
import { Credentials } from "@/components/dossier/Credentials";

/** 01 — DECLASSIFIED FILE. The story arrives redacted and peels open as you read. */
export function About() {
  return (
    <Section id="about">
      <div className="grid gap-x-10 gap-y-14 md:grid-cols-12">
        <h2 id="about-title" className="t-display text-[clamp(3.5rem,12vw,10rem)] md:col-span-12">
          <DecryptText text={about.heading.toUpperCase()} />
        </h2>

        <aside className="md:col-span-4 lg:col-span-3" aria-label="Subject ID badge">
          <div className="mx-auto max-w-[300px] md:sticky md:top-28">
            <IdBadge />
            {/* Mini-CTF 3/3: hiding in plain sight. Base64 is encoding, not encryption. */}
            <p className="t-label mt-8 text-muted">
              ATTACHMENT · INTERCEPTED (BASE64)
              <code className="mt-1 block select-all break-all font-mono normal-case tracking-normal text-ink">
                RkxBR3tiNHMzXzY0XzFzX24wdF8zbmNyeXB0MTBufQ==
              </code>
            </p>
          </div>
        </aside>

        <div className="md:col-span-8 lg:col-span-8 lg:col-start-5">
          <p className="t-label mb-8 flex flex-wrap gap-x-6 gap-y-1 text-muted">
            <span>SUBJECT: {profile.name.toUpperCase()}</span>
            <span>
              REDACTED BY: [<span aria-label="name withheld">████</span>]
            </span>
            <span>STATUS: DECLASSIFYING</span>
          </p>
          <RedactedStory paragraphs={about.story} className="space-y-6 text-lg leading-relaxed md:text-2xl md:leading-snug" />
          <div className="mt-20">
            <Credentials />
          </div>
        </div>
      </div>
    </Section>
  );
}
