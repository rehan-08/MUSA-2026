const blobs = [
  { x: 210, y: 150, r: 74, o: 0.5 },
  { x: 250, y: 200, r: 56, o: 0.38 },
  { x: 430, y: 270, r: 82, o: 0.34 },
  { x: 470, y: 120, r: 50, o: 0.22 },
  { x: 120, y: 290, r: 54, o: 0.2 },
];
const mono = { fontFamily: "var(--font-jetbrains), monospace" } as const;

export function SafeCityVisual() {
  return (
    <svg
      viewBox="0 0 640 400"
      className="h-full w-full"
      role="img"
      aria-label="Schematic of SafeCity: a street map with a risk heatmap, a direct route through risky areas and a safer alternative route"
    >
      <defs>
        <radialGradient id="sc-heat">
          <stop offset="0%" stopColor="#f5f5f5" stopOpacity="1" />
          <stop offset="100%" stopColor="#f5f5f5" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="640" height="400" className="fill-surface" />

      {Array.from({ length: 14 }).map((_, i) => (
        <line key={"v" + i} x1={i * 50 + (i % 3) * 4} y1="0" x2={i * 50 - (i % 2) * 6} y2="400" className="stroke-line" strokeWidth={i % 4 === 0 ? 1.2 : 0.6} />
      ))}
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={"h" + i} x1="0" y1={i * 50 + (i % 3) * 3} x2="640" y2={i * 50 - (i % 2) * 5} className="stroke-line" strokeWidth={i % 3 === 0 ? 1.2 : 0.6} />
      ))}

      {blobs.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="url(#sc-heat)" fillOpacity={b.o * 0.5} />
      ))}

      <path d="M90 330 L210 220 L300 190 L420 160 L560 90" fill="none" className="stroke-muted" strokeWidth="1.6" strokeDasharray="2 6" strokeLinecap="round" />
      <path d="M90 330 L150 360 L330 340 L520 330 L560 220 L560 90" fill="none" className="animate-dash-flow stroke-accent" strokeWidth="2.2" strokeDasharray="8 5" strokeLinejoin="round" />

      <g style={mono} fontSize="10" fontWeight="600">
        <circle cx="90" cy="330" r="10" className="fill-accent" />
        <text x="90" y="334" textAnchor="middle" className="fill-bg">A</text>
        <circle cx="560" cy="90" r="10" className="fill-accent" />
        <text x="560" y="94" textAnchor="middle" className="fill-bg">B</text>
      </g>

      <g transform="translate(18 18)">
        <rect width="150" height="68" rx="5" className="fill-bg stroke-fg" strokeOpacity="0.5" />
        <text x="12" y="19" className="fill-muted" style={mono} fontSize="8.5" letterSpacing="1.4">RISK CLASS</text>
        {[0.15, 0.4, 0.8].map((o, i) => (
          <g key={i} transform={`translate(${12 + i * 44} 30)`}>
            <rect width="34" height="8" rx="1" className="fill-fg" fillOpacity={o} />
            <text y="24" className="fill-muted" style={mono} fontSize="7.5" letterSpacing="1">{["LOW", "MED", "HIGH"][i]}</text>
          </g>
        ))}
      </g>

      <g transform="translate(500 382)" style={mono} fontSize="8.5" letterSpacing="1.2">
        <line x1="-84" y1="-22" x2="-62" y2="-22" className="stroke-muted" strokeDasharray="2 4" strokeWidth="1.6" />
        <text x="-54" y="-19" className="fill-muted">SHORTEST</text>
        <line x1="-84" y1="-8" x2="-62" y2="-8" className="stroke-accent" strokeWidth="2" />
        <text x="-54" y="-5" className="fill-accent">SAFER</text>
      </g>
    </svg>
  );
}
