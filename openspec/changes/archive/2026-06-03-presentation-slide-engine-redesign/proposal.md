## Why

目前 BNI 簡報系統只把例會資料整理成可發布的 HTML 長頁與管理工作台，沒有達到先前討論與 `ui-mockup-admin.html` 裡的簡報管理模式，也不像 open-slide 類型的 1920x1080 slide runtime。這導致管理端看似能產生簡報，但前台播放、縮圖管理、present mode 與真正投影使用情境都不符合預期。

## What Changes

- 將 `/presentation/[week-date]` 從多段長頁改為公開、無 app chrome 的 1920x1080 slide viewer，只顯示目前 slide 並提供鍵盤與按鈕導覽。
- 新增 `/presentation/[week-date]/present` present mode，顯示 current slide、next slide preview、timer 與 speaker notes fallback。
- 將 `/admin/presentation` 對齊 `ui-mockup-admin.html`：週次狀態列、公開連結、更新時間、投影片數量、slide thumbnail grid、Preview / Publish / Unpublish 操作。
- 讓 slide components 明確遵守固定 1920x1080 canvas 契約，包含 Cover、Agenda、Team、Member、Guest、Keynote、Award、VP Report、Closing。
- 保留既有 Supabase 資料來源與 `presentations.slide_order`，不要求管理者寫 HTML 或程式碼。
- 第一版採 BNI 內建 runtime，參考 open-slide 能力但不直接引入 open-slide package 或獨立子站。

## Non-Goals

- 不在第一版做 PDF 匯出。
- 不在第一版做完整視覺編輯器、任意拖拉排版或程式碼型 slide editor。
- 不導入 R2 或 open-slide assets manager；素材仍沿用現有 Supabase Storage 與資料表。
- 不重寫 auth、member module、guest module 或 weekly data schema。

## Capabilities

### New Capabilities

- `presentation-present-mode`: Present mode route and runtime behavior for speaker-facing presentation playback.

### Modified Capabilities

- `presentation-publishing`: Admin presentation surface must expose mockup-style slide thumbnails, status, public link, preview, publish, and unpublish controls.
- `slide-builder`: Generated slide_order must include agenda and closing entries so the BNI deck has a complete meeting flow.
- `slide-viewer`: Public viewer must become a controlled 1920x1080 slide runtime with navigation instead of a long HTML page.
- `slide-components`: Slide components must render inside a fixed 1920x1080 canvas and include the first-version BNI deck slide types.

## Impact

- Affected specs: presentation-publishing, slide-builder, slide-viewer, slide-components, presentation-present-mode
- Affected code:
  - New: app/presentation/[week-date]/present/page.tsx, components/slides/deck-runtime.tsx, lib/presentation/runtime.ts, lib/presentation/runtime.test.ts
  - Modified: app/presentation/[week-date]/page.tsx, app/(admin)/admin/presentation/page.tsx, app/(admin)/admin/presentations/[id]/page.tsx, components/slides/index.tsx, components/slides/shared.tsx, lib/presentation/builder.ts, lib/presentation/slide-order.ts, lib/presentation/viewer.tsx, lib/presentation/types.ts, lib/actions/presentations.ts, e2e/admin-member.spec.ts
  - Removed: none
