/** Deterministic barcode generated from a string. Decorative. */
export function Barcode({ value, height = 28, className = "" }: { value: string; height?: number; className?: string }) {
  let seed = 0;
  for (const ch of value) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  while (x < 120) {
    const w = 1 + Math.floor(rand() * 3);
    bars.push({ x, w });
    x += w + 1 + Math.floor(rand() * 3);
  }
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${x} ${height}`}
      width={x}
      height={height}
      className={`text-ink ${className}`}
      preserveAspectRatio="none"
    >
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={height} fill="currentColor" />
      ))}
    </svg>
  );
}
