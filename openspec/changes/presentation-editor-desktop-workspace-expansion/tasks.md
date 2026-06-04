## 1. Workspace contract

- [x] 1.1 落實 `Desktop presentation editor uses a workspace-first layout` 與 `D1. presentation editor page 使用 workspace-first 寬度，而不是沿用一般內容頁 container`，建立 presentation workbench 的 page-level width contract，讓桌面版不再被一般內容頁 container 限縮；驗證：desktop layout regression test 與 manual screenshot 對照確認右側大塊留白消失，並對照 `Observable behavior`、`Interface / data shape`、`Failure modes`、`Acceptance criteria` 與 `Scope boundaries`。
- [x] 1.2 落實 `Desktop editor keeps navigator, canvas, and inspector simultaneously usable`、`Presentation editor authoring` 與 `D2. 三欄重新分配成「固定左欄 + 彈性畫布 + 寬右欄」的桌面契約`，重配 slide navigator、canvas、property inspector 三欄比例；驗證：desktop smoke 確認三欄可同時使用，inspector 不再窄到難編輯，並對照 `Observable behavior`、`Failure modes` 與 `Acceptance criteria`。

## 2. 大螢幕空間利用

- [x] 2.1 落實 `Admin v3 navigation parity` 與 `D3. 大螢幕空白優先回饋到畫布與 inspector，而不是留在外層 gutter`，調整 shell spacing、grid 或 max-width 規則，讓多出來的桌面寬度回饋到工作區；驗證：至少一個寬桌面 viewport 的 Playwright 或視覺回歸案例確認外層留白不再主導畫面。
- [x] 2.2 落實 `Canvas editor supports slide-level CRUD controls` 的桌面同屏條件，收斂右欄欄位排版與內部滾動策略，避免欄位被窄框切割或溢出；驗證：property inspector focused layout check 覆蓋常見欄位與表單控制。

## 3. 響應式邊界

- [x] 3.1 依 `D4. 手機與平板維持現有收斂邏輯，桌面策略只在對應 breakpoint 啟用` 補齊 tablet/mobile breakpoint 驗證，避免桌面擴寬造成小螢幕回歸；驗證：tablet/mobile smoke 不出現破版或橫向捲動災難。
- [x] 3.2 執行 `spectra analyze presentation-editor-desktop-workspace-expansion --json`、`spectra validate presentation-editor-desktop-workspace-expansion`，並記錄 desktop/tablet/mobile 手動結果；驗證：Spectra checks 通過且 artifact 與 layout contract 無 drift。
