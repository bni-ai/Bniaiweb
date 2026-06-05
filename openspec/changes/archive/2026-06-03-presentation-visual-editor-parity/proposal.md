## Why

目前 `/admin/presentations/[id]` 只是一個排序與顯示切換工作台，不能直接編文字、上傳底圖、調整字級，也無法滿足「後台修改後，前台立即以 HTML 投影片呈現」的需求。這個 change 要把簡報後台升級成第一階段可用的內容編輯器，同時保留既有週次、發布與公開 URL 流程。

## What Changes

- 新增固定欄位式簡報編輯能力：每張投影片可編標題、內文、底圖、字級、排序與顯示狀態。
- 前台 `/presentation/[week-date]` 改成 Reveal.js 驅動的 HTML 投影片播放器，保留翻頁與公開連結模式。
- 既有 `slide_order` 內部契約延伸為可攜帶簡報編輯內容，避免第一階段先引入新資料表欄位。
- 管理端工作台從「排序工具」升級成「內容編輯 + 預覽 + 發布」表面。

## Non-Goals

- 第一階段不做拖拉式版面編輯器。
- 第一階段不做自由 block JSON 或 open-slide 等級的 canvas editor。
- 本 change 只在本機開發與驗證，不自動部署到正式站。

## Capabilities

### New Capabilities

- `presentation-editor-authoring`: 管理端可直接編輯每張投影片的文字、底圖與字級。
- `presentation-html-runtime`: 前台以 HTML 投影片播放器呈現已發布簡報，支援翻頁與頁碼。

### Modified Capabilities

- `presentation-publishing`: 簡報發布流程從排序工作台升級為內容編輯工作台，但仍沿用週次與發布 URL 契約。

## Impact

- Affected specs: `presentation-editor-authoring`, `presentation-html-runtime`, `presentation-publishing`
- Affected code:
  - Modified: `app/(admin)/admin/presentations/[id]/page.tsx`, `app/presentation/[week-date]/page.tsx`, `lib/actions/presentations.ts`, `lib/presentation/*`, `components/slides/deck-runtime.tsx`, `e2e/admin-member.spec.ts`
  - New: `components/presentation/*`, `app/presentation/layout.tsx`
  - Dependencies: `reveal.js`
