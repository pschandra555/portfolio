/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CASE #SC-0x7F3A — SOURCE OF TRUTH
 *  Every word, status, link and date on the site lives in this file.
 *  Edit here; components never need to change.
 *
 *  Conventions
 *  - Anything you still need to fill in is `ADD` (renders as "[PENDING DATA]").
 *  - Use `null` for links that don't exist yet. The UI hides or redacts them.
 *  - Never mark a cert "earned" or a project "live" until it really is:
 *    the UI, the AI chat and the terminal all trust these statuses.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const ADD = "[ADD]" as const;
export type Pending = typeof ADD;
export const isPending = (v: unknown): v is Pending | null | undefined =>
  v === ADD || v === null || v === undefined || v === "";

/** Strips the *emphasis* markers used in copy. */
export const plain = (s: string) => s.replace(/\*/g, "");

/* ── Subject profile ─────────────────────────────────────────────────────── */

export const profile = {
  name: "Sarath Chandra",
  firstName: "Sarath",
  lastName: "Chandra",
  caseNo: "SC-0x7F3A",
  role: "Aspiring security engineer",
  focus: ["offensive security", "threat detection", "DevSecOps"],
  motto: "I break things to learn how to defend them.",
  degree: "B.Tech Computer Science & Engineering (Cyber Security)",
  university: "VIT Vellore",
  yearStart: ADD as string,
  yearEnd: ADD as string,
  location: "India",
  timezone: "Asia/Kolkata",
  status: "Open to security internships",
  /** Short line used in meta description and the OG image. */
  summary:
    "Cyber security undergrad at VIT Vellore building honeypots, phishing detectors and DevSecOps tooling. Offensive security, threat detection, DevSecOps.",
} as const;

export const links = {
  github: "https://github.com/pschandra555",
  linkedin: null as string | null, // e.g. "https://www.linkedin.com/in/…"
  email: null as string | null, // e.g. "you@domain.com"
  resume: null as string | null, // e.g. "/media/resume.pdf" (drop the file in /public/media)
  tryhackme: null as string | null,
  hackthebox: null as string | null,
  pgp: null as string | null, // e.g. "/pgp.asc" or a keyserver URL
  /** Public site URL, used for metadata, sitemap and OG. Set after deploying. */
  site: "https://sarathchandra.vercel.app",
} as const;

/** Site housekeeping. */
export const meta = {
  /** Shown in the sitemap. Bump when you publish meaningful changes. */
  updated: "2026-10-21",
  /** security.txt must expire within a year (RFC 9116). Bump this yearly. */
  securityTxtExpires: "2027-10-20T00:00:00.000Z",
};

/* ── Sections (drives HUD, nav, command palette) ─────────────────────────── */

export type Classification =
  | "TOP SECRET"
  | "SECRET"
  | "CONFIDENTIAL"
  | "RESTRICTED"
  | "DECLASSIFIED";
export type ThreatLevel = "HIGH" | "ELEVATED" | "GUARDED" | "LOW" | "NONE";

export interface SectionMeta {
  id: string;
  file: string;
  label: string;
  classification: Classification;
  threat: ThreatLevel;
}

export const sections: SectionMeta[] = [
  { id: "top", file: "00", label: "Ciphertext", classification: "TOP SECRET", threat: "HIGH" },
  { id: "about", file: "01", label: "Declassified file", classification: "TOP SECRET", threat: "HIGH" },
  { id: "operations", file: "02", label: "Operations", classification: "SECRET", threat: "ELEVATED" },
  { id: "attack-surface", file: "03", label: "Attack surface", classification: "SECRET", threat: "ELEVATED" },
  { id: "timeline", file: "04", label: "Incident timeline", classification: "CONFIDENTIAL", threat: "GUARDED" },
  { id: "interrogate", file: "05", label: "Interrogate the file", classification: "RESTRICTED", threat: "LOW" },
  { id: "contact", file: "06", label: "Secure channel", classification: "DECLASSIFIED", threat: "NONE" },
];

/* ── Hero ────────────────────────────────────────────────────────────────── */

export const hero = {
  kicker: "Subject dossier · intercepted transmission",
  /** Revealed inside the cursor's decryption lens. Keep them short and true. */
  lensLines: [
    "breaks things to learn how to defend them",
    "reads the logs nobody reads",
    "threat model: curious",
    "prefers root cause over root access",
    "runs honeypots for fun",
    "status: open to security internships",
  ],
};

/* ── About / declassified file ───────────────────────────────────────────── */

export const about = {
  heading: "The subject",
  /**
   * Your story, one paragraph per entry. Wrap a word in *asterisks* to have
   * it declassify in amber. Written as a draft in your voice:
   * rewrite it with real moments. Specific beats generic every time.
   */
  story: [
    "I got into security the way most people in it do: by wanting to know how something works, and then how it *fails*.",
    "I'm a Computer Science undergrad at VIT Vellore, specialising in *cyber* *security*. Most of what I know comes from building things I'm not sure will work, breaking them on purpose, and writing down why they broke.",
    "Right now that means *honeypots* that watch real attackers, models that try to catch phishing pages before people type their passwords, and CI pipelines that complain about secrets before anyone else finds them.",
    "I'm aiming to be a security engineer who can sit on either side of the table: *attack* a system to find what's weak, then help the people who run it *defend* it.",
  ],
  /** Optional portrait, e.g. "/media/portrait.jpg". null shows a PHOTO WITHHELD frame. */
  photo: null as string | null,
  /** Fields on the ID badge. */
  badge: [
    { k: "Subject", v: "Sarath Chandra" },
    { k: "Designation", v: "Security engineer (in training)" },
    { k: "Base", v: "VIT Vellore, IN" },
    { k: "Clearance", v: "Open to internships" },
  ],
};

/* ── Certifications ──────────────────────────────────────────────────────── */

export type CertStatus = "earned" | "in-progress" | "planned";

export interface Cert {
  id: string;
  name: string;
  issuer: string;
  status: CertStatus;
  /** Date earned (or target date for planned / in-progress). Free text, e.g. "2026-03". */
  date: string | null;
  /** Required for the VERIFIED stamp. */
  credentialUrl: string | null;
  /** For in-progress certs, e.g. "Module 4 of 7". */
  progress?: string;
  /** Short names people use for it (helps the AI chat and its honesty guard). */
  aliases?: string[];
}

export const certs: Cert[] = [
  { id: "secplus", name: "CompTIA Security+", issuer: "CompTIA", status: "planned", date: null, credentialUrl: null, aliases: ["Security+", "Sec+", "SY0-701"] },
  { id: "ejpt", name: "eJPT, eLearnSecurity Junior Penetration Tester", issuer: "INE", status: "planned", date: null, credentialUrl: null, aliases: ["eJPT", "eJPTv2", "Junior Penetration Tester"] },
  { id: "google-cyber", name: "Google Cybersecurity Professional Certificate", issuer: "Google / Coursera", status: "planned", date: null, credentialUrl: null, aliases: ["Google Cybersecurity", "Google cert"] },
  { id: "thm-soc1", name: "TryHackMe SOC Level 1 path", issuer: "TryHackMe", status: "planned", date: null, credentialUrl: null, aliases: ["SOC Level 1", "SOC1", "SOC L1"] },
  { id: "cisco-intro", name: "Cisco Introduction to Cybersecurity", issuer: "Cisco Networking Academy", status: "planned", date: null, credentialUrl: null, aliases: ["Cisco Introduction to Cybersecurity", "Intro to Cybersecurity", "Cisco cert"] },
];

/** A cert only counts as verified when it's earned AND has a credential link. */
export const isVerified = (c: Cert) => c.status === "earned" && !!c.credentialUrl;

/* ── Projects / operations ───────────────────────────────────────────────── */

export type ProjectStatus = "live" | "in-development" | "planned";

export interface Project {
  slug: string;
  codename: string;
  name: string;
  tagline: string;
  objective: string;
  recon: string;
  approach: string[];
  stack: string[];
  /** Keep `value: ADD` until you have real numbers. Never invent metrics. */
  results: { label: string; value: string }[];
  status: ProjectStatus;
  eta: string | null;
  roadmap: { step: string; done: boolean }[];
  links: { repo: string | null; demo: string | null; writeup: string | null };
  /** Muted demo clip shown on hover, e.g. "/media/honeygrid.mp4". */
  demoVideo: string | null;
  /** Skill ids (see `skills`) this operation exercises. */
  skills: string[];
}

export const projects: Project[] = [
  {
    slug: "honeygrid",
    codename: "HONEYGRID",
    name: "HoneyGrid",
    tagline: "A distributed honeypot network that watches real attackers.",
    objective:
      "Observe real-world SSH and Telnet attacks at scale and turn raw honeypot logs into intelligence a defender can act on.",
    recon:
      "Public-facing servers get brute-forced within minutes of going online, but the raw logs are noisy and hard to learn from. Most people never see what an attacker actually types after logging in.",
    approach: [
      "Deploy Cowrie SSH/Telnet honeypots on free-tier cloud VMs across several regions, each in a hardened Docker container.",
      "Ship logs to a central Elasticsearch store and visualise them in Grafana.",
      "Plot a live world map of attacker IPs and rank the most-tried credentials.",
      "Automatically map attacker commands and behaviour to MITRE ATT&CK techniques.",
    ],
    stack: ["Python", "Docker", "Cowrie", "Elasticsearch", "Grafana"],
    results: [
      { label: "Sessions captured", value: ADD },
      { label: "Unique attacker IPs", value: ADD },
      { label: "ATT&CK techniques mapped", value: ADD },
    ],
    status: "in-development",
    eta: ADD,
    roadmap: [
      { step: "Single Cowrie node in Docker", done: false },
      { step: "Multi-region deployment", done: false },
      { step: "Elasticsearch + Grafana pipeline", done: false },
      { step: "Attacker world map + credential leaderboard", done: false },
      { step: "MITRE ATT&CK auto-mapping", done: false },
    ],
    links: { repo: null, demo: null, writeup: null },
    demoVideo: null,
    skills: ["python", "docker", "cowrie", "elastic", "grafana", "mitre", "linux", "cloud"],
  },
  {
    slug: "phishnet-lens",
    codename: "PHISHNET LENS",
    name: "PhishNet Lens",
    tagline: "A browser extension that flags phishing pages and explains why.",
    objective:
      "Catch phishing pages before a password is typed, and explain the verdict in plain language so users learn the signs.",
    recon:
      "Blocklists lag behind new phishing domains by hours, and most detectors give a yes/no answer with no reasoning, so users can't learn from them.",
    approach: [
      "Extract URL features (length, entropy, suspicious tokens, homoglyphs) and domain age from WHOIS.",
      "Compare page screenshots against known brand login pages for visual similarity.",
      "Train a gradient-boosted classifier (scikit-learn / XGBoost) and serve it behind FastAPI.",
      "Show a Chrome extension panel that explains which signals triggered the flag.",
    ],
    stack: ["Python", "scikit-learn", "XGBoost", "FastAPI", "Chrome extension", "JavaScript"],
    results: [
      { label: "Precision", value: ADD },
      { label: "Recall", value: ADD },
      { label: "Median verdict latency", value: ADD },
    ],
    status: "in-development",
    eta: ADD,
    roadmap: [
      { step: "URL + domain-age feature pipeline", done: false },
      { step: "Baseline classifier", done: false },
      { step: "Visual-similarity model", done: false },
      { step: "FastAPI inference service", done: false },
      { step: "Chrome extension with explanations", done: false },
    ],
    links: { repo: null, demo: null, writeup: null },
    demoVideo: null,
    skills: ["python", "sklearn", "fastapi", "javascript", "phishing", "ml-features"],
  },
  {
    slug: "vulnscope",
    codename: "VULNSCOPE",
    name: "VulnScope",
    tagline: "One GitHub Action that runs SAST, CVE and secret scans on every PR.",
    objective:
      "Give small teams one GitHub Action that catches vulnerable code, vulnerable dependencies and leaked secrets on every pull request.",
    recon:
      "Security scanners are noisy, and wiring three of them together is a chore. Developers ignore walls of findings, but they read one clear, prioritised comment.",
    approach: [
      "Run Semgrep (SAST), Trivy (dependency CVEs) and Gitleaks (secrets) in parallel on the PR diff.",
      "Normalise results into one severity model and remove duplicates.",
      "Post a single, clean PR comment with severity, location and a fix suggestion, and update it in place on new pushes.",
      "Fail the check only above a configurable severity threshold.",
    ],
    stack: ["TypeScript", "GitHub Actions", "Semgrep", "Trivy", "Gitleaks"],
    results: [
      { label: "Repos using it", value: ADD },
      { label: "Median scan time", value: ADD },
      { label: "Findings triaged", value: ADD },
    ],
    status: "planned",
    eta: ADD,
    roadmap: [
      { step: "Action scaffold + Semgrep job", done: false },
      { step: "Trivy + Gitleaks jobs", done: false },
      { step: "Unified severity model", done: false },
      { step: "Single PR comment (update in place)", done: false },
      { step: "Publish to GitHub Marketplace", done: false },
    ],
    links: { repo: null, demo: null, writeup: null },
    demoVideo: null,
    skills: ["typescript", "gh-actions", "semgrep", "trivy", "gitleaks", "sast"],
  },
  {
    slug: "netsentinel",
    codename: "NETSENTINEL",
    name: "NetSentinel",
    tagline: "ML-based intrusion detection that classifies live traffic flows.",
    objective:
      "Classify network flows as benign or malicious (DDoS, port scan, brute force) and raise alerts on a live dashboard.",
    recon:
      "Signature-based IDS misses variations of known attacks. Flow-level ML can generalise, but only if it's trained and evaluated honestly on realistic data.",
    approach: [
      "Extract flow features with Zeek and align them with the CIC-IDS2017 feature set.",
      "Train and evaluate classifiers with scikit-learn, with care to avoid train/test leakage.",
      "Score live flows and stream alerts to a dashboard (Streamlit or React).",
    ],
    stack: ["Python", "Zeek", "scikit-learn", "Streamlit", "React"],
    results: [
      { label: "Macro F1 (CIC-IDS2017)", value: ADD },
      { label: "False-positive rate", value: ADD },
      { label: "Flows / second", value: ADD },
    ],
    status: "planned",
    eta: ADD,
    roadmap: [
      { step: "Dataset prep + leakage-safe split", done: false },
      { step: "Baseline classifiers", done: false },
      { step: "Zeek live feature extraction", done: false },
      { step: "Alert dashboard", done: false },
    ],
    links: { repo: null, demo: null, writeup: null },
    demoVideo: null,
    skills: ["python", "zeek", "sklearn", "networking", "ids", "react"],
  },
];

/* ── CTF & writeups ──────────────────────────────────────────────────────── */

export interface CtfEntry {
  event: string;
  date: string | null;
  team: string | null;
  rank: string | null;
  writeupUrl: string | null;
}

/** Add CTFs you've played. Leave empty to show an honest "no entries yet" state. */
export const ctfs: CtfEntry[] = [];

/* ── Skills / attack surface ─────────────────────────────────────────────── */

export type SubnetId = "offensive" | "defensive" | "devsecops" | "networking" | "programming" | "ml";

export const subnets: { id: SubnetId; label: string; cidr: string }[] = [
  { id: "offensive", label: "Offensive", cidr: "10.0.1.0/24" },
  { id: "defensive", label: "Defensive / SOC", cidr: "10.0.2.0/24" },
  { id: "devsecops", label: "DevSecOps", cidr: "10.0.3.0/24" },
  { id: "networking", label: "Networking", cidr: "10.0.4.0/24" },
  { id: "programming", label: "Programming", cidr: "10.0.5.0/24" },
  { id: "ml", label: "ML for security", cidr: "10.0.6.0/24" },
];

export interface Skill {
  id: string;
  label: string;
  subnet: SubnetId;
  /** Shown in the "port scan" tooltip. */
  tools: string[];
}

/** Edit freely: keep only what you'd be happy to be quizzed on in an interview. */
export const skills: Skill[] = [
  { id: "recon", label: "Recon & enumeration", subnet: "offensive", tools: ["Nmap", "Gobuster", "whois"] },
  { id: "webapp", label: "Web app testing", subnet: "offensive", tools: ["Burp Suite", "OWASP Top 10"] },
  { id: "phishing", label: "Phishing analysis", subnet: "offensive", tools: ["URL forensics", "WHOIS"] },
  { id: "mitre", label: "MITRE ATT&CK", subnet: "defensive", tools: ["ATT&CK Navigator"] },
  { id: "cowrie", label: "Honeypots", subnet: "defensive", tools: ["Cowrie"] },
  { id: "elastic", label: "Log analysis / SIEM", subnet: "defensive", tools: ["Elasticsearch", "Kibana"] },
  { id: "grafana", label: "Dashboards", subnet: "defensive", tools: ["Grafana"] },
  { id: "ids", label: "Intrusion detection", subnet: "defensive", tools: ["Zeek", "CIC-IDS2017"] },
  { id: "sast", label: "SAST", subnet: "devsecops", tools: ["Semgrep"] },
  { id: "semgrep", label: "Semgrep rules", subnet: "devsecops", tools: ["Semgrep"] },
  { id: "trivy", label: "Dependency scanning", subnet: "devsecops", tools: ["Trivy"] },
  { id: "gitleaks", label: "Secret detection", subnet: "devsecops", tools: ["Gitleaks"] },
  { id: "gh-actions", label: "CI/CD", subnet: "devsecops", tools: ["GitHub Actions"] },
  { id: "docker", label: "Containers", subnet: "devsecops", tools: ["Docker"] },
  { id: "cloud", label: "Cloud VMs", subnet: "devsecops", tools: ["Free-tier cloud"] },
  { id: "networking", label: "TCP/IP", subnet: "networking", tools: ["Wireshark", "tcpdump"] },
  { id: "zeek", label: "Flow analysis", subnet: "networking", tools: ["Zeek"] },
  { id: "linux", label: "Linux", subnet: "networking", tools: ["bash", "ssh", "iptables"] },
  { id: "python", label: "Python", subnet: "programming", tools: ["Python 3"] },
  { id: "typescript", label: "TypeScript", subnet: "programming", tools: ["Node.js"] },
  { id: "javascript", label: "JavaScript", subnet: "programming", tools: ["Browser extensions"] },
  { id: "react", label: "React", subnet: "programming", tools: ["React"] },
  { id: "fastapi", label: "APIs", subnet: "programming", tools: ["FastAPI"] },
  { id: "sklearn", label: "Classical ML", subnet: "ml", tools: ["scikit-learn", "XGBoost"] },
  { id: "ml-features", label: "Feature engineering", subnet: "ml", tools: ["pandas", "NumPy"] },
];

/* ── Journey / incident timeline ─────────────────────────────────────────── */

export type Severity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface TimelineEvent {
  /** Free text date, e.g. "2023-08" or ADD. */
  date: string;
  kind: "education" | "certification" | "ctf" | "internship" | "hackathon" | "project";
  title: string;
  detail: string;
  severity: Severity;
}

/** Certification events are generated from `certs` with their real status. Add the rest here. */
export const timeline: TimelineEvent[] = [
  {
    date: ADD,
    kind: "education",
    title: "Enrolled: B.Tech CSE (Cyber Security), VIT Vellore",
    detail: "Session initiated. Subject begins formal training in systems, networks and security.",
    severity: "HIGH",
  },
  {
    date: ADD,
    kind: "project",
    title: "Operation HONEYGRID started",
    detail: "First honeypot deployment in progress. Watching who knocks.",
    severity: "MEDIUM",
  },
];

/* ── Contact ─────────────────────────────────────────────────────────────── */

export const contact = {
  heading: "Let's talk",
  intro:
    "Hiring for a security internship, building something that needs breaking, or just want to compare honeypot logs? The channel's open.",
};

/* ── Mini-CTF (flag hashes only; the plaintext flags are hidden in the site) ─ */
/* Filled in during phase (d). */
