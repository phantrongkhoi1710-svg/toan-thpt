interface MathToolbarProps {
  onInsert: (tex: string) => void;
}

const MATH_ITEMS: { label: string; insert: string; title: string }[] = [
  { label: "∀", insert: "\\forall ", title: "Với mọi (\\forall)" },
  { label: "∃", insert: "\\exists ", title: "Tồn tại (\\exists)" },
  { label: "∈", insert: "\\in ", title: "Thuộc (\\in)" },
  { label: "∉", insert: "\\notin ", title: "Không thuộc (\\notin)" },
  { label: "⊂", insert: "\\subset ", title: "Tập con (\\subset)" },
  { label: "∪", insert: "\\cup ", title: "Hợp (\\cup)" },
  { label: "∩", insert: "\\cap ", title: "Giao (\\cap)" },
  { label: "∖", insert: "\\setminus ", title: "Hiệu (\\setminus)" },
  { label: "∅", insert: "\\emptyset ", title: "Tập rỗng (\\emptyset)" },
  { label: "⇒", insert: "\\Rightarrow ", title: "Kéo theo (\\Rightarrow)" },
  { label: "⇔", insert: "\\Leftrightarrow ", title: "Tương đương (\\Leftrightarrow)" },
  { label: "≠", insert: "\\neq ", title: "Khác (\\neq)" },
  { label: "≤", insert: "\\le ", title: "Nhỏ hơn hoặc bằng (\\le)" },
  { label: "≥", insert: "\\ge ", title: "Lớn hơn hoặc bằng (\\ge)" },
  { label: "R", insert: "\\mathbb{R}", title: "Tập số thực (\\mathbb{R})" },
  { label: "N", insert: "\\mathbb{N}", title: "Tập số tự nhiên (\\mathbb{N})" },
  { label: "Z", insert: "\\mathbb{Z}", title: "Tập số nguyên (\\mathbb{Z})" },
  { label: "Q", insert: "\\mathbb{Q}", title: "Tập số hữu tỉ (\\mathbb{Q})" },
  { label: "x²", insert: "^{2}", title: "Mũ 2" },
  { label: "x_n", insert: "_{1}", title: "Chỉ số dưới" },
  { label: "a/b", insert: "\\frac{a}{b}", title: "Phân số (\\frac{a}{b})" },
  { label: "√x", insert: "\\sqrt{x}", title: "Căn bậc hai (\\sqrt{x})" },
  { label: "P̄", insert: "\\overline{P}", title: "Mệnh đề phủ định (\\overline{P})" },
];

export function MathToolbar({ onInsert }: MathToolbarProps) {
  return (
    <div className="math-toolbar" title="Bấm để chèn nhanh ký hiệu Toán học">
      <div className="math-toolbar__label">Chèn ký hiệu nhanh:</div>
      <div className="math-toolbar__buttons">
        {MATH_ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
            className="math-toolbar__btn"
            title={item.title}
            onClick={() => onInsert(item.insert)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
