/** Crop/fold ticks at a sheet's corners and its one-third fold line. Decorative. */
export function FoldMarks() {
  const tick = "absolute bg-rule";
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <span className={`${tick} left-0 top-0 h-px w-4`} />
      <span className={`${tick} left-0 top-0 h-4 w-px`} />
      <span className={`${tick} right-0 top-0 h-px w-4`} />
      <span className={`${tick} right-0 top-0 h-4 w-px`} />
      <span className={`${tick} bottom-0 left-0 h-px w-4`} />
      <span className={`${tick} bottom-0 left-0 h-4 w-px`} />
      <span className={`${tick} bottom-0 right-0 h-px w-4`} />
      <span className={`${tick} bottom-0 right-0 h-4 w-px`} />
      {/* one-third fold, like a letter folded for an envelope */}
      <span className={`${tick} left-0 top-1/3 h-px w-2 opacity-70`} />
      <span className={`${tick} right-0 top-1/3 h-px w-2 opacity-70`} />
    </div>
  );
}
