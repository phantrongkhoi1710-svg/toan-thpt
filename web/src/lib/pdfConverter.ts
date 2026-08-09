import * as pdfjsLib from "pdfjs-dist";
import type { Slide } from "./schema";

// Cấu hình worker cho PDF.js trên Vite
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
} catch {
  // fallback nếu cdn không tải được
}

export interface ConvertPdfProgress {
  current: number;
  total: number;
}

export async function convertPdfToSlides(
  fileData: ArrayBuffer | Uint8Array,
  fileName: string = "Bài giảng",
  onProgress?: (progress: ConvertPdfProgress) => void
): Promise<Slide[]> {
  const loadingTask = pdfjsLib.getDocument({ data: fileData });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const slides: Slide[] = [];

  const baseTitle = fileName.replace(/\.[^/.]+$/, "");

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (onProgress) {
      onProgress({ current: pageNum, total: numPages });
    }

    const page = await pdf.getPage(pageNum);
    // Render ở scale 1.5 cho ảnh nét và dung lượng vừa phải
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) continue;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    }).promise;

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    if (pageNum === 1) {
      slides.push({
        type: "hero",
        title: "Trang bìa",
        eyebrow: baseTitle,
        heading: baseTitle,
        body: "Chào mừng các em đến với bài học. Cùng quan sát slide và tiếp thu kiến thức!",
        image: dataUrl,
        imageAlt: `${baseTitle} - Trang 1`,
      });
    } else if (pageNum === numPages && numPages > 1) {
      slides.push({
        type: "summary",
        title: "Tóm tắt & Thử thách",
        banner: "Tổng kết",
        bannerTone: "blue",
        heading: "Đã hoàn thành nội dung slide bài giảng",
        ctaLabel: "Sang Thử thách →",
        parts: [
          { n: "1", title: "Lý thuyết", text: `Đã xem ${numPages} trang bài giảng`, color: "#2563eb" },
          { n: "2", title: "Thử thách", text: "Chuyển sang làm bài tập củng cố", color: "#10b981" },
        ],
      });
    } else {
      slides.push({
        type: "content",
        title: `Trang ${pageNum}`,
        banner: `Phần ${pageNum}`,
        bannerTone: "teal",
        heading: `${baseTitle} · Trang ${pageNum}`,
        image: dataUrl,
        imageAlt: `${baseTitle} - Trang ${pageNum}`,
        definition: `Quan sát nội dung trang ${pageNum} để nắm vững kiến thức trọng tâm.`,
      });
    }
  }

  return slides;
}
