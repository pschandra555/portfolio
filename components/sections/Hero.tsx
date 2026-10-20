import { hero, profile } from "@/content/site";
import { DecryptText } from "@/components/text/DecryptText";
import { Stamp } from "@/components/dossier/Stamp";
import { Barcode } from "@/components/dossier/Barcode";
import { CipherField } from "@/components/hero/CipherField";
import { ClearanceBadge } from "@/components/hero/ClearanceBadge";

/**
 * 00 — CIPHERTEXT. The name is real HTML (it's the LCP element) and decrypts
 * on load. Once the page is idle, the cipher field loads behind it and the
 * letterforms resolve into amber glyphs.
 */
export function Hero() {
  return (
    <section
      id="top"
      data-section="top"
      aria-labelledby="top-title"
      data-cursor="Decrypt"
      data-cursor-mode="lens"
      className="hero relative z-10 flex min-h-svh flex-col justify-between px-[var(--gutter)] pb-20 pt-24 outline-none md:pt-28"
    >
      <CipherField />

      <p className="t-label max-w-[44ch] text-muted">
        <span className="text-ink">[{hero.kicker.toUpperCase()}]</span>
        <br />
        CASE #{profile.caseNo} · ORIGIN: {profile.location.toUpperCase()}
      </p>

      <div className="relative">
        <h1 id="top-title" className="t-display text-[clamp(4.5rem,22vw,21rem)]">
          <DecryptText as="span" className="block" text={profile.firstName.toUpperCase()} trigger="mount" duration={1100} />
          <DecryptText
            as="span"
            className="block pl-[6vw] md:pl-[12vw]"
            text={profile.lastName.toUpperCase()}
            trigger="mount"
            delay={180}
            duration={1200}
          />
        </h1>
        <div aria-hidden="true" className="pointer-events-none absolute right-[4vw] top-[8%] hidden sm:block">
          <Stamp tone="stamp" size="lg" rotate={-7}>
            Classified
          </Stamp>
        </div>
      </div>

      {/* What the decryption lens reveals, as real text for screen readers and search engines. */}
      <div className="sr-only">
        <h2>Decrypted notes on the subject</h2>
        <ul>
          {hero.lensLines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </div>

      <div className="grid gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-6 lg:col-span-5">
          <p className="text-lg leading-snug md:text-xl">
            {profile.role}: {profile.focus.join(", ").replace(/, (?=[^,]*$)/, " and ")}.{" "}
            <span className="decrypted">{profile.motto}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 md:col-span-6 md:justify-end lg:col-span-7">
          <ClearanceBadge />
          <div className="hidden items-end gap-2 md:flex">
            <Barcode value={profile.caseNo} />
            <span className="t-label text-muted">{profile.caseNo}</span>
          </div>
        </div>
      </div>

      <p className="t-label absolute bottom-16 left-1/2 hidden -translate-x-1/2 text-muted xl:block" aria-hidden="true">
        <span className="pointer-fine:inline hidden">MOVE TO DECRYPT · </span>SCROLL TO RE-KEY ↓
      </p>
    </section>
  );
}
