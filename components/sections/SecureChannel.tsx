import { contact, links, profile } from "@/content/site";
import { Section } from "./Section";
import { CopyEmail } from "./CopyEmail";
import { DecryptText } from "@/components/text/DecryptText";
import { Magnetic } from "@/components/ui/Magnetic";
import { Pending } from "@/components/dossier/Pending";
import { Barcode } from "@/components/dossier/Barcode";

/** 06 — SECURE CHANNEL. Threat level hits NONE; the channel opens. */
export function SecureChannel() {
  const primary = links.email ? `mailto:${links.email}` : (links.linkedin ?? links.github);
  const channels = [
    { label: "GitHub", href: links.github },
    { label: "LinkedIn", href: links.linkedin },
    { label: "TryHackMe", href: links.tryhackme },
    { label: "Hack The Box", href: links.hackthebox },
    { label: "Résumé (PDF)", href: links.resume },
  ];

  return (
    <Section id="contact" className="flex min-h-svh flex-col">
      <p className="t-label mb-10 flex items-center gap-2">
        <span aria-hidden="true" className="inline-block size-1.5 animate-pulse rounded-full bg-accent" />
        <span className="decrypted">CHANNEL OPEN</span>
        <span className="text-muted">· THREAT LEVEL: NONE · ENCRYPTION: END-TO-END</span>
      </p>

      <h2 id="contact-title" className="sr-only">
        {contact.heading}
      </h2>
      <Magnetic strength={0.22} radius={200}>
        <a
          href={primary}
          target={primary.startsWith("http") ? "_blank" : undefined}
          rel={primary.startsWith("http") ? "noopener noreferrer me" : undefined}
          className="group block"
        >
          <DecryptText
            text={contact.heading.toUpperCase()}
            className="t-display decrypted block text-[clamp(5rem,22vw,22rem)] transition-[letter-spacing] duration-500 group-hover:tracking-[0.02em]"
          />
          <span className="sr-only">
            {links.email ? ` by email` : links.linkedin ? " on LinkedIn" : " on GitHub"}
          </span>
        </a>
      </Magnetic>

      <div className="mt-12 grid gap-12 md:grid-cols-12">
        <div className="space-y-8 md:col-span-7">
          <p className="max-w-[48ch] text-lg md:text-xl">{contact.intro}</p>
          <div>
            <p className="t-label mb-3 text-muted">SECURE ADDRESS</p>
            {links.email ? <CopyEmail email={links.email} /> : <Pending value={null} />}
          </div>
        </div>
        <div className="md:col-span-4 md:col-start-9">
          <p className="t-label mb-3 text-muted">OTHER CHANNELS</p>
          <ul className="border-t border-rule">
            {channels.map((c) => (
              <li key={c.label} className="flex items-center justify-between border-b border-rule py-3">
                <span>{c.label}</span>
                {c.href ? (
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer me"
                    className="t-label underline hover:text-accent-text"
                  >
                    Open ↗<span className="sr-only"> {c.label}</span>
                  </a>
                ) : (
                  <Pending value={null} />
                )}
              </li>
            ))}
            <li className="flex items-center justify-between border-b border-rule py-3">
              <span>PGP public key</span>
              {links.pgp ? (
                <a href={links.pgp} className="t-label underline hover:text-accent-text">
                  Fetch key ↗
                </a>
              ) : (
                <Pending value={null} />
              )}
            </li>
          </ul>
        </div>
      </div>

      <footer className="t-label mt-auto flex flex-wrap items-end justify-between gap-6 border-t border-rule pb-16 pt-8 text-muted">
        <div className="flex items-end gap-3">
          <Barcode value={profile.caseNo + "EOF"} />
          <span>END OF FILE · CASE #{profile.caseNo}</span>
        </div>
        <span>
          Built by {profile.name}.{" "}
          <a href={links.github} className="underline hover:text-accent-text" target="_blank" rel="noopener noreferrer">
            Source ↗
          </a>
        </span>
      </footer>
    </Section>
  );
}
