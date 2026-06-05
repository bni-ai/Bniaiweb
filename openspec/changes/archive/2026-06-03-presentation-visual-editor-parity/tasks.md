## 1. Artifacts

- [x] 1.1 建立 `presentation-visual-editor-parity` change 的 proposal / design / specs / tasks；驗證：`spectra analyze presentation-visual-editor-parity --json` 無 critical。

## 2. Editor Model

- [x] 2.1 落實 `Presentation editor authoring` 與 `D2. 編輯資料先附掛在 slide_order entry 上`：延伸 `slide_order` parser 與型別，讓編輯資料先附掛在 `slide_order` entry 上，允許每張 slide 攜帶 editor 內容；驗證：presentation unit tests 覆蓋 editor 欄位解析與序列化。
- [x] 2.2 落實 `D1. 第一階段用固定欄位編輯，不做視覺化拖拉` 與 `D4. 先從現有 runtime deck 推出預設編輯內容`：以固定欄位模型從既有 runtime deck 推出第一階段預設 editor 內容；驗證：未自訂 editor 時，runtime test 能得到可顯示的 title / body。

## 3. Admin Workbench

- [x] 3.1 將 `/admin/presentations/[id]` 改成固定欄位內容編輯表面；驗證：管理端可編標題、內文、字級、排序、顯示與底圖欄位。
- [x] 3.2 接上底圖上傳與 editor 儲存流程；驗證：server action 可接受檔案並把新 URL 寫回同一份 slide 資料。

## 4. HTML Runtime

- [x] 4.1 落實 `HTML presentation runtime` 與 `D3. 前台播放層採 Reveal.js`：將 `/presentation/[week-date]` 改成 Reveal.js HTML 投影片播放器；驗證：viewer 只有單張 active slide，且有頁碼與翻頁控制。
- [x] 4.2 落實 `Presentation publishing`：讓 present mode 與發布流程讀同一份 editor runtime 內容；驗證：present mode 基本 smoke 與既有測試仍可通過。

## 5. Local Verification

- [x] 5.1 補齊本機 e2e：後台改內容後，前台 viewer 反映最新結果；驗證：Playwright presentation case 通過。
- [x] 5.2 本機驗證 `npm run test -- lib/presentation/workbench.test.ts lib/presentation/runtime.test.ts` 與 `npm run build`；驗證：皆通過。
- [x] 5.3 明確維持本機邊界：本 change 不做部署；驗證：本輪交付只回報本機測試結果與未部署狀態。
