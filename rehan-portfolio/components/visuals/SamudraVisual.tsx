const wave = (() => {
  // 160-unit period so translating by 160 loops seamlessly
  const pts: string[] = [];
  for (let x = 0; x <= 480; x += 4) {
    pts.push(`${x === 0 ? "M" : "L"}${x} ${(Math.sin((x * Math.PI * 2) / 160) * 5).toFixed(1)}`);
  }
  return pts.join(" ");
})();

const mono = { fontFamily: "var(--font-jetbrains), monospace" } as const;

const stages = [
  { x: 210, label: "ESP32" },
  { x: 330, label: "LORA" },
  { x: 447, label: "CLOUD" },
  { x: 565, label: "DASHBOARD" },
];

const probes = ["pH", "TDS", "TURB", "TEMP"];

export function SamudraVisual() {
  return (
    <svg
      viewBox="0 0 640 400"
      className="h-full w-full"
      role="img"
      aria-label="Schematic of the Samudra pipeline: water sensors, ESP32, LoRa, cloud and dashboard"
    >
      <rect width="640" height="400" className="fill-surface" />
      {Array.from({ length: 14 }).map((_, i) => (
        <line key={i} x1={i * 48} y1="0" x2={i * 48} y2="400" className="stroke-line" strokeWidth="0.5" />
      ))}

      {/* water body */}
      <rect x="0" y="255" width="150" height="145" className="fill-accent" fillOpacity="0.05" />
      <svg x="0" y="245" width="150" height="20" viewBox="0 0 150 20" overflow="hidden">
        <g transform="translate(0 10)">
          <g className="animate-wave" style={{ animationDuration: "8s" }}>
            <path d={wave} fill="none" className="stroke-accent" strokeWidth="1.2" strokeOpacity="0.7" />
          </g>
        </g>
      </svg>

      {/* sensor probes */}
      {probes.map((s, i) => {
        const x = 26 + i * 32;
        const y = 290 + (i % 2) * 16;
        return (
          <g key={s}>
            <line x1={x} y1="140" x2={x} y2={y} className="stroke-fg" strokeOpacity="0.5" strokeWidth="1.4" />
            <circle cx={x} cy={y} r="4" className="fill-accent" />
            <text x={x} y="128" textAnchor="middle" className="fill-muted" style={mono} fontSize="8" letterSpacing="0.5">
              {s}
            </text>
          </g>
        );
      })}
      <text x="16" y="380" className="fill-muted" style={mono} fontSize="9" letterSpacing="1.2">
        WATER SENSORS
      </text>

      {/* flow lines */}
      {["M150 190 H168", "M252 190 H300", "M362 190 H410", "M484 190 H506"].map((d) => (
        <path key={d} d={d} className="animate-dash-flow stroke-accent" strokeDasharray="4 4" strokeWidth="1.4" fill="none" />
      ))}

      {/* ESP32 chip */}
      <rect x="168" y="150" width="84" height="80" rx="4" className="fill-bg stroke-fg" strokeOpacity="0.6" />
      {Array.from({ length: 6 }).map((_, i) => (
        <g key={i}>
          <line x1={176 + i * 13} y1="150" x2={176 + i * 13} y2="143" className="stroke-fg" strokeOpacity="0.5" />
          <line x1={176 + i * 13} y1="230" x2={176 + i * 13} y2="237" className="stroke-fg" strokeOpacity="0.5" />
        </g>
      ))}
      <rect x="186" y="168" width="48" height="44" rx="2" className="fill-none stroke-accent" strokeOpacity="0.8" />
      <circle cx="198" cy="178" r="2" className="fill-accent" />

      {/* LoRa arcs */}
      <g className="stroke-accent" fill="none" strokeWidth="1.4">
        <circle cx="304" cy="190" r="3" className="fill-accent" />
        <path d="M314 178 A16 16 0 0 1 314 202" strokeOpacity="0.9" />
        <path d="M324 168 A28 28 0 0 1 324 212" strokeOpacity="0.6" />
        <path d="M334 158 A40 40 0 0 1 334 222" strokeOpacity="0.35" />
      </g>

      {/* cloud / data layer */}
      {[156, 184, 212].map((y) => (
        <g key={y}>
          <rect x="410" y={y} width="74" height="22" rx="3" className="fill-bg stroke-fg" strokeOpacity="0.5" />
          <circle cx="422" cy={y + 11} r="2" className="fill-accent" />
        </g>
      ))}

      {/* dashboard */}
      <rect x="506" y="132" width="118" height="116" rx="5" className="fill-bg stroke-fg" strokeOpacity="0.6" />
      <line x1="506" y1="150" x2="624" y2="150" className="stroke-line" />
      <circle cx="516" cy="141" r="2" className="fill-muted" />
      <circle cx="524" cy="141" r="2" className="fill-muted" />
      <polyline
        points="516,230 534,210 548,218 564,186 580,196 596,170 614,178"
        fill="none"
        className="stroke-accent"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <line x1="516" y1="236" x2="614" y2="236" className="stroke-line" />
      <rect x="516" y="158" width="38" height="6" rx="1" className="fill-muted" fillOpacity="0.4" />

      {stages.map((s) => (
        <text key={s.label} x={s.x} y="268" textAnchor="middle" className="fill-muted" style={mono} fontSize="9" letterSpacing="1.2">
          {s.label}
        </text>
      ))}

      <rect x="16" y="16" width="214" height="22" rx="11" className="fill-none stroke-accent" strokeOpacity="0.5" />
      <circle cx="30" cy="27" r="3" className="fill-accent" />
      <text x="42" y="31" className="fill-accent" style={mono} fontSize="9" letterSpacing="1.4">
        PROTOTYPE · MAHIM BAY
      </text>
    </svg>
  );
}
