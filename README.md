# Toán THPT

Hệ thống bài giảng Toán 10: **bài giảng tương tác + thử thách**, viết bằng React.

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

## Đăng nhập & giám sát (Supabase)

Project: [xiieyrbqsjnpdphyjioi](https://supabase.com/dashboard/project/xiieyrbqsjnpdphyjioi)

1. Mở [SQL Editor](https://supabase.com/dashboard/project/xiieyrbqsjnpdphyjioi/sql/new), dán và chạy `supabase/schema.sql`.
2. Lấy **anon public** key ở [API Settings](https://supabase.com/dashboard/project/xiieyrbqsjnpdphyjioi/settings/api).
3. Tạo `web/.env.local`:

```
VITE_SUPABASE_URL=https://xiieyrbqsjnpdphyjioi.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

4. Authentication → URL configuration:
   - Site URL: `https://phantrongkhoi1710-svg.github.io/toan-thpt/`
   - Redirect: `http://localhost:5173/**` và `https://phantrongkhoi1710-svg.github.io/toan-thpt/**`
5. Nên tắt **Confirm email** nếu dùng trong lớp (Auth → Providers → Email).
6. Chạy tiếp `supabase/seed_class_test.sql` để tạo **Lớp test**:
   - GV: `gv.quynh@toanthpt.test` / `Pass01` · Nguyễn Trúc Quỳnh
   - HS: `user01@toanthpt.test` → `user40@toanthpt.test` / `Pass01`
7. GitHub repo → Settings → Secrets → Actions, thêm `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`.

- Học sinh đăng nhập mới làm được thử thách (tiến độ lưu cloud).
- Giáo viên vào mục **Giám sát** để xem XP / số mốc từng bài.

## Deploy

Push lên `main` → GitHub Actions build Vite và publish GitHub Pages.
