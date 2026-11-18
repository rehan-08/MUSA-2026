import { contourPaths } from "./contours";

const land = contourPaths(360, 210, 6, 26, 5);
const layerRows = ["LAYER A", "LAYER B", "LAYER C", "LAYER D"];
const markers = [
  [300, 150], [380, 120], [420, 220], [330, 250], [270, 200], [450, 160], [360, 190],
];
const mono = { fontFamily: "var(--font-jetbrains), monospace" } as const;

export function GeoMonitorVisual() {
  return (
    <svg
      viewBox="0 0 640 400"
      className="h-full w-full"
      role="img"
      aria-label="Schematic of the GeoMonitor interface: an interactive map with toggleable data layers and a detail panel"
    >
      <rect width="640" height="400" className="fill-surface" />
      {Array.from({ length: 14 }).map((_, i) => (
        <line key={"v" + i} x1={i * 48} y1="0" x2={i * 48} y2="400" className="stroke-line" strokeWidth="0.5" />
      ))}
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={"h" + i} x1="0" y1={i * 48} x2="640" y2={i * 48} className="stroke-line" strokeWidth="0.5" />
      ))}

      {land.map((d, i) => (
        <path
          key={i}
          d={d}
          className={`stroke-fg ${i === 0 ? "fill-accent" : "fill-none"}`}
          fillOpacity={i === 0 ? 0.05 : 0}
          strokeOpacity={0.1 + i * 0.045}
          strokeWidth="0.9"
        />
      ))}

      <polyline
        points="300,150 380,120 450,160 420,220 330,250 270,200 300,150"
        fill="none"
        className="animate-dash-flow stroke-accent"
        strokeOpacity="0.5"
        strokeDasharray="3 5"
      />
      {markers.map(([x, y], i) => (
        <g key={i}>
          {i % 3 === 0 && <circle cx={x} cy={y} r="7" className="animate-pulse-ring fill-none stroke-accent" />}
          {i % 2 === 0 ? (
            <circle cx={x} cy={y} r="3.5" className="fill-accent" />
          ) : (
            <rect x={x - 3} y={y - 3} width="6" height="6" className="fill-bg stroke-fg" strokeOpacity="0.8" />
          )}
        </g>
      ))}

      <g className="stroke-accent" strokeOpacity="0.6" strokeWidth="0.8">
        <line x1="360" y1="150" x2="360" y2="230" />
        <line x1="320" y1="190" x2="400" y2="190" />
        <circle cx="360" cy="190" r="14" fill="none" />
      </g>

      <rect x="18" y="18" width="130" height="130" rx="5" className="fill-bg stroke-fg" strokeOpacity="0.5" />
      <text x="30" y="38" className="fill-muted" style={mono} fontSize="8.5" letterSpacing="1.4">LAYERS</text>
      {layerRows.map((r, i) => (
        <g key={r} transform={`translate(30 ${54 + i * 22})`}>
          <rect width="22" height="10" rx="5" className={i < 3 ? "fill-accent" : "fill-line"} />
          <circle cx={i < 3 ? 17 : 5} cy="5" r="3.4" className="fill-bg" />
          <text x="32" y="8.5" className="fill-fg" fillOpacity="0.8" style={mono} fontSize="8.5" letterSpacing="1">{r}</text>
        </g>
      ))}

      <rect x="486" y="226" width="136" height="156" rx="5" className="fill-bg stroke-fg" strokeOpacity="0.5" />
      <text x="498" y="246" className="fill-accent" style={mono} fontSize="8.5" letterSpacing="1.4">SELECTED</text>
      <rect x="498" y="256" width="88" height="7" rx="1" className="fill-fg" fillOpacity="0.5" />
      <rect x="498" y="272" width="110" height="4" rx="1" className="fill-muted" fillOpacity="0.4" />
      <rect x="498" y="282" width="96" height="4" rx="1" className="fill-muted" fillOpacity="0.4" />
      <rect x="498" y="292" width="104" height="4" rx="1" className="fill-muted" fillOpacity="0.4" />
      <polyline points="498,360 514,346 528,352 544,332 560,338 578,320 608,326" fill="none" className="stroke-accent" strokeWidth="1.4" />

      <text x="22" y="384" className="fill-muted" style={mono} fontSize="8.5" letterSpacing="1.4">WEBGL MAP · REAL-TIME LAYERS</text>
    </svg>
  );
}
