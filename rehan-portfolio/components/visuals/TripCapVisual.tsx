const days = [
  { d: "DAY 1", w: [96, 70] },
  { d: "DAY 2", w: [110, 84, 60] },
  { d: "DAY 3", w: [88, 104] },
  { d: "DAY 4", w: [100, 66, 90] },
];
const bars = [64, 104, 48, 124, 82, 56];
const mono = { fontFamily: "var(--font-jetbrains), monospace" } as const;

export function TripCapVisual() {
  return (
    <svg
      viewBox="0 0 640 400"
      className="h-full w-full"
      role="img"
      aria-label="Schematic of the TripCap workspace: itinerary timeline, expense chart and export action"
    >
      <rect width="640" height="400" className="fill-surface" />

      <g style={mono} fontSize="9" letterSpacing="1.4">
        {["ITINERARY", "EXPENSES", "BOOKINGS", "HISTORY"].map((t, i) => (
          <g key={t} transform={`translate(${28 + i * 92} 28)`}>
            <text className={i === 0 ? "fill-accent" : "fill-muted"}>{t}</text>
            {i === 0 && <line x1="0" y1="9" x2="62" y2="9" className="stroke-accent" />}
          </g>
        ))}
      </g>
      <line x1="0" y1="52" x2="640" y2="52" className="stroke-line" />

      <line x1="46" y1="76" x2="46" y2="368" className="stroke-line" />
      {days.map((day, i) => (
        <g key={day.d} transform={`translate(0 ${72 + i * 74})`}>
          <circle cx="46" cy="6" r="4.5" className={i === 1 ? "fill-accent" : "fill-bg stroke-fg"} strokeOpacity="0.7" />
          <text x="64" y="10" className="fill-muted" style={mono} fontSize="9" letterSpacing="1.4">{day.d}</text>
          {day.w.map((w, j) => (
            <rect key={j} x="64" y={20 + j * 16} width={w + 20} height="11" rx="2" className="fill-fg" fillOpacity={j === 0 ? 0.16 : 0.08} />
          ))}
        </g>
      ))}

      <g transform="translate(358 78)">
        <rect width="262" height="198" rx="6" className="fill-bg stroke-fg" strokeOpacity="0.45" />
        <text x="16" y="24" className="fill-muted" style={mono} fontSize="9" letterSpacing="1.4">EXPENSES</text>
        {bars.map((h, i) => (
          <rect key={i} x={20 + i * 40} y={178 - h} width="24" height={h} rx="2" className={i === 3 ? "fill-accent" : "fill-fg"} fillOpacity={i === 3 ? 0.9 : 0.2} />
        ))}
        <line x1="14" y1="178" x2="248" y2="178" className="stroke-line" />
      </g>

      <g transform="translate(358 292)">
        <rect width="170" height="64" rx="6" className="fill-none stroke-fg" strokeOpacity="0.3" strokeDasharray="3 4" />
        <text x="14" y="24" className="fill-muted" style={mono} fontSize="8.5" letterSpacing="1.4">ACTIVITY IDEAS</text>
        <rect x="14" y="36" width="104" height="5" rx="1" className="fill-fg" fillOpacity="0.2" />
        <rect x="14" y="47" width="76" height="5" rx="1" className="fill-fg" fillOpacity="0.12" />
      </g>
      <g transform="translate(540 306)">
        <rect width="80" height="36" rx="18" className="fill-accent" />
        <text x="40" y="22.5" textAnchor="middle" className="fill-bg" style={mono} fontSize="9" fontWeight="600" letterSpacing="1.2">EXPORT</text>
      </g>
    </svg>
  );
}
