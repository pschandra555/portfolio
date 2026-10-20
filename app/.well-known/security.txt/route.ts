import { links, meta } from "@/content/site";

/**
 * RFC 9116 security.txt, generated from site.ts so the contact stays current.
 * Served at /.well-known/security.txt.
 */
export function GET() {
  const contacts = [links.email && `mailto:${links.email}`, links.github].filter(Boolean);
  const body = [
    "# Found a vulnerability on this site? Thank you. Please report it privately.",
    ...contacts.map((c) => `Contact: ${c}`),
    `Expires: ${meta.securityTxtExpires}`,
    ...(links.pgp ? [`Encryption: ${new URL(links.pgp, links.site).href}`] : []),
    "Preferred-Languages: en",
    `Canonical: ${links.site}/.well-known/security.txt`,
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" },
  });
}
