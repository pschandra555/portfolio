import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isPending, profile, projects } from "@/content/site";
import { CaseHeader } from "@/components/operations/CaseHeader";
import { CrtFeed } from "@/components/operations/CrtFeed";
import { opNumber } from "@/components/operations/status";
import { Pending } from "@/components/dossier/Pending";
import { FoldMarks } from "@/components/dossier/FoldMarks";
import { Barcode } from "@/components/dossier/Barcode";
import { SectionTracker } from "@/components/providers/SectionTracker";
import { ScrambleOnHover } from "@/components/text/ScrambleOnHover";
import { PageTransition } from "@/components/transitions/PageTransition";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/operations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) return {};
  const title = `Operation ${p.codename}`;
  const description = `${p.tagline} ${p.objective}`;
  return {
    title,
    description,
    alternates: { canonical: `/operations/${p.slug}` },
    openGraph: { type: "article", title, description, url: `/operations/${p.slug}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-rule py-10 md:grid-cols-12">
      <h2 className="t-label text-muted md:col-span-3">{label}</h2>
      <div className="md:col-span-9">{children}</div>
    </section>
  );
}

/**
 * The case file reads URL params, so it sits behind Suspense (Next 16 partial
 * prefetching). Links into it use prefetch={true}, and every slug is
 * prerendered, so in practice the fallback is never seen and the folder
 * morphs straight into the page.
 */
export default function CaseFilePage({ params }: PageProps<"/operations/[slug]">) {
  return (
    <PageTransition>
      <Suspense fallback={<div className="min-h-svh" aria-busy="true" />}>
        <CaseFile params={params} />
      </Suspense>
    </PageTransition>
  );
}

async function CaseFile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  const p = projects[index];
  const next = projects[(index + 1) % projects.length];
  const linkList = [
    { label: "Source repository", href: p.links.repo },
    { label: "Live demo", href: p.links.demo },
    { label: "Writeup", href: p.links.writeup },
  ];

  return (
    <article className="relative z-10 mx-[var(--gutter)] pb-40 pt-28" aria-labelledby={`op-${p.slug}-title`}>
      <SectionTracker pin="operations" />
      <FoldMarks />

      <nav aria-label="Breadcrumb" className="t-label mb-16 flex flex-wrap items-center justify-between gap-4 text-muted">
        <Link href="/#operations" transitionTypes={["redact"]} className="hover:text-accent-text">
          <span aria-hidden="true">← </span>
          <ScrambleOnHover text="Back to operations" />
        </Link>
        <span>
          CASE #{profile.caseNo} / {opNumber(index)}
        </span>
      </nav>

      <div className="border border-rule bg-raised px-5 pb-10 pt-12 md:px-12">
        <CaseHeader project={p} index={index} as="h1" large />
        <p className="mt-8 max-w-[44ch] text-2xl leading-snug md:text-3xl">{p.tagline}</p>
      </div>

      <div className="mt-16 md:px-12">
        <Block label="[01] OBJECTIVE">
          <p className="max-w-[62ch] text-lg md:text-xl">{p.objective}</p>
        </Block>
        <Block label="[02] RECON / PROBLEM">
          <p className="max-w-[62ch] text-lg md:text-xl">{p.recon}</p>
        </Block>
        <Block label="[03] APPROACH">
          <ol className="max-w-[62ch] space-y-4 text-lg">
            {p.approach.map((a, i) => (
              <li key={i} className="grid grid-cols-[2.5rem_1fr]">
                <span className="t-label pt-1.5 text-accent-text">{String(i + 1).padStart(2, "0")}</span>
                <span>{a}</span>
              </li>
            ))}
          </ol>
        </Block>
        <Block label="[04] STACK">
          <ul className="t-label flex flex-wrap gap-2">
            {p.stack.map((s) => (
              <li key={s} className="border border-rule px-2 py-1">
                {s}
              </li>
            ))}
          </ul>
        </Block>
        <Block label="[05] RESULTS">
          <dl className="grid gap-6 sm:grid-cols-3">
            {p.results.map((r) => (
              <div key={r.label} className="border-l border-rule pl-4">
                <dt className="t-label text-muted">{r.label}</dt>
                <dd className="t-display mt-2 text-5xl">
                  <Pending value={r.value} />
                </dd>
              </div>
            ))}
          </dl>
          {p.results.every((r) => isPending(r.value)) && (
            <p className="t-label mt-6 text-muted">No numbers yet. They&apos;ll appear here once they&apos;re measured, not before.</p>
          )}
        </Block>
        <Block label="[06] STATUS">
          <p className="t-label mb-6">
            ETA: {isPending(p.eta) ? <span className="text-muted">[PENDING DATA]</span> : p.eta}
          </p>
          <ol className="space-y-2">
            {p.roadmap.map((r, i) => (
              <li key={i} className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={`grid size-4 place-items-center border text-[10px] ${r.done ? "border-accent bg-accent text-accent-ink" : "border-rule"}`}
                >
                  {r.done ? "✓" : ""}
                </span>
                <span className={r.done ? "" : "text-muted"}>{r.step}</span>
                <span className="sr-only">{r.done ? "(done)" : "(not started)"}</span>
              </li>
            ))}
          </ol>
        </Block>
        <Block label="[07] EVIDENCE">
          <div className="grid gap-8 md:grid-cols-2">
            <ul className="space-y-3">
              {linkList.map((l) => (
                <li key={l.label} className="flex items-center justify-between gap-4 border-b border-rule pb-3">
                  <span>{l.label}</span>
                  {l.href ? (
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="t-label underline hover:text-accent-text">
                      Open ↗
                    </a>
                  ) : (
                    <Pending value={null} />
                  )}
                </li>
              ))}
            </ul>
            <CrtFeed src={p.demoVideo} label={`FEED // ${opNumber(index)} // ${p.codename}`} />
          </div>
        </Block>
      </div>

      <footer className="mt-24 flex flex-wrap items-end justify-between gap-8 border-t border-rule pt-10 md:px-12">
        <div className="flex items-end gap-3">
          <Barcode value={p.slug} />
          <span className="t-label text-muted">END OF CASE FILE</span>
        </div>
        <Link href={`/operations/${next.slug}`} prefetch={true} transitionTypes={["redact"]} className="group text-right">
          <span className="t-label block text-muted">NEXT FILE</span>
          <span className="t-display text-5xl group-hover:text-accent-text md:text-7xl">{next.codename} →</span>
        </Link>
      </footer>
    </article>
  );
}
