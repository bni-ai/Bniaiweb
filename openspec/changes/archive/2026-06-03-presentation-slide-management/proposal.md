## Why

目前簡報系統的畫布編輯器已支援文字框排版與底圖上傳，但管理員無法對「投影片頁面」本身進行新增、刪除或複製。每份簡報的頁面清單仍完全由 `buildSlideOrder()` 根據當週資料自動產生，無法人工增減。這與分會實際運作模式不符——分會習慣「複製舊簡報、替換內容」，而非每次從零產生。

同時，會員在後台更新的個人資料、每週簡報內容無法自動反映到簡報中，管理員必須手動按「重新產生」才能同步。會員個人檔案的呈現排版也尚未對齊設計目標。

本 change 要補上「slide 頁面級 CRUD + 會員資料自動同步 + 個人檔案排版」三項能力，讓簡報系統從「自動產生工具」升級為「可持續維護的簡報工作台」。

## What Changes

- **Slide 頁面級 CRUD**：
  - 新增「複製頁面」：複製現有 slide（含 editor patch）為新的一頁
  - 新增「新增空白頁」：插入 `type: "custom"` 的空白 slide，可自由排版
  - 新增「刪除頁面」：從 slide_order 永久移除某一頁（固定頁如 cover 只允許隱藏）
  - 新增「刪除整份簡報」：在 admin 列表可刪除 presentation 紀錄
  - 參考 `open-slide` 的「單檔案 slide + 絕對像素定位」模式，讓複製後的 slide 保持獨立 editor state

- **會員資料自動同步**：
  - 修改 `runtime.ts` 渲染邏輯：data-driven slides（member / keynote / guest / award / vp_report）在渲染時即時從資料庫讀取最新資料，editor patch 只保留排版資訊（位置、樣式、底圖）
  - `slide_order` 中的 editor 欄位不再儲存資料內容，只儲存「排版覆寫」與「顯示控制」
  - 會員更新資料後，公開 viewer 與預覽頁自動顯示最新內容，無需手動重新產生

- **會員個人檔案排版**：
  - 參考 `huashu-design` 的 Anti AI-slop 規則與設計哲學，調整會員個人檔案頁的視覺呈現
  - 參考 `ui-mockup-member.html` 的卡片式排版與資訊層級
  - 個人檔案頁與簡報中的 member slide 共用資料來源與視覺語言

- **簡報 viewer 強化**：
  - 參考 `open-slide` 的 Design System 概念，統一簡報的字級、色票、安全區域規則
  - 公開 viewer 與 present mode 持續以最新資料渲染，同時保留排版客製化

## Non-Goals

- 不直接嵌入 `open-slide` monorepo 或其 Vite workspace
- 不將簡報內容改為手寫 TSX 檔作為正式資料來源
- 不處理多人即時協作或評論系統
- 不處理簡報匯出為 PDF / PPTX（保留未來擴充空間，參考 `huashu-design` 的 export toolchain）
- 不處理來賓 portal、全站 IA 或其他非簡報模組

## Capabilities

### New Capabilities

- `presentation-slide-crud`: 投影片頁面的新增、刪除、複製與整份簡報刪除
- `presentation-data-sync`: 會員資料與簡報內容的自動同步機制
- `member-profile-styling`: 會員個人檔案頁的視覺排版與資料呈現

### Modified Capabilities

- `presentation-canvas-authoring`: 畫布編輯器增加 slide 級操作按鈕（複製、刪除、新增空白頁）
- `slide-viewer`: viewer 改為即時讀取資料庫最新資料 + 合併排版覆寫
- `presentation-publishing`: 發布流程確認 layout 有效性，阻止無效 layout 發布

## Impact

- Affected specs: `presentation-slide-crud`, `presentation-data-sync`, `member-profile-styling`, `presentation-canvas-authoring`, `slide-viewer`, `presentation-publishing`
- Affected code:
  - New: `lib/actions/presentations.ts` (deletePresentationAction, duplicateSlideAction), `lib/presentation/sync.ts`, `components/member/profile-card.tsx`
  - Modified: `components/presentation/canvas-editor.tsx`, `lib/presentation/runtime.ts`, `lib/presentation/types.ts`, `lib/presentation/builder.ts`, `lib/actions/presentations.ts`, `app/(admin)/admin/presentations/[id]/page.tsx`, `app/(admin)/admin/presentation/page.tsx`, `app/presentation/[week-date]/page.tsx`, `app/presentation/[week-date]/present/page.tsx`
  - Removed: none
