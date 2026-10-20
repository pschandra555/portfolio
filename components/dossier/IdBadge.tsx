import { about, profile } from "@/content/site";
import { Barcode } from "./Barcode";
import { Stamp } from "./Stamp";
import { PhotoWithheld } from "./PhotoWithheld";

/** EXHIBIT A: the subject's ID badge. */
export function IdBadge() {
  const initials = profile.firstName[0] + profile.lastName[0];
  return (
    <figure className="relative rotate-[1.5deg] border border-rule bg-raised p-4 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)]">
      {/* lanyard slot */}
      <span aria-hidden="true" className="mx-auto mb-4 block h-2 w-14 rounded-full border border-rule bg-bg" />
      <div className="t-label mb-3 flex justify-between text-muted">
        <span>EXHIBIT A</span>
        <span>ID · {profile.caseNo}</span>
      </div>
      {about.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={about.photo} alt={`Portrait of ${profile.name}`} className="aspect-[22/26] w-full object-cover grayscale" />
      ) : (
        <PhotoWithheld initials={initials} />
      )}
      <dl className="t-label mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        {about.badge.map((f) => (
          <div key={f.k}>
            <dt className="text-[10px] text-muted">{f.k}</dt>
            <dd className="text-ink">{f.v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex items-end justify-between">
        <Barcode value={profile.name} height={24} />
        <Stamp tone="accent" size="sm" rotate={-8}>
          Declassified
        </Stamp>
      </div>
      <figcaption className="sr-only">
        ID badge for {profile.name}. {about.badge.map((f) => `${f.k}: ${f.v}`).join(". ")}.
      </figcaption>
    </figure>
  );
}
