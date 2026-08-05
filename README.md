# Toán THPT

Hệ thống bài giảng Toán 10: **slide tương tác + challenge map**, viết bằng React.

Site: https://phantrongkhoi1710-svg.github.io/toan-thpt/

## Chạy local

```bash
cd web
npm install
npm run dev
```

Mở địa chỉ Vite in ra (thường `http://localhost:5173`).

## Cách thêm bài mới

1. Copy `web/src/lessons/_template.ts` → `web/src/lessons/bai4.ts`
2. Điền `meta`, `slides`, `challenges`
3. Đăng ký trong `web/src/lessons/registry.ts`:

```ts
import { bai4 } from "./bai4";
export const lessons: Lesson[] = [bai1, bai2, bai3, bai4];
```

4. Ảnh để trong `web/public/images/...`, gọi bằng `asset("images/...")`

Không cần copy HTML/CSS/JS của bài cũ. Engine chung:

- `SlideDeck` — hero / kiến thức / quiz / lab Ven / lab nửa mặt phẳng / tóm tắt
- `ChallengeMap` — mở mốc lần lượt, XP, streak, `localStorage`

## Cấu trúc

```
web/src/lessons/     dữ liệu từng bài
web/src/lib/schema.ts   kiểu chuẩn
web/src/components/     engine UI
web/public/images/      ảnh SGK / minh họa
```

## Deploy

Push lên `main` → GitHub Actions build Vite và publish GitHub Pages.
