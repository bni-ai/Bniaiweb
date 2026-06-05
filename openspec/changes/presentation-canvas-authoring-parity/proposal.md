## Why

目前 `/admin/presentations/[id]` 的簡報工作台只做到固定欄位編輯，離使用者要的「後台可直接排版、上傳底圖、調整大小、前台立刻以 HTML 簡報呈現」差了整整一層能力。`open-slide` 已經證明要做到這種質感，關鍵不是再補幾個表單欄位，而是要有固定 1920x1080 畫布、可視化元素編輯、資產管理、以及可發布的簡報 runtime。

現在之所以會出現「有設定頁面但前台缺文字、缺圖、樣式不到位」的落差，不只是 bug，而是目前的資料模型、編輯模型、與前台 renderer 都還停留在第一階段原型，無法承接真正的簡報設計需求。這個 change 要把簡報系統重定義成可視化編輯架構，並以 `open-slide` 的模式作為對標基線。

目前最急迫的失敗狀態是：本機 `/presentation/[week-date]` 可能出現黑底空白或沒有可辨識內容，後台仍可能看起來像舊式欄位表單，且會員自行填寫的個人資料沒有被定義成簡報的正式資料來源。這些都必須被收斂在同一個 SR 內處理，不能分散成零散 hotfix。

## What Changes

- 新增一套 `presentation layout document` 契約，讓每張投影片不只是一筆 `slide_order`，而是具有畫布、元素、樣式、資產引用、與資料綁定的版面文件。
- 將管理端簡報後台從「固定欄位工作台」改為「畫布式編輯器」，支援文字、圖片、底圖、區塊位置、大小、層級與顯示切換。
- 建立簡報資產庫，讓後台可管理底圖、圖片與品牌素材，並能從編輯器直接選用或替換。
- 將前台 `/presentation/[week-date]` viewer 改為讀取 layout document 的 HTML renderer，而不是只把既有資料拼成固定模板。
- 調整發布流程，讓 `預覽 / 發布 / 公開連結` 都以同一份已儲存的 layout document 為準，避免後台看到的內容和公開 viewer 不一致。
- 保留既有 BNI 業務資料來源（會員、來賓、VP 報告、獎項、短講），但它們改成提供 `template blocks / data bindings`，由畫布 renderer 決定最終呈現。
- 將會員自行填寫的資料（會員基本資料、專業、公司、簡報用自介、每週簡報、GAINS、圖片素材）列為 member / keynote / team 等投影片的正式資料來源，讓會員端更新後可進入後台簡報模板與前台 viewer。
- 修正前台 viewer 的可見性驗收：公開簡報不得只有黑色背景或空白 stage；至少必須顯示當前 active slide 的文字、底圖或 placeholder，且頁碼與翻頁控制可用。

## Non-Goals

- 本 change 不直接把 `open-slide` 整個 monorepo 或 Vite workspace 搬進專案。
- 本 change 不把簡報內容改成手寫 TSX 檔案作為正式營運資料來源。
- 本 change 不處理正式部署；先以本機實作、驗證、E2E 與設計對齊為主。
- 本 change 不同時處理來賓分區、會員正式匯入、或其它非簡報模組需求。

## Capabilities

### New Capabilities

- `presentation-canvas-authoring`: 管理端可在固定 1920x1080 畫布上可視化編輯投影片內容與版面。
- `presentation-asset-library`: 簡報可使用可管理的素材庫，上傳、替換、選取底圖與圖片。
- `presentation-layout-document`: 系統以可持久化的版面文件保存投影片元素、樣式、綁定與發布快照。

### Modified Capabilities

- `slide-viewer`: 前台 viewer 改為渲染 layout document，而不是只顯示固定模板投影片。
- `presentation-publishing`: 發布與預覽流程改為以已儲存版面文件為唯一來源，避免編輯內容遺失或 viewer 與後台不一致。
- `slide-components`: 既有會員、來賓、短講、獎項、VP 等投影片元件從「固定整頁模板」調整為可被畫布編輯器引用的資料區塊與模板元件。
- `member-dashboard`: 會員自行填寫的個人資料與簡報素材必須可被簡報模板引用，並在發布後出現在前台簡報中。

## Impact

- Affected specs: `presentation-canvas-authoring`, `presentation-asset-library`, `presentation-layout-document`, `slide-viewer`, `presentation-publishing`, `slide-components`, `member-dashboard`
- Affected code:
  - New: `app/(admin)/admin/presentations/[id]/editor/**`, `components/presentation/editor/**`, `components/presentation/runtime/**`, `lib/presentation/layout/**`, `lib/presentation/assets/**`, `lib/presentation/templates/**`, `e2e/presentation-editor.spec.ts`
  - Modified: `app/(admin)/admin/presentations/[id]/page.tsx`, `app/presentation/[week-date]/page.tsx`, `lib/actions/presentations.ts`, `lib/presentation/viewer.tsx`, `lib/presentation/runtime.ts`, `lib/presentation/types.ts`, `lib/media-storage.ts`, `openspec/specs/slide-viewer/spec.md`, `openspec/specs/presentation-publishing/spec.md`, `openspec/specs/slide-components/spec.md`
  - Removed: `components/presentation/editor-slide-frame.tsx`（若新 renderer 取代現行固定欄位框架）
