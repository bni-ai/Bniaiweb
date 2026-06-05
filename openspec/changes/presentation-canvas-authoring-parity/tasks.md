## 1. 資料契約與模板基線

- [ ] 1.1 交付 `Presentation layout document persistence` 的正式 schema、驗證器與 draft/published snapshot 資料路徑，明確落實 `Decision: 新增 layout document，而不是繼續把所有編輯內容塞進 slide_order` 與 `Interface / data shape`；驗證：`lib/presentation/layout/*.test.ts` 覆蓋 schema parse / publish snapshot / invalid document cases，且 `spectra analyze presentation-canvas-authoring-parity --json` 無新缺口。
- [ ] 1.2 建立既有 presentation 的 default layout backfill 與 migration guard，讓 `Scope boundaries` 內的舊簡報仍能被 editor 與 viewer 接手；驗證：integration test 覆蓋 legacy `slide_order` 開啟 editor 時自動生成 layout document。
- [ ] 1.3 交付 `Slide components` 的模板區塊契約，讓 member / guest / keynote / award / vp_report 轉成可重用 blocks 與 bindings，直接落實 `Decision: 保留 bni 業務資料，改用模板區塊與資料綁定注入`；驗證：`lib/presentation/templates/*.test.ts` 斷言每種 sourceType 產出的 block tree 與資料映射正確。
- [x] 1.4 交付 `Member-authored presentation data` 與 `Member dashboard` 的資料綁定契約，直接落實 `Decision: 會員端資料是簡報內容來源，不只是後台資料`，讓會員端自行填寫的個人資料、每週簡報、短講與圖片素材可被 member / keynote / team template blocks 引用；驗證：integration test 覆蓋會員更新資料後重新產生簡報，viewer 顯示最新會員資料。

## 2. 編輯器與資產庫

- [x] 2.1 交付 `Canvas presentation authoring` 的 1920x1080 stage、slide navigator、block selection 與 property inspector，直接落實 `Decision: 以 dom-based 畫布加共享 block renderer 取代表單式工作台` 與 `Observable behavior`；驗證：Playwright `presentation editor opens canvas stage` 通過，且不再只出現 title/body textareas。
- [x] 2.2 交付 `Canvas presentation authoring` 的拖拉、resize、文字樣式與顯示切換，讓管理員可直接在 stage 上編排區塊；驗證：Playwright `presentation editor drags and resizes blocks` 通過，重新整理後座標與樣式仍保留。
- [ ] 2.3 交付 `Presentation asset library` 的上傳、選取、替換與重用流程，直接落實 `Decision: 資產管理走 supabase storage + presentation_assets manifest` 與 `Failure modes` 中的 missing asset contract；驗證：integration test 覆蓋 asset manifest 建立與替換後 block 仍維持綁定，Playwright 覆蓋底圖替換後 stage 即時更新。

## 3. Viewer 與共用 renderer

- [ ] 3.1 交付可被 editor 與 public viewer 共用的 block renderer，而不是複製兩套畫面，直接落實 `Decision: 採用 open-slide 的模式，但不直接嵌入 open-slide runtime`；驗證：`components/presentation/runtime/*.test.tsx` 對同一份 slide document 在 editor-preview 與 viewer mode 的 DOM 結構一致。
- [ ] 3.2 交付 `Slide viewer` 對 published layout snapshot 的讀取、單頁翻頁、fullscreen、keyboard navigation 與 missing-asset placeholder；驗證：Playwright `presentation viewer renders published snapshot`、`presentation viewer survives missing asset` 通過。
- [ ] 3.3 交付 `Slide components` 在長文與多元素情境下的 safe-area / typography token 約束，並以 `Acceptance criteria` 驗證 cover/member/vp_report 三種高風險版型不壞版；驗證：component tests 與 screenshot assertions 覆蓋三種版型。
- [x] 3.4 修正目前公開 viewer 黑底空白或 active slide 不可見的失敗狀態，將第一張投影片有可見文字、底圖或 placeholder 寫入 Playwright 驗收；驗證：`presentation viewer is not blank` 以 screenshot 或 DOM bounding box 斷言 active slide 非空。

## 4. 發布與遷移

- [ ] 4.1 交付 `Presentation publishing` 的 draft preview 與 publish snapshot 流程，讓預覽、公開 viewer、present mode 共用同一份已儲存內容，並直接落實 `Decision: 發布流程以已儲存 layout document 快照為準`；驗證：integration test 覆蓋 save -> preview -> publish -> public route 的內容一致性。
- [ ] 4.2 修掉目前 publish 吃舊 `slide_order` 的缺口，並讓 invalid layout 在 `Failure modes` 下被阻止發布；驗證：回歸測試覆蓋編輯後未儲存不能 publish、invalid layout publish 被拒絕。
- [ ] 4.3 交付 legacy presentation migration guard，讓沒有 layout document 的舊資料仍可預覽與編輯；驗證：seed 一筆舊 presentation 後，manual smoke 與 automated integration 都能完成 backfill 並正常開啟 editor。

## 5. 本機驗證與視覺驗收

- [ ] 5.1 補齊 `Canvas presentation authoring`、`Presentation asset library`、`Presentation layout document persistence`、`Slide viewer`、`Presentation publishing`、`Slide components` 的 unit / integration / e2e 測試矩陣，覆蓋 `Acceptance criteria` 與 `Observable behavior`；驗證：`npm run test`、`E2E_BASE_URL=http://localhost:4010 npm run test:e2e -- --grep "presentation"` 全通過。
- [ ] 5.2 依本 change 的本機邊界完成桌機與手機 visual QA，確認簡報有文字、有底圖、非長頁、風格對齊目標質感，並回查 `Scope boundaries` 未擴散到非簡報模組；驗證：本機 screenshot evidence、手動對照 `/admin/presentations/[id]` 與 `/presentation/[week-date]`，以及 `spectra analyze presentation-canvas-authoring-parity --json` clean。
