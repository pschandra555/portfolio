import { ctfs, links } from "@/content/site";
import { projects } from "@/content/site";
import { Section } from "./Section";
import { DecryptText } from "@/components/text/DecryptText";
import { OperationCard } from "@/components/operations/OperationCard";
import { OperationsStack } from "@/components/operations/OperationsStack";
import { Pending } from "@/components/dossier/Pending";

/** 02 — OPERATIONS. Stacked case files, then the CTF sub-file. */
export function Operations() {
  return (
    <Section id="operations">
      <div className="mb-20 grid gap-6 md:grid-cols-12 md:items-end">
        <h2 id="operations-title" className="t-display text-[clamp(3.5rem,12vw,10rem)] md:col-span-8">
          <DecryptText text="OPERATIONS" />
        </h2>
        <p className="max-w-[40ch] text-muted md:col-span-4">
          Every operation is listed with its real status. Results stay redacted until there are real numbers to show.
        </p>
      </div>

      <OperationsStack>
        {projects.map((p, i) => (
          <OperationCard key={p.slug} project={p} index={i} total={projects.length} />
        ))}
      </OperationsStack>

      <div className="mt-32" aria-labelledby="ctf-title">
        <h3 id="ctf-title" className="t-label mb-6 flex justify-between border-b border-rule pb-2">
          <span>SUB-FILE 02.B — CTF &amp; WRITEUPS</span>
          <span className="text-muted">{ctfs.length} ENGAGEMENTS LOGGED</span>
        </h3>
        {ctfs.length === 0 ? (
          <p className="t-label py-6 text-muted">
            NO ENGAGEMENTS LOGGED YET. FIRST ENTRIES PENDING.
            {links.tryhackme || links.hackthebox ? " TRAINING PROFILES:" : ""}
            {links.tryhackme && (
              <a className="ml-3 underline hover:text-accent-text" href={links.tryhackme} target="_blank" rel="noopener noreferrer me">
                TryHackMe ↗
              </a>
            )}
            {links.hackthebox && (
              <a className="ml-3 underline hover:text-accent-text" href={links.hackthebox} target="_blank" rel="noopener noreferrer me">
                Hack The Box ↗
              </a>
            )}
          </p>
        ) : (
          <table className="w-full font-mono text-sm">
            <thead className="t-label text-left text-muted">
              <tr>
                <th className="py-2 font-normal">Event</th>
                <th className="py-2 font-normal">Date</th>
                <th className="hidden py-2 font-normal sm:table-cell">Team</th>
                <th className="py-2 font-normal">Rank</th>
                <th className="py-2 text-right font-normal">Writeup</th>
              </tr>
            </thead>
            <tbody>
              {ctfs.map((c) => (
                <tr key={c.event + c.date} className="border-t border-rule">
                  <td className="py-3">{c.event}</td>
                  <td className="py-3"><Pending value={c.date} /></td>
                  <td className="hidden py-3 sm:table-cell">{c.team ?? "solo"}</td>
                  <td className="py-3"><Pending value={c.rank} /></td>
                  <td className="py-3 text-right">
                    {c.writeupUrl ? (
                      <a href={c.writeupUrl} className="underline hover:text-accent-text" target="_blank" rel="noopener noreferrer">
                        Read ↗
                      </a>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Section>
  );
}
