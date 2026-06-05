## 1. 型別與 Schema

- [x] 1.1 定義 `SlideImageLayer` 型別，落實 Decision: 圖片元素採用獨立的 `imageLayers` 陣列，不混入 `textLayers`（id, imageUrl, x, y, width, height, borderRadius, shadow, objectFit），落實 "Admin can insert an image element on canvas" 與 "Decision: 圖片上傳走獨立 server action，不經由 saveSlideOrderAction" 與 "Decision: 圖片元素採用獨立的 imageLayers 陣列，不混入 textLayers"；驗證：`lib/presentation/types.ts` 編譯通過，型別符合 "Interface / Data Shape"
- [x] 1.2 擴充 `SlideEditorPatch` 新增 `imageLayers?: SlideImageLayer[] | null`，確保與現有 `textLayers` 並存；驗證：現有簡報的 slide_order 解析不受影響
- [x] 1.3 更新 `parseSlideOrder` 驗證器，支援 `imageLayers` 欄位（可選，允許 null）；驗證：`lib/presentation/slide-order.ts` 單元測試覆蓋 imageLayers parse / invalid 路徑，落實 "Canvas editor preserves editor patches across CRUD operations"

## 2. 圖片上傳後端

- [x] 2.1 實作 `uploadLayerImageAction(presentationId, file)` server action，上傳至 Supabase Storage `bniai-media` bucket，路徑 `presentations/{id}/layers/{layerId}-{filename}`，驗證檔案類型（jpg/png/webp）與大小（≤5MB）；驗證：integration test 覆蓋成功上傳、格式錯誤拒絕、大小超限拒絕
- [x] 2.2 擴充 `lib/media-storage.ts`，新增 `buildLayerImagePath(presentationId, layerId, file)` helper；驗證：單元測試覆蓋路徑格式正確，符合 "Interface / Data Shape"
- [x] 2.3 修改 `saveSlideOrderAction` 的 `buildWorkbenchSlideOrder` 呼叫路徑，確保 `imageLayers` 從 `SlideEditorPatch` 被正確序列化寫入 `slide_order`；驗證：手動測試插入圖片元素 → 儲存 → 重新載入後 imageLayers 仍存在，落實 "Canvas editor preserves editor patches across CRUD operations"（G1：現有 action 不處理 imageLayers，此 task 填補持久化缺口）

## 3. 圖片元素前端（Canvas Editor）

> **執行順序**：先完成 3.4（提取共用 hook），再執行 3.1 → 3.2 → 3.3

- [x] 3.1 在 `canvas-editor.tsx` 的 toolbar（「新增文字框」旁邊）新增「插入圖片」按鈕，點擊後觸發檔案選擇並呼叫 `uploadLayerImageAction`，落實 "Admin can insert an image element on canvas"；驗證：手動測試點擊後圖片出現在畫布中央，落實 "Canvas editor supports slide-level CRUD controls"（x=720, y=360, w=480, h=360）
- [x] 3.2 在畫布渲染區新增圖片元素的渲染邏輯（絕對定位 `<img>`，object-fit: cover），使用 task 3.4 提取的共用 hook 接入拖拉與 resize 互動，落實 "Image element supports drag and resize" 與 "Decision: 圖片元素採用獨立的 imageLayers 陣列，不混入 textLayers"；驗證：Playwright `presentation editor can drag and resize image element` 通過，達成 "Acceptance Criteria"（依賴：3.4）
- [x] 3.3 實作圖片元素的選取狀態（ring highlight）與 resize handle（右下角 ↘ 按鈕），透過 task 3.4 共用 hook 接入 dragState 機制；驗證：手動測試選取圖片後可拖拉與 resize，落實 "Canvas editor supports slide-level CRUD controls"（依賴：3.4）
- [x] 3.4 從 `canvas-editor.tsx` 提取 drag/resize 邏輯為共用 hook `useDragResize`（或 helper function），現有文字框互動不中斷，圖片元素可直接複用；驗證：文字框拖拉/resize 行為與重構前一致，單元測試或手動測試均可（G2：現有邏輯耦合在元件 useEffect L105-150，必須先提取才能共用，建議在 3.2/3.3 之前完成）

## 4. 屬性面板擴充

- [x] 4.1 在屬性面板新增「圖片樣式」區塊，當選取圖片元素時顯示：寬、高、圓角選擇（0/8/16/999）、陰影選擇（無/小/中）、object-fit 切換（cover/contain）、替換圖片按鈕、刪除按鈕，落實 "Image element has style controls in property panel" 與 "Decision: 圖片元素使用 object-fit: cover，並提供圓角與陰影開關"；驗證：手動測試每個控制項都能即時改變畫布上的圖片外觀

## 5. 文字框圖文混排

- [x] 5.1 在文字框編輯區域（textarea）上方新增「插入圖片」按鈕，點擊後上傳圖片並在游標位置插入 `![描述](url)` 標記，落實 "Text layer supports inline image block" 與 "Decision: 文字框圖文混排採用「圖片占一行」的簡單模式"；驗證：手動測試 textarea 即時顯示標記文字
- [x] 5.2 實作文字框內標記解析函數 `parseTextWithImages(text: string)`，把 `![描述](url)` 轉為 `{ type: "text" | "image", content: string }[]`；驗證：單元測試覆蓋純文字、單一圖片、多圖片混合路徑

## 6. Viewer 渲染

- [x] 6.1 更新公開 viewer 與 present mode 的渲染邏輯，正確渲染 `imageLayers`（絕對定位 img，套用 borderRadius / shadow / objectFit），落實 "Viewer renders image elements and inline images" 與 "Observable Behavior"；驗證：手動測試公開 viewer 顯示圖片元素位置與樣式正確，落實 "Slide viewer" 與 "Acceptance Criteria"
- [x] 6.2 更新文字框渲染邏輯，把 `parseTextWithImages` 結果轉為 DOM（文字用 span，圖片用 img display:block），落實 "Viewer renders inline image in text layer"；驗證：手動測試文字框內圖片以 block-level 顯示在文字之間，落實 "Slide viewer"
- [x] 6.3 更新 `lib/presentation/runtime.ts` 的 `resolveEditorState`，將 `SlideEditorPatch.imageLayers` 傳入 editor state 回傳值，確保 `PresentationRuntimeSlide["editor"]` 包含 `imageLayers` 欄位；驗證：viewer 取得的 runtime slide 包含 imageLayers（proposal.md Affected code 列出此檔為 Modified，目前 `resolveEditorState` 回傳值不含 imageLayers → viewer 永遠拿不到資料）

## 7. 錯誤處理與驗收

- [x] 7.1 實作圖片上傳錯誤處理：格式錯誤、大小超限、上傳失敗時顯示清楚錯誤提示且不建立 imageLayer，落實 "Image upload validates file type and size" 與 "Failure Modes"；驗證：手動測試三種錯誤情境都有提示，達成 "Failure Modes"
- [x] 7.2 實作圖片載入失敗 fallback：viewer 中圖片 URL 失效時顯示「圖片無法載入」灰色佔位區塊，不白屏；驗證：手動測試把圖片 URL 改錯，viewer 顯示佔位區塊
- [x] 7.3 執行完整手動驗收：插入圖片元素、拖拉、resize、改樣式、文字框插入圖片、viewer 渲染；驗證：逐項截圖存 `/tmp/presentation-image-layers-uat/`，確認未擴散到 "Scope Boundaries" 之外的範圍

## 8. Playwright E2E 測試

- [x] 8.1 撰寫 Playwright 測試 `presentation editor - insert image layer, drag, resize, save, reload`：插入圖片元素 → 拖拉至新位置 → resize → 點「儲存簡報內容」→ 重新載入 → 驗證圖片位置與大小與儲存前一致；落實 design.md Acceptance Criteria 第一條（G3：現有 tasks 只在 3.2 驗證條件提及 Playwright，缺完整「儲存後重新載入」E2E 流程）
- [x] 8.2 撰寫 Playwright 測試 `slide viewer - text layer renders inline image block`：在文字框插入 `![test](url)` 標記並儲存 → 開啟公開 viewer → 驗證圖片以 `display: block` 渲染在文字之間；落實 design.md Acceptance Criteria 第二條
