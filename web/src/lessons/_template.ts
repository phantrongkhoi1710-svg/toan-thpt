import { asset } from "../lib/asset";
import type { Lesson } from "../lib/schema";

/**
 * Copy file này thành bai4.ts (hoặc tên bài mới),
 * sửa nội dung, rồi thêm vào mảng `lessons` trong registry.ts.
 *
 * Không cần đụng SlideDeck / ChallengeMap / CSS layout.
 */
export const baiMoi: Lesson = {
  id: "bai-4",
  number: 4,
  slug: "ten-bai",
  title: "Tên bài đầy đủ",
  shortTitle: "Tên ngắn",
  chapter: "Chương I",
  periods: 3,
  blurb: "Một câu mô tả theme + kỹ năng",
  isNew: true,
  theme: {
    id: "logic",
    accentFrom: "#14b8a6",
    accentTo: "#0f766e",
    mapBoardClass: "",
    nodeClass: "",
    xpLabel: "XP",
    mapName: "Thử thách",
    sectionPrefix: "Mức",
    chestClosed: "📦",
    chestOpen: "🎁",
    successText: "Chính xác!",
    failText: "Chưa đúng.",
    lockedToast: "Hãy mở mốc trước đã!",
    resetLabel: "Chơi lại từ đầu",
    resetConfirm: "Xóa tiến độ bài này?",
    brandMark: "book",
  },
  progressKey: "toan-thpt-bai4-v1",
  levelLabels: { 1: "Nhận biết", 2: "Thông hiểu", 3: "Vận dụng", 4: "Vận dụng cao" },
  xpByLevel: { 1: 10, 2: 15, 3: 20, 4: 30 },
  sidebarFoot: "Gợi ý học / luật map của theme này.",
  slides: [
    {
      type: "hero",
      title: "Mở đầu",
      eyebrow: "Toán 10 · 3 tiết",
      heading: "Bài 4. Tên bài",
      body: "Câu chuyện mở đầu.",
      image: asset("images/slide-overview.jpg"),
    },
    {
      type: "content",
      title: "Kiến thức",
      banner: "Chốt kiến thức",
      bannerTone: "teal",
      heading: "Định nghĩa",
      definition: "Viết định nghĩa, có thể dùng \\(x^2\\).",
      bullets: ["Ý 1", "Ý 2"],
    },
    {
      type: "quiz",
      title: "Câu hỏi",
      banner: "Tương tác",
      bannerTone: "orange",
      heading: "Chọn đáp án đúng",
      quiz: {
        kind: "single",
        correct: 0,
        explain: "Lời giải ngắn.",
        options: [{ html: "A" }, { html: "B" }, { html: "C" }, { html: "D" }],
      },
    },
    {
      type: "summary",
      title: "Tóm tắt",
      banner: "Tổng kết",
      bannerTone: "blue",
      heading: "Nhớ nhanh",
      ctaLabel: "Sang Thử thách →",
      parts: [
        { n: "1", title: "Ý 1", text: "Tóm tắt", color: "#14b8a6" },
        { n: "2", title: "Ý 2", text: "Tóm tắt", color: "#f97316" },
      ],
    },
  ],
  challenges: [
    {
      level: 1,
      title: "Mốc 1",
      prompt: "Câu hỏi rõ giả thiết và yêu cầu.",
      options: ["A", "B", "C", "D"],
      answer: 0,
      explain: "Lời giải.",
    },
  ],
};
