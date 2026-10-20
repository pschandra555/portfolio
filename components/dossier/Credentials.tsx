import { certs, isVerified } from "@/content/site";
import { Stamp } from "./Stamp";

/**
 * Credentials on file. A cert only gets VERIFIED when it's earned AND has a
 * credential link. Everything else says exactly what it is.
 */
export function Credentials() {
  return (
    <div>
      <h3 className="t-label mb-4 flex justify-between border-b border-rule pb-2">
        <span>EXHIBIT B — CREDENTIALS ON FILE</span>
        <span className="text-muted">
          {certs.filter(isVerified).length}/{certs.length} VERIFIED
        </span>
      </h3>
      <ul>
        {certs.map((c) => {
          const verified = isVerified(c);
          return (
            <li key={c.id} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-rule py-3">
              <div className="min-w-0">
                {verified ? (
                  <a href={c.credentialUrl!} target="_blank" rel="noopener noreferrer" className="underline decoration-rule hover:text-accent-text">
                    {c.name} <span className="sr-only">(opens credential, new tab)</span>
                  </a>
                ) : (
                  <span className={c.status === "planned" ? "text-muted" : undefined}>{c.name}</span>
                )}
                <span className="t-label mt-0.5 block text-muted">
                  {c.issuer}
                  {c.date ? ` · ${c.date}` : ""}
                  {c.status === "in-progress" && c.progress ? ` · ${c.progress}` : ""}
                </span>
              </div>
              {verified ? (
                <Stamp tone="accent" size="sm" rotate={-4}>
                  Verified
                </Stamp>
              ) : c.status === "earned" ? (
                <Stamp tone="ink" size="sm" rotate={-2}>
                  Earned · link pending
                </Stamp>
              ) : c.status === "in-progress" ? (
                <Stamp tone="ink" size="sm" rotate={2}>
                  In progress
                </Stamp>
              ) : (
                <Stamp tone="muted" size="sm" rotate={-3} dashed>
                  Next target
                </Stamp>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
