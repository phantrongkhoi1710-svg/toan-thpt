interface HalfPlaneLabProps {
  selected: string | null;
  revealed?: boolean;
  correct?: string;
  onSelect: (zone: "above" | "below") => void;
  disabled?: boolean;
}

export function HalfPlaneLab({ selected, revealed, correct, onSelect, disabled }: HalfPlaneLabProps) {
  const cls = (zone: "above" | "below") => {
    const classes = ["hp-zone"];
    if (selected === zone) classes.push("is-selected");
    if (revealed && correct === zone) classes.push("is-correct");
    if (revealed && selected === zone && correct !== zone) classes.push("is-wrong");
    return classes.join(" ");
  };

  return (
    <div className="halfplane" aria-label="Miền nghiệm tương tác">
      <svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gA" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#fb923c" stopOpacity="0.55" />
            <stop offset="1" stopColor="#f97316" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="gB" x1="1" y1="0" x2="0" y2="1">
            <stop stopColor="#818cf8" stopOpacity="0.45" />
            <stop offset="1" stopColor="#6366f1" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <rect width="360" height="240" fill="#0f172a" />
        <line x1="40" y1="200" x2="330" y2="200" stroke="#64748b" strokeWidth="1.5" />
        <line x1="60" y1="220" x2="60" y2="30" stroke="#64748b" strokeWidth="1.5" />
        <polygon
          className={cls("below")}
          data-zone="below"
          points="60,200 320,200 320,50 60,200"
          fill="url(#gA)"
          stroke="#fb923c"
          strokeWidth="1"
          onClick={() => !disabled && onSelect("below")}
        />
        <polygon
          className={cls("above")}
          data-zone="above"
          points="60,200 60,40 320,50 60,200"
          fill="url(#gB)"
          stroke="#818cf8"
          strokeWidth="1"
          onClick={() => !disabled && onSelect("above")}
        />
        <line x1="60" y1="200" x2="320" y2="50" stroke="#fde68a" strokeWidth="3" strokeLinecap="round" />
        <circle cx="60" cy="200" r="4" fill="#f8fafc" />
        <text x="300" y="215" fill="#94a3b8" fontSize="12">
          Ox
        </text>
        <text x="40" y="40" fill="#94a3b8" fontSize="12">
          Oy
        </text>
        <text x="200" y="170" fill="#fdba74" fontSize="13" fontWeight="700" pointerEvents="none">
          A
        </text>
        <text x="100" y="100" fill="#a5b4fc" fontSize="13" fontWeight="700" pointerEvents="none">
          B
        </text>
      </svg>
    </div>
  );
}
