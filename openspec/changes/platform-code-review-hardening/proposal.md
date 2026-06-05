## Why

2026-06-03 對目前工作區（61 檔、+2500 行未提交變更）做過一輪 code review：`vitest` 72 passed、`build` 通過，簡報 canvas 與 `EditorSlideFrame` 統一播放路徑方向正確。但同時發現授權、簡報發布、與技術債若不在 Spectra 裡留下契約，之後 apply 或拆 PR 時很容易漏修或誤以為「只是 UI 換皮」。

本 change 把 review 結論正式收斂成可執行的硬化工作項，優先處理會影響安全與資料正確性的項目，其餘列入後續清理。

## What Changes

- 新增 Server Action 層的 admin 授權檢查契約，不可只依賴 `sb-role` cookie 與 middleware 擋頁面。
- 修正 `publishPresentationAction` / `unpublishPresentationAction` 的 `return_to` 開放重導向風險，並補齊無 `return_to` 時的使用者回饋。
- 簡報儲存與預覽時，對 `slide_order` 中找不到對應資料的投影片給出可見警告，避免靜默少頁。
- 對齊 canvas 底圖上傳：前端 `accept` 與 `assertImageFile` 允許格式一致（JPG/PNG，或同步支援 webp）。
- 標記並移除（或明確 deprecated）`renderPresentationSlides` 舊渲染路徑，避免雙軌維護。
- 為「重新產生簡報」增加破壞性操作保護（確認或明確文案），避免誤抹 canvas 編輯內容。
- 將完整 review 原文與優先序寫入 `design.md`，作為後續 apply 的 SSOT。

## Capabilities

### New Capabilities

- `server-action-authorization`: 所有使用 `createAdminClient()` 的 destructive / 資料寫入 Server Action 必須驗證 admin session。

### Modified Capabilities

- `rbac-middleware`: 文件化 middleware 與 Supabase session 的邊界；Server Action 不得假設 middleware 已足夠。
- `presentation-publishing`: `return_to` 白名單、發布後 redirect、公開路徑行為不變。
- `slide-viewer`: missing slide 警告、單一 runtime 渲染路徑、webp 上傳一致性。

## Impact

- Affected specs: `server-action-authorization`, `rbac-middleware`, `presentation-publishing`, `slide-viewer`
- Affected code:
  - `lib/actions/presentations.ts`
  - `lib/actions/admin-common.ts`（或新增 `lib/auth/assert-admin.ts`）
  - `lib/presentation/runtime.ts`
  - `lib/presentation/viewer.tsx`
  - `lib/media-storage.ts`
  - `components/presentation/canvas-editor.tsx`
  - `middleware.ts`
  - `lib/access-control.ts`
- Verification baseline（review 當下）：`npm run test`（72 passed）、`npm run build`（通過）、`next lint`（僅 `<img>` 警告）
