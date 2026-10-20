import { links, profile, projects, skills } from "@/content/site";

/** schema.org Person + WebSite, from site.ts. `<` is escaped so the JSON can't close its script tag. */
export function personJsonLd() {
  const sameAs = [links.github, links.linkedin, links.tryhackme, links.hackthebox].filter(Boolean);
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${links.site}/#person`,
        name: profile.name,
        url: links.site,
        jobTitle: profile.role,
        description: profile.summary,
        alumniOf: { "@type": "CollegeOrUniversity", name: profile.university },
        knowsAbout: [...profile.focus, ...skills.map((s) => s.label)],
        sameAs,
        ...(links.email ? { email: `mailto:${links.email}` } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${links.site}/#website`,
        url: links.site,
        name: `${profile.name}: Security Engineer`,
        author: { "@id": `${links.site}/#person` },
        hasPart: projects.map((p) => ({ "@type": "CreativeWork", name: p.name, url: `${links.site}/operations/${p.slug}`, abstract: p.tagline })),
      },
    ],
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
