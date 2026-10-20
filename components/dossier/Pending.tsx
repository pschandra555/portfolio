import { isPending } from "@/content/site";

/**
 * Renders a value, or an honest redaction when it doesn't exist yet.
 * Fake metrics are worse than no metrics.
 */
export function Pending({ value, className = "" }: { value: string | null | undefined; className?: string }) {
  if (!isPending(value)) return <span className={className}>{value}</span>;
  return (
    <span className={`t-label inline-flex items-center gap-1.5 text-muted ${className}`}>
      <span aria-hidden="true" className="inline-block h-[0.9em] w-10 bg-redact/80" />
      <span>[PENDING DATA]</span>
    </span>
  );
}
