import {
  certs,
  isVerified,
  links,
  profile,
  projects,
  skills,
  subnets,
  type Cert,
} from "@/content/site";
import { FLAGS, FLAG_HINTS, flagProgress, submitFlag } from "@/lib/ctf";

/**
 * The hidden terminal's commands. Every answer is generated from site.ts,
 * so the terminal can never claim a cert or project status that isn't true.
 */

export type Tone = "ink" | "muted" | "accent" | "error";
export interface Line {
  text: string;
  tone?: Tone;
  href?: string;
}

export interface TerminalContext {
  close: () => void;
  goTo: (sectionId: string) => void;
  open: (href: string) => void;
  toggleTheme: () => void;
  clear: () => void;
  celebrate: () => void;
}

type Run = (args: string[], ctx: TerminalContext) => Line[] | Promise<Line[]>;

const pad = (s: string, n: number) => (s.length >= n ? s + " " : s + " ".repeat(n - s.length));
const L = (text: string, tone?: Tone, href?: string): Line => ({ text, tone, href });

const certState = (c: Cert) =>
  isVerified(c) ? "VERIFIED" : c.status === "earned" ? "EARNED (link pending)" : c.status === "in-progress" ? `IN PROGRESS${c.progress ? ` · ${c.progress}` : ""}` : "NEXT TARGET";

const statusLabel = { live: "LIVE", "in-development": "IN DEVELOPMENT", planned: "PLANNED" } as const;

const SERVICE_PORTS = [22, 53, 80, 111, 135, 139, 443, 445, 993, 1433, 2049, 3000, 3306, 3389, 5432, 5601, 5900, 6379, 8000, 8080, 8443, 9000, 9200, 9443, 27017];

export const COMMANDS: Record<string, { help: string; run: Run; hidden?: boolean }> = {
  help: {
    help: "list commands",
    run: () => [
      L("Available commands:", "muted"),
      ...Object.entries(COMMANDS)
        .filter(([, c]) => !c.hidden)
        .map(([name, c]) => L(`  ${pad(name, 16)}${c.help}`)),
      L(""),
      L("Tip: ↑/↓ history · Tab completes · Esc closes", "muted"),
    ],
  },
  whoami: {
    help: "who is the subject",
    run: () => [
      L(profile.name.toLowerCase().replace(" ", "-"), "accent"),
      L(`uid=1337(sarath) gid=0x7F3A(security) groups=offensive,defensive,devsecops`, "muted"),
      L(`role    ${profile.role}`),
      L(`base    ${profile.university} · ${profile.degree}`),
      L(`motto   ${profile.motto}`),
      L(`status  ${profile.status}`, "accent"),
    ],
  },
  ls: {
    help: "ls operations · list case files",
    run: (args) => {
      if (args[0] === "operations" || args[0] === "operations/") {
        return [
          L(`total ${projects.length}`, "muted"),
          ...projects.map((p) => L(`drwxr-x---  ${pad(p.slug + "/", 16)}${pad(`[${statusLabel[p.status]}]`, 18)}${p.tagline}`)),
          L(""),
          L("open <name> to read a case file", "muted"),
        ];
      }
      return [L("operations/   certs.txt   skills.db   resume.pdf   contact.vcf   flag.txt")];
    },
  },
  open: {
    help: "open <operation> · read a case file",
    run: (args, ctx) => {
      const p = projects.find((x) => x.slug === args[0] || x.slug.startsWith(args[0] ?? "\0") || x.codename.toLowerCase() === (args[0] ?? "").toLowerCase());
      if (!p) return [L(`open: no such operation: ${args[0] ?? ""}. Try: ls operations`, "error")];
      window.setTimeout(() => ctx.open(`/operations/${p.slug}`), 250);
      return [L(`Opening case file: OPERATION ${p.codename}…`, "accent")];
    },
  },
  cat: {
    help: "cat certs · credentials, with their real status",
    run: (args) => {
      const f = args[0] ?? "";
      if (f === "certs" || f === "certs.txt") {
        return [
          L(`# credentials on file: ${certs.filter(isVerified).length}/${certs.length} verified`, "muted"),
          ...certs.map((c) => L(`${pad(c.name, 50)}${certState(c)}`, isVerified(c) ? "accent" : c.status === "planned" ? "muted" : "ink", isVerified(c) ? c.credentialUrl! : undefined)),
        ];
      }
      if (f === "flag.txt") return [L("cat: flag.txt: Permission denied. Flags aren't stored in plaintext. Try: hint", "error")];
      if (f === "skills.db") return COMMANDS.skills.run([], undefined as never) as Line[];
      if (f === "contact.vcf") return COMMANDS.contact.run([], undefined as never) as Line[];
      if (f === "resume.pdf") return [L("cat: resume.pdf: binary file. Try: resume", "error")];
      return [L(`cat: ${f || "missing operand"}: No such file. Try: cat certs`, "error")];
    },
  },
  nmap: {
    help: "nmap sarath · port-scan the subject",
    run: (args) => {
      const target = args.filter((a) => !a.startsWith("-"))[0];
      if (!target) return [L("nmap: no target. Try: nmap sarath", "error")];
      if (!/^(sarath|sarath-chandra|sc|localhost|127\.0\.0\.1)$/i.test(target)) {
        return [L(`nmap: refusing to scan ${target}. Only the subject has consented to this scan.`, "error")];
      }
      const now = new Intl.DateTimeFormat("en-CA", { timeZone: profile.timezone, dateStyle: "short", timeStyle: "short", hour12: false }).format(new Date());
      return [
        L(`Starting Nmap 7.95 ( https://nmap.org ) at ${now} IST`, "muted"),
        L(`Nmap scan report for sarath.chandra (10.0.0.1)`),
        L(`Host is up (0.0042s latency).`, "muted"),
        L(`Not shown: ${65535 - skills.length} filtered tcp ports (no-response)`, "muted"),
        L(`${pad("PORT", 11)}${pad("STATE", 7)}${pad("SERVICE", 22)}VERSION`, "muted"),
        ...skills.map((s, i) => L(`${pad(`${SERVICE_PORTS[i % SERVICE_PORTS.length]}/tcp`, 11)}${pad("open", 7)}${pad(s.id, 22)}${s.tools.join(", ")}`)),
        L(""),
        L(`Service Info: OS: curious; Role: ${profile.role.toLowerCase()}`, "accent"),
        L(`Nmap done: 1 IP address (1 host up) scanned in 1.37 seconds`, "muted"),
      ];
    },
  },
  skills: {
    help: "attack surface, by subnet",
    run: () =>
      subnets.flatMap((n) => [
        L(`${n.label.toUpperCase()}  ${n.cidr}`, "accent"),
        L(`  ${skills.filter((s) => s.subnet === n.id).map((s) => s.label).join(" · ")}`),
      ]),
  },
  resume: {
    help: "open the résumé",
    run: (_, ctx) => {
      if (!links.resume) return [L("resume: [PENDING DATA] The résumé hasn't been filed yet.", "muted")];
      window.setTimeout(() => ctx.open(links.resume!), 200);
      return [L("Opening résumé…", "accent")];
    },
  },
  contact: {
    help: "secure channels",
    run: () => {
      const rows: [string, string | null][] = [
        ["email", links.email ? `mailto:${links.email}` : null],
        ["github", links.github],
        ["linkedin", links.linkedin],
        ["tryhackme", links.tryhackme],
        ["hackthebox", links.hackthebox],
        ["pgp", links.pgp],
      ];
      return rows.map(([k, v]) => (v ? L(`${pad(k, 12)}${v.replace("mailto:", "")}`, "ink", v) : L(`${pad(k, 12)}[PENDING DATA]`, "muted")));
    },
  },
  sudo: {
    help: "sudo hire-me",
    run: async (args, ctx) => {
      if (args.join(" ") !== "hire-me") return [L(`visitor is not in the sudoers file. This incident will be reported.`, "error")];
      window.setTimeout(() => {
        ctx.close();
        ctx.goTo("contact");
      }, 1400);
      return [
        L("[sudo] password for recruiter: ••••••••", "muted"),
        L("Verifying clearance… ok", "muted"),
        L("Escalating privileges… ok", "muted"),
        L("✓ Access granted. Opening secure channel.", "accent"),
      ];
    },
  },
  submit: {
    help: "submit FLAG{...} · mini-CTF",
    run: async (args, ctx) => {
      const r = await submitFlag(args.join(" "));
      const score = `[${"■".repeat(r.count)}${"□".repeat(r.total - r.count)}] ${r.count}/${r.total}`;
      if (r.status === "invalid-format") return [L("submit: flags look like FLAG{...}", "error")];
      if (r.status === "wrong") return [L(`✗ Incorrect flag. ${score}`, "error")];
      if (r.status === "duplicate") return [L(`Already captured (${r.label}). ${score}`, "muted")];
      const out = [L(`✓ FLAG ACCEPTED: ${r.label}. ${score}`, "accent")];
      if (r.count === r.total) {
        ctx.celebrate();
        out.push(L(""), L("All three flags captured.", "accent"), L("You'd make a good teammate. Let's talk: run `contact`.", "accent"));
      }
      return out;
    },
  },
  hint: {
    help: "mini-CTF hints",
    run: () => [L(`Three flags are hidden on this site. ${flagProgress()}/${FLAGS.length} captured.`, "muted"), ...FLAG_HINTS.map((h) => L(h))],
  },
  theme: { help: "toggle terminal / printed dossier", run: (_, ctx) => (ctx.toggleTheme(), [L("Theme switched.", "muted")]) },
  clear: { help: "clear the screen", run: (_, ctx) => (ctx.clear(), []) },
  exit: { help: "close the terminal", run: (_, ctx) => (window.setTimeout(ctx.close, 120), [L("logout", "muted")]) },
  rm: { help: "", hidden: true, run: () => [L("rm: this dossier is read-only. Nice try.", "error")] },
  pwd: { help: "", hidden: true, run: () => [L("/home/visitor/dossier/SC-0x7F3A")] },
  date: { help: "", hidden: true, run: () => [L(new Date().toLocaleString("en-GB", { timeZone: profile.timezone }) + " IST")] },
  echo: { help: "", hidden: true, run: (args) => [L(args.join(" "))] },
};

export const BANNER: Line[] = [
  L(`SC-OS 1.0 (tty1) · CASE #${profile.caseNo}`, "accent"),
  L("Unauthorised access is… actually fine. Type `help` to start, Esc to close.", "muted"),
  L(""),
];

export async function runCommand(raw: string, ctx: TerminalContext): Promise<Line[]> {
  const input = raw.trim().slice(0, 200);
  if (!input) return [];
  const [name, ...args] = input.split(/\s+/);
  const cmd = COMMANDS[name.toLowerCase()];
  if (!cmd) return [L(`${name}: command not found. Try: help`, "error")];
  return cmd.run(args, ctx);
}

export const completions = (prefix: string) => {
  const p = prefix.toLowerCase();
  const extra = ["ls operations", "cat certs", "nmap sarath", "sudo hire-me", ...projects.map((x) => `open ${x.slug}`)];
  return [...Object.keys(COMMANDS).filter((c) => !COMMANDS[c].hidden), ...extra].filter((c) => c.startsWith(p));
};

