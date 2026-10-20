import {
  about,
  certs,
  contact,
  ctfs,
  isPending,
  isVerified,
  links,
  plain,
  profile,
  projects,
  skills,
  subnets,
  timeline,
  type Cert,
  type Project,
} from "@/content/site";

/**
 * The file's knowledge, built from content/site.ts at module load. This is
 * the ONLY source the AI is allowed to answer from.
 */

export interface Chunk {
  id: string;
  title: string;
  text: string;
}

export const certStatus = (c: Cert) =>
  isVerified(c)
    ? "EARNED and VERIFIED"
    : c.status === "earned"
      ? "EARNED (verification link not yet published)"
      : c.status === "in-progress"
        ? `IN PROGRESS, NOT EARNED YET${c.progress ? ` (${c.progress})` : ""}`
        : "PLANNED, NOT STARTED, NOT EARNED";

export const projectStatus = (p: Project) =>
  p.status === "live" ? "LIVE" : p.status === "in-development" ? "IN DEVELOPMENT, NOT LIVE YET" : "PLANNED, NOT BUILT YET";

const val = (v: string | null | undefined, missing = "not in the file yet") => (isPending(v) ? missing : v);

function projectChunks(p: Project): Chunk[] {
  const results = p.results.every((r) => isPending(r.value))
    ? "No results have been measured yet. There are no metrics to report."
    : p.results.map((r) => `${r.label}: ${val(r.value, "not measured yet")}`).join("; ");
  const linksText = [
    `repository: ${p.links.repo ?? "not published yet"}`,
    `demo: ${p.links.demo ?? "none yet"}`,
    `writeup: ${p.links.writeup ?? "none yet"}`,
  ].join("; ");
  return [
    {
      id: `op-${p.slug}`,
      title: `Operation ${p.codename} (${p.name}): overview and status`,
      text: `${p.name}: ${p.tagline} Objective: ${p.objective} Problem: ${p.recon} Status: ${projectStatus(p)}. ETA: ${val(p.eta)}.`,
    },
    {
      id: `op-${p.slug}-approach`,
      title: `${p.name}: approach and stack`,
      text: `Approach: ${p.approach.join(" ")} Stack: ${p.stack.join(", ")}. Roadmap: ${p.roadmap
        .map((r) => `${r.step} (${r.done ? "done" : "not done"})`)
        .join("; ")}.`,
    },
    { id: `op-${p.slug}-results`, title: `${p.name}: results, metrics and links`, text: `Results: ${results} Links: ${linksText}.` },
  ];
}

export const CHUNKS: Chunk[] = [
  {
    id: "profile",
    title: "Who the subject is",
    text: `${profile.name}. ${profile.role}, focused on ${profile.focus.join(", ")}. "${profile.motto}" Studying ${profile.degree} at ${profile.university} (${val(profile.yearStart, "start year not listed")}–${val(profile.yearEnd, "end year not listed")}). Based in ${profile.location}. Current status: ${profile.status}.`,
  },
  { id: "story", title: "The subject's story, in their own words", text: about.story.map(plain).join(" ") },
  ...projects.flatMap(projectChunks),
  ...certs.map((c) => ({
    id: `cert-${c.id}`,
    title: `Certification: ${c.name}`,
    text: `${c.name} from ${c.issuer}. Status: ${certStatus(c)}.${c.date ? ` Date: ${c.date}.` : ""}${isVerified(c) ? ` Credential: ${c.credentialUrl}.` : ""}`,
  })),
  ...subnets.map((n) => ({
    id: `skills-${n.id}`,
    title: `Skills: ${n.label}`,
    text: skills
      .filter((s) => s.subnet === n.id)
      .map((s) => {
        const used = projects.filter((p) => p.skills.includes(s.id)).map((p) => p.name);
        return `${s.label} (tools: ${s.tools.join(", ")}${used.length ? `; used in ${used.join(", ")}` : ""})`;
      })
      .join("; "),
  })),
  {
    id: "timeline",
    title: "Timeline and journey",
    text: timeline.map((e) => `${val(e.date, "date not listed")}: ${e.title}. ${e.detail}`).join(" "),
  },
  {
    id: "ctf",
    title: "CTFs, writeups and training platforms",
    text: ctfs.length
      ? ctfs.map((c) => `${c.event} (${val(c.date, "date not listed")}): rank ${val(c.rank, "not listed")}${c.writeupUrl ? `, writeup ${c.writeupUrl}` : ""}`).join("; ")
      : `No CTF results are logged yet. TryHackMe profile: ${links.tryhackme ?? "not listed"}. Hack The Box profile: ${links.hackthebox ?? "not listed"}.`,
  },
  {
    id: "contact",
    title: "How to contact the subject",
    text: `${contact.intro} GitHub: ${links.github}. LinkedIn: ${links.linkedin ?? "not listed yet"}. Email: ${links.email ?? "not listed yet"}. Résumé: ${links.resume ?? "not published yet"}. PGP key: ${links.pgp ?? "not published yet"}. The contact section is at the bottom of this page.`,
  },
  {
    id: "site",
    title: "About this website",
    text: "This site is the subject's portfolio, designed as an encrypted dossier that decrypts as you scroll. It has a hidden terminal (press the backtick key) and a mini capture-the-flag with three hidden flags. The flags themselves are never given out.",
  },
];

/** Always sent: the hard facts the model must never contradict. */
export const CORE_FACTS = [
  `Subject: ${profile.name}, ${profile.role}. Status: ${profile.status}.`,
  `Certifications (exact status, do not upgrade): ${certs.map((c) => `${c.name} = ${certStatus(c)}`).join("; ")}.`,
  `Earned certifications: ${certs.filter((c) => c.status === "earned").map((c) => c.name).join(", ") || "NONE"}.`,
  `Projects (exact status, do not upgrade): ${projects.map((p) => `${p.name} = ${projectStatus(p)}`).join("; ")}.`,
  `Live projects: ${projects.filter((p) => p.status === "live").map((p) => p.name).join(", ") || "NONE"}.`,
  `Measured project metrics: ${projects.some((p) => p.results.some((r) => !isPending(r.value))) ? "see project results" : "NONE YET"}.`,
].join("\n");

/* ── Retrieval: tiny BM25-style keyword scoring. Plenty for a file this size. ── */

const STOP = new Set(
  "a an the is are was were be been of to in on for and or with what which who whom whose how why when where does do did has have had his her their him he she it its this that these those about any some can could would should tell me you your i my".split(" "),
);
const SYN: Record<string, string> = {
  cert: "certification", certs: "certification", certificate: "certification", certified: "certification", certifications: "certification",
  project: "operation", projects: "operation", operations: "operation", building: "operation", built: "operation", working: "operation",
  skill: "skills", tools: "skills", tool: "skills", stack: "skills", tech: "skills",
  email: "contact", reach: "contact", hire: "contact", hiring: "contact", linkedin: "contact", resume: "contact", cv: "contact",
  college: "university", degree: "university", study: "university", studies: "university", vit: "university", education: "university",
  honeypot: "honeygrid", honeypots: "honeygrid", phishing: "phishnet", ids: "netsentinel", intrusion: "netsentinel",
  live: "status", deployed: "status", launched: "status", internship: "status", available: "status",
};

const tokenize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^[.-]+|[.-]+$/g, ""))
    .filter((t) => t && !STOP.has(t))
    .map((t) => SYN[t] ?? t)
    .map((t) => (t.length > 4 ? t.replace(/(ing|ed|es|s)$/, "") : t));

const docs = CHUNKS.map((c) => {
  const toks = tokenize(`${c.title} ${c.title} ${c.text}`);
  const tf = new Map<string, number>();
  toks.forEach((t) => tf.set(t, (tf.get(t) ?? 0) + 1));
  return { chunk: c, tf, len: toks.length };
});
const avgLen = docs.reduce((a, d) => a + d.len, 0) / docs.length;
const df = new Map<string, number>();
docs.forEach((d) => d.tf.forEach((_, t) => df.set(t, (df.get(t) ?? 0) + 1)));

export function retrieve(query: string, k = 5): Chunk[] {
  const q = Array.from(new Set(tokenize(query)));
  const N = docs.length;
  const scored = docs.map((d) => {
    let score = 0;
    for (const t of q) {
      const f = d.tf.get(t);
      if (!f) continue;
      const idf = Math.log(1 + (N - (df.get(t) ?? 0) + 0.5) / ((df.get(t) ?? 0) + 0.5));
      score += (idf * f * 2.2) / (f + 1.2 * (0.25 + 0.75 * (d.len / avgLen)));
    }
    return { chunk: d.chunk, score };
  });
  const hits = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, k).map((s) => s.chunk);
  // Nothing matched: give the model the profile and story so it can still orient the visitor.
  return hits.length ? hits : CHUNKS.filter((c) => c.id === "profile" || c.id === "story");
}
