/** Deterministic organic contour rings (rounded so server and client markup match). */
export function contourPaths(cx: number, cy: number, count: number, step: number, seed = 1): string[] {
  const paths: string[] = [];
  for (let k = 1; k <= count; k++) {
    const r = k * step;
    const pts: string[] = [];
    const n = 90;
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2;
      const wobble =
        1 +
        0.13 * Math.sin(3 * t + k * 0.6 + seed) +
        0.07 * Math.sin(5 * t - k * 1.1 + seed * 2) +
        0.035 * Math.sin(9 * t + k * 0.4);
      const x = cx + Math.cos(t) * r * wobble;
      const y = cy + Math.sin(t) * r * wobble * 0.86;
      pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    paths.push(pts.join(" ") + " Z");
  }
  return paths;
}
