interface VennLabProps {
  selected: string[];
  revealed?: boolean;
  correct?: string[];
  onToggle: (zone: string) => void;
  disabled?: boolean;
}

export function VennLab({ selected, revealed, correct = [], onToggle, disabled }: VennLabProps) {
  const state = (zone: string) => {
    const on = selected.includes(zone);
    if (revealed && correct.includes(zone)) return "is-correct";
    if (revealed && on && !correct.includes(zone)) return "is-wrong";
    if (on) return "is-selected";
    return "";
  };

  return (
    <div className="venn-lab" aria-label="Biểu đồ Ven tương tác">
      <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" rx="16" fill="#ecfeff" />
        <circle
          className={`venn-zone ${state("onlyA")}`}
          cx="120"
          cy="100"
          r="70"
          fill="#67e8f9"
          fillOpacity="0.45"
          stroke="#0891b2"
          strokeWidth="2"
          onClick={() => !disabled && onToggle("onlyA")}
        />
        <circle
          className={`venn-zone ${state("onlyB")}`}
          cx="200"
          cy="100"
          r="70"
          fill="#c4b5fd"
          fillOpacity="0.45"
          stroke="#6d28d9"
          strokeWidth="2"
          onClick={() => !disabled && onToggle("onlyB")}
        />
        <path
          className={`venn-zone ${state("inter")}`}
          d="M160,42 a70,70 0 0 1 0,116 a70,70 0 0 1 0,-116"
          fill="#5eead4"
          fillOpacity="0.7"
          stroke="#0f766e"
          strokeWidth="2"
          onClick={() => !disabled && onToggle("inter")}
        />
        <text x="92" y="108" fontSize="26" fontWeight="800" fill="#155e75" pointerEvents="none">
          A
        </text>
        <text x="228" y="114" fontSize="26" fontWeight="800" fill="#6d28d9" pointerEvents="none">
          B
        </text>
        <text x="160" y="118" fontSize="16" fontWeight="800" fill="#065f46" pointerEvents="none" textAnchor="middle">
          ∩
        </text>
      </svg>
    </div>
  );
}
