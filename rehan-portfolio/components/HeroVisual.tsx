"use client";

import { useReducedMotion } from "framer-motion";
import { contourPaths } from "./visuals/contours";

const contours = contourPaths(300, 300, 8, 34, 2);

const nodes = [
  { id: "a", x: 120, y: 150 },
  { id: "b", x: 300, y: 88 },
  { id: "c", x: 476, y: 168 },
  { id: "d", x: 80, y: 330 },
  { id: "e", x: 262, y: 296, hub: true },
  { id: "f", x: 430, y: 360 },
  { id: "g", x: 168, y: 482, field: true },
  { id: "h", x: 344, y: 512 },
  { id: "i", x: 528, y: 468 },
] as const;

const edges: [string, string][] = [
  ["a", "e"], ["b", "e"], ["c", "f"], ["d", "e"], ["e", "f"], ["e", "g"],
  ["f", "h"], ["g", "h"], ["h", "i"], ["f", "i"], ["b", "c"], ["a", "b"],
];
const packets: [string, string, number][] = [
  ["g", "e", 3.2], ["e", "f", 2.6], ["a", "e", 3.8], ["f", "h", 2.9], ["e", "b", 3.4],
];

const pos = (id: string) => nodes.find((n) => n.id === id)!;

const channels = ["PH", "TDS", "TURB", "TEMP"];

function Wave({ offset }: { offset: number }) {
  // periods (40 and 16) divide the 80-unit scroll distance, so the loop is seamless; no values shown
  const pts: string[] = [];
  for (let x = 0; x <= 240; x += 4) {
    const y = 10 + Math.sin(((x + offset) * Math.PI * 2) / 40) * 4 + Math.sin(((x + offset) * Math.PI * 2) / 16) * 1.4;
    pts.push(`${x === 0 ? "M" : "L"}${x} ${y.toFixed(1)}`);
  }
  return (
    <svg viewBox="0 0 80 20" className="h-5 w-full overflow-hidden" aria-hidden>
      <g className="animate-wave">
        <path d={pts.join(" ")} fill="none" className="stroke-accent" strokeWidth="1" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function HeroVisual() {
  const reduce = useReducedMotion();

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px]" role="img" aria-label="Abstract map of network nodes, data flows and contour lines, centred on a field node at Mahim Bay, Mumbai">
      <svg viewBox="0 0 600 600" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="fade" cx="50%" cy="50%" r="50%">
            <stop offset="68%" stopColor="#fff" stopOpacity="1" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="vignette">
            <rect width="600" height="600" fill="url(#fade)" />
          </mask>
        </defs>

        <g mask="url(#vignette)">
          {/* geographic grid */}
          {Array.from({ length: 13 }).map((_, i) => (
            <g key={i}>
              <line x1={i * 50} y1="0" x2={i * 50} y2="600" className="stroke-line" strokeWidth="0.6" />
              <line x1="0" y1={i * 50} x2="600" y2={i * 50} className="stroke-line" strokeWidth="0.6" />
            </g>
          ))}
          {/* terrain contours */}
          {contours.map((d, i) => (
            <path key={i} d={d} fill="none" className="stroke-fg" strokeOpacity={0.12 + i * 0.022} strokeWidth="1" />
          ))}
        </g>

        {/* network edges */}
        {edges.map(([a, b]) => {
          const p = pos(a), q = pos(b);
          return (
            <line
              key={a + b}
              x1={p.x} y1={p.y} x2={q.x} y2={q.y}
              className="animate-dash-flow stroke-fg"
              strokeOpacity="0.38"
              strokeWidth="1.1"
              strokeDasharray="3 5"
            />
          );
        })}

        {/* data packets */}
        {!reduce &&
          packets.map(([a, b, dur], i) => {
            const p = pos(a), q = pos(b);
            return (
              <circle key={i} r="3.2" className="fill-accent">
                <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={`M${p.x} ${p.y} L${q.x} ${q.y}`} />
              </circle>
            );
          })}

        {/* nodes */}
        {nodes.map((n) => (
          <g key={n.id}>
            {"field" in n && n.field && (
              <circle cx={n.x} cy={n.y} r="9" className="animate-pulse-ring fill-none stroke-accent" strokeWidth="1" />
            )}
            <circle
              cx={n.x} cy={n.y}
              r={"hub" in n && n.hub ? 8 : "field" in n && n.field ? 7 : 4.5}
              className={"field" in n && n.field ? "fill-accent" : "fill-bg stroke-fg"}
              strokeWidth="1.2"
              strokeOpacity={"hub" in n && n.hub ? 0.9 : 0.55}
            />
          </g>
        ))}

        {/* labels */}
        <g className="fill-muted" fontFamily="var(--font-jetbrains), monospace" fontSize="13" letterSpacing="1.4">
          <text x="184" y="500" className="fill-accent">MAHIM BAY · SAMUDRA</text>
          <text x="184" y="517">19.04°N 72.84°E</text>
          <text x="278" y="288">SYSTEM CORE</text>
          <text x="22" y="592">72.8°E</text>
          <text x="500" y="592">73.4°E</text>
        </g>
      </svg>

      {/* scan line */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:radial-gradient(circle,black_45%,transparent_68%)]">
        <div className="animate-scan h-24 w-full bg-gradient-to-b from-transparent via-accent/[0.08] to-transparent" />
      </div>

      {/* sensor channels */}
      <div className="absolute right-0 top-2 w-36 rounded-md border border-line bg-bg/80 p-3 backdrop-blur-sm sm:top-6 sm:w-44">
        <p className="label !text-[0.6rem]">Sensor channels</p>
        <ul className="mt-2 space-y-1.5">
          {channels.map((c, i) => (
            <li key={c} className="flex items-center gap-2">
              <span className="w-9 font-mono text-[0.6rem] tracking-wider text-muted">{c}</span>
              <Wave offset={i * 23} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
