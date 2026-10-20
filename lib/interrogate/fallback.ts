import { certs, contact, ctfs, isPending, links, plain, about, profile, projects, skills, subnets, type Project } from "@/content/site";
import { certStatus, projectStatus } from "./knowledge";

/**
 * Pre-written answers for when there's no API key, the rate limit is hit
 * upstream, or the model is unreachable. Intent-matched, generated from
 * site.ts, so they're always true.
 */

const list = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

const projectBrief = (p: Project) => `${p.name} (${projectStatus(p).toLowerCase()}): ${p.tagline}`;

const projectDetail = (p: Project) => {
  const results = p.results.every((r) => isPending(r.value))
    ? "No results have been measured yet, so I won't quote any numbers."
    : `Results: ${p.results.map((r) => `${r.label} ${isPending(r.value) ? "not measured yet" : r.value}`).join("; ")}.`;
  return `Operation ${p.codename}. ${p.objective} Status: ${projectStatus(p).toLowerCase()}${isPending(p.eta) ? "" : `, ETA ${p.eta}`}. Stack: ${p.stack.join(", ")}. ${results} The full case file is in the Operations section.`;
};

const certAnswer = () => {
  const earned = certs.filter((c) => c.status === "earned");
  const lines = certs.map((c) => `${c.name}: ${certStatus(c).toLowerCase()}.`);
  const head = earned.length
    ? `On file: ${earned.length} earned certification${earned.length > 1 ? "s" : ""}.`
    : "No certifications are earned yet. Here's the honest list:";
  return `${head}\n${lines.join("\n")}`;
};

const contactAnswer = () => {
  const ch = [
    links.email && `email ${links.email}`,
    links.linkedin && `LinkedIn ${links.linkedin}`,
    `GitHub ${links.github}`,
    links.resume && `résumé ${links.resume}`,
  ].filter(Boolean) as string[];
  return `${contact.intro} Channels on file: ${list(ch)}. Or scroll to the Secure Channel section at the bottom of the page.`;
};

type Intent = { test: RegExp; answer: (q: string) => string };

const INTENTS: Intent[] = [
  {
    test: /\b(flag|ctf flag|capture the flag)s?\b/i,
    answer: () =>
      "The file won't hand out flags. Three are hidden on this site: one in the source, one in the console, one in plain sight. Press the backtick key to open the terminal, then try `hint`.",
  },
  {
    test: /ignore (all|previous|the above)|system prompt|you are now|jailbreak|developer mode/i,
    answer: () => "Nice try. The file only answers questions about the subject, and only from the record.",
  },
  {
    test: /\b(cert|certs|certified|certification|certifications|certificate|security\+|comptia|ejpt|ine|google cyber|coursera|cisco|soc level|qualification)/i,
    answer: (q) => {
      const named = certs.find((c) => [c.name, ...(c.aliases ?? [])].some((n) => q.toLowerCase().includes(n.toLowerCase())));
      return named ? `${named.name} (${named.issuer}): ${certStatus(named).toLowerCase()}.` : certAnswer();
    },
  },
  {
    test: new RegExp(`\\b(${projects.flatMap((p) => [p.slug, p.name, p.codename]).map((s) => s.replace(/[-\s]/g, "[-\\s]?")).join("|")})\\b`, "i"),
    answer: (q) => {
      const p = projects.find((x) => [x.slug, x.name, x.codename].some((n) => q.toLowerCase().replace(/[-\s]/g, "").includes(n.toLowerCase().replace(/[-\s]/g, ""))))!;
      return projectDetail(p);
    },
  },
  {
    test: /\b(project|projects|operation|operations|working on|built|building|portfolio|work)\b/i,
    answer: () => `${projects.length} operations on file:\n${projects.map(projectBrief).join("\n")}\nNone are live yet. Ask about any of them by name.`,
  },
  {
    test: /\b(skill|skills|stack|tools?|language|languages|tech|python|typescript|docker|ml|machine learning|good at|know)\b/i,
    answer: (q) => {
      const sn = subnets.find((n) => q.toLowerCase().includes(n.label.toLowerCase().split(/[ /]/)[0]));
      const pick = sn ? [sn] : subnets;
      return pick
        .map((n) => `${n.label}: ${skills.filter((s) => s.subnet === n.id).map((s) => s.label).join(", ")}.`)
        .join("\n");
    },
  },
  {
    test: /\b(contact|email|reach|hire|hiring|linkedin|resume|résumé|cv|talk|message)\b/i,
    answer: contactAnswer,
  },
  {
    test: /\b(intern|internship|available|availability|open to|looking for|job|role)\b/i,
    answer: () => `Status on file: ${profile.status}. Focus: ${list([...profile.focus])}. ${contactAnswer()}`,
  },
  {
    test: /\b(study|studies|student|college|university|degree|vit|education|graduate|graduation|year)\b/i,
    answer: () =>
      `${profile.degree} at ${profile.university}${isPending(profile.yearStart) ? "" : `, ${profile.yearStart}–${profile.yearEnd}`}.${isPending(profile.yearStart) ? " The years aren't on file yet." : ""}`,
  },
  {
    test: /\b(ctf|ctfs|hack ?the ?box|htb|tryhackme|thm|writeup|writeups)\b/i,
    answer: () =>
      ctfs.length
        ? `CTFs on file: ${ctfs.map((c) => `${c.event}${isPending(c.rank) ? "" : ` (rank ${c.rank})`}`).join(", ")}.`
        : "No CTF results are logged yet. They'll appear in the CTF & Writeups sub-file once there's something real to show.",
  },
  {
    test: /\b(who|about|introduce|yourself|himself|story|background|why security|motivation)\b/i,
    answer: () => `${profile.name}: ${profile.role.toLowerCase()} working on ${list([...profile.focus])}. ${plain(about.story[0])} ${profile.motto}`,
  },
  { test: /^(hi|hello|hey|yo|sup|greetings)\b/i, answer: () => `Session open. Ask the file about ${profile.firstName}'s projects, certifications, skills or how to get in touch.` },
];

export function fallbackAnswer(question: string): string {
  for (const i of INTENTS) if (i.test.test(question)) return i.answer(question);
  return `That isn't in the file. I can answer questions about ${profile.firstName}'s projects (${list(projects.map((p) => p.name))}), certifications, skills, education and how to reach them.`;
}
