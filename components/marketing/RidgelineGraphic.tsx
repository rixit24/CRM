// The signature visual: a pipeline drawn as an ascending ridgeline, each
// peak labeled with a real CRM pipeline stage. It's the one image this
// product should be remembered by — reused full-size in the hero and as a
// quiet divider elsewhere, never as generic decoration.
const STAGES = [
  { label: "Lead", x: 40, y: 210 },
  { label: "Qualified", x: 190, y: 160 },
  { label: "Proposal", x: 340, y: 105 },
  { label: "Negotiation", x: 490, y: 130 },
  { label: "Won", x: 640, y: 40 },
];

export function RidgelineHero() {
  const path = `M ${STAGES.map((s) => `${s.x} ${s.y}`).join(" L ")}`;
  return (
    <svg
      viewBox="0 0 700 260"
      className="w-full max-w-2xl"
      role="img"
      aria-label="A pipeline drawn as an ascending ridgeline from Lead to Won"
    >
      <path d={`${path} L 640 260 L 40 260 Z`} fill="#3F6659" opacity="0.08" />
      <path d={path} fill="none" stroke="#3F6659" strokeWidth="3" strokeLinejoin="round" />
      {STAGES.map((s, i) => (
        <g key={s.label}>
          <circle
            cx={s.x}
            cy={s.y}
            r={i === STAGES.length - 1 ? 8 : 6}
            fill={i === STAGES.length - 1 ? "#D6A244" : "#16203A"}
          />
          <text
            x={s.x}
            y={s.y - 16}
            textAnchor="middle"
            className="fill-ink font-display text-[13px] font-semibold"
          >
            {s.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function RidgelineDivider() {
  const path = `M ${STAGES.map((s) => `${s.x} ${40 + s.y * 0.12}`).join(" L ")}`;
  return (
    <svg viewBox="0 0 700 60" className="h-8 w-full" aria-hidden="true">
      <path d={path} fill="none" stroke="#D8D6CD" strokeWidth="2" />
    </svg>
  );
}
