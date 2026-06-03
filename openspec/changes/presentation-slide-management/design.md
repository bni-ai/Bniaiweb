## Context

目前簡報系統已具備以下基礎設施：
- `buildSlideOrder()` 根據當週資料（會員 briefs、來賓、短講、獎項、VP 報告）自動產生 `slide_order` JSONB
- Canvas 編輯器支援 1920×1080 舞台、文字框拖拉/resize、底圖上傳、順序調整、顯示切換
- 公開 viewer (`/presentation/[week-date]`) 與 present mode 支援鍵盤導航與全螢幕
- 發布流程支援 draft / published 狀態切換

但存在三個關鍵缺口：
1. **無法對 slide 頁面本身做 CRUD**：編輯器只能編輯既有 slide 的內容，無法新增空白頁、複製頁面、刪除單頁，也無法刪除整份簡報
2. **資料與排版未分離**：`slide_order` 同時儲存「資料內容」與「排版資訊」，導致會員更新資料後必須手動「重新產生」才能同步到簡報
3. **會員個人檔案排版未對齊設計目標**：現有會員資料頁風格與 `ui-mockup-member.html` 的卡片式、資訊層級設計有落差

參考 `open-slide` 的模式：單檔案 slide、絕對像素定位、Design System 統一視覺語言。參考 `huashu-design` 的規則：Anti AI-slop、HTML-first、Core Asset Protocol。

## Goals / Non-Goals

**Goals:**

- 讓管理員能在畫布編輯器中對 slide 頁面進行新增、刪除、複製操作
- 將 data-driven slides 的「資料層」與「排版層」分離，實現會員資料更新後自動同步到簡報
- 調整會員個人檔案頁的視覺呈現，對齊設計 mockup
- 公開 viewer 與 present mode 在保留排版客製化的前提下，總是顯示最新資料

**Non-Goals:**

- 不直接嵌入 `open-slide` monorepo
- 不處理簡報匯出 PDF/PPTX
- 不處理多人協作或即時同步
- 不改動會員資料表的 schema（只改讀取與渲染邏輯）
- 不處理非簡報模組的需求

## Decisions

### Decision: Slide CRUD 在現有 `slide_order` 架構上擴充，不另開資料表

- 原因：`slide_order` 已經是 JSONB 陣列，新增/刪除/複製只是陣列操作，不需要額外資料表。`canvas-editor.tsx` 已經能讀寫 `slide_order`，擴充 UI 即可。
- 做法：
  - 新增 `type: "custom"` 的 SlideEntry，支援空白頁
  - 複製 slide 時深拷貝 entry（含 editor patch），產生新的內部 ID
  - 固定頁（cover/agenda/team/closing）只允許隱藏，不允許刪除
  - 資料驅動頁（member/guest/keynote/award/vp_report）允許刪除，刪除後從 `slide_order` 移除
- 替代方案：
  - 另開 `presentation_slides` 資料表：過度設計，JSONB 已足夠表達順序與內容

### Decision: 資料層即時讀取，排版層保留在 `slide_order`

- 原因：`runtime.ts` 的 `resolveRuntimeSlide()` 目前從 `slide_order` 的 entry 與預先 build 的 deck 中解析資料。如果 deck 在產生時就寫死資料，會員更新後必須重新產生才能看到新內容。
- 做法：
  - 修改 `resolveRuntimeSlide()`：對於 data-driven slides，在渲染時即時查詢資料庫取得最新 member/guest/keynote/award/vp 資料
  - `slide_order` 的 `editor` 欄位只保留排版資訊（文字框位置、底圖 URL、字級、顯示狀態）
  - `editor.title` / `editor.body` 轉為「排版覆寫」——若為空則使用資料庫原始值
- 替代方案：
  - Supabase Realtime 監聽：複雜度高，且需要處理 race condition
  - 在會員更新 action 中同步更新 presentation：耦合過高，容易遺漏更新點

### Decision: 會員個人檔案排版採用卡片式、資訊層級化設計

- 原因：`ui-mockup-member.html` 已定義明確的視覺語言：大頭貼置左、基本資訊置右、專業別與引薦來源分區、GAINS 與本週 brief 以卡片呈現
- 做法：
  - 參考 mockup 的 `.profile-layout`、`.card`、`.badge`、`.referral-tier` 結構
  - 使用 Tailwind CSS 實現，保持與現有設計系統一致
  - 個人檔案頁與簡報 member slide 共用 `PresentationMember` 型別與資料來源
- 替代方案：
  - 完全自由設計：容易偏離目標風格

### Decision: 參考 `open-slide` 的 Design System 概念統一簡報視覺語言

- 原因：目前簡報各頁字級、間距、色彩不統一，參考 `open-slide` 的 `DesignSystem` 型別（palette、fonts、typeScale）建立簡報專屬 token
- 做法：
  - 定義簡報級 CSS variables：`--slide-bg`、`--slide-text`、`--slide-accent`、`--slide-font-display`、`--slide-font-body`
  - 字級 token：`hero` (120px+)、`title` (60-80px)、`subtitle` (36-48px)、`body` (24-32px)、`caption` (18-20px)
  - 安全區域：距離畫布邊緣至少 80px
- 替代方案：
  - 繼續用固定模板元件：無法支援客製化排版需求

## Implementation Contract

### Observable Behavior

- 管理員在 `/admin/presentations/[id]` 的 slide 列表每頁旁邊看到「複製」「刪除」按鈕，列表底部有「新增空白頁」按鈕
- 固定頁（cover/agenda/team/closing）的「刪除」按鈕 disabled，tooltip 顯示「固定頁面無法刪除」
- 複製 slide 後，新 slide 出現在列表最下方，含完全相同的 editor patch，但內部 ID 不同
- 新增空白頁的 `type` 為 `"custom"`，預設有一個可編輯的文字框
- 在 `/admin/presentation` 列表，每份簡報卡片有「刪除」按鈕，點擊後確認刪除
- 會員更新個人資料或每週 brief 後，公開 viewer `/presentation/[week-date]` 重新整理即顯示最新內容（無需重新產生）
- 後台編輯器中的文字框內容若為手動覆寫，則覆寫優先於資料庫值；若無覆寫則顯示資料庫最新值
- 會員個人檔案頁 `/member/profile` 顯示卡片式排版，資訊分區：基本資料、專業別、引薦來源、GAINS、本週 brief

### Interface / Data Shape

- `SlideEntry` 擴充：
  ```ts
  | { type: "custom"; id: string; visible: boolean; editor?: SlideEditorPatch }
  ```
- `SlideEditorPatch` 調整：
  ```ts
  type SlideEditorPatch = {
    title?: string | null;        // 排版覆寫：若 null 則使用資料庫值
    body?: string | null;         // 排版覆寫：若 null 則使用資料庫值
    backgroundImageUrl?: string | null;
    fontSize?: SlideFontSize | null;
    textLayers?: SlideTextLayer[] | null;
    dataOverride?: Record<string, string | null>; // 欄位級覆寫
  };
  ```
- Server Actions：
  - `deletePresentationAction(formData)`：刪除 presentations 紀錄與相關 storage assets
  - `duplicateSlideAction(formData)`：複製指定 index 的 slide
  - `addBlankSlideAction(formData)`：插入 custom slide
  - `deleteSlideAction(formData)`：移除指定 index 的 slide
- `resolveRuntimeSlide(entry, deck, index)` 簽名不變，但內部實現改為對 data-driven types 即時查詢資料庫

### Failure Modes

- 複製固定頁時，若後端未正確攔截，前端 MUST disabled 複製按鈕
- 刪除唯一 slide 時，後端 MUST 拒絕並回傳「簡報至少需要一頁」
- 資料庫查詢失敗（如 member 被刪除），viewer MUST 顯示「資料暫時無法取得」placeholder，不造成白屏
- 無效的 `dataOverride` 欄位名稱，editor MUST 忽略並顯示原始資料庫值

### Acceptance Criteria

- Playwright E2E：`presentation editor can duplicate a slide`、`presentation editor can delete a slide`、`presentation editor can add a blank slide`、`presentation editor cannot delete fixed slides`
- Playwright E2E：`presentation viewer shows updated member data after profile change`
- 單元測試：`resolveRuntimeSlide` 對 member slide 即時查詢正確欄位，`dataOverride` 優先於資料庫值
- 視覺驗證：會員個人檔案頁截圖與 `ui-mockup-member.html` 風格對齊

### Scope Boundaries

- In scope：slide CRUD、data/runtime 分離、會員檔案排版
- Out of scope：layout document migration、asset manifest、published snapshot、PDF/PPTX export、多人協作

## Risks / Trade-offs

- [slide_order 陣列擴充 custom type 可能影響既有 parseSlideOrder] → 同步更新 `slide-order.ts` 驗證器，並增加 fallback
- [即時查詢資料庫可能增加 viewer 載入時間] → 使用 Promise.all 並行查詢，單頁查詢量可控（≤20 slides / deck）
- [editor patch 與資料庫值的 merge 邏輯複雜] → 明確規則：非 null 的 editor 欄位為覆寫，null 為「使用資料庫值」，undefined 為「未設定」
- [會員檔案頁改版可能影響其他引用該元件的位置] → 先在新路徑實作，確認後再替換舊路徑
