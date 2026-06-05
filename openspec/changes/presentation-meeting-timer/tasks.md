## 1. Slide timer config data shape

- [x] 1.1 落實 `Slide timer config is stored per slide` 與 `每頁 timer 設定寫入 slide editor data`，擴充 `SlideEditorPatch`、`parseSlideOrder`、`buildWorkbenchSlideOrder` 與 runtime slide shape，支援 `timerEnabled` / `timerSeconds`；驗證：`lib/presentation/slide-order.test.ts`、`lib/presentation/runtime.test.ts`，覆蓋 `interface / data shape`
- [x] 1.2 落實 `Presentation editor stores per-slide timer config`，在 `canvas-editor.tsx` 的每頁屬性欄新增 timer 開關與整數秒數欄位，並確保儲存後可回填；驗證：Playwright `admin presentation editor saves and reloads per-slide timer config`，覆蓋 `observable behavior`

## 2. Runtime countdown and session sync

- [x] 2.1 落實 `Meeting timer runs as countdown with overtime` 與 `slide 切換時依該頁設定重建 timer`，建立 timer session/state helper，支援 slide 切換、自動開始、pause / resume / reset、overtime；驗證：`lib/presentation/meeting-timer.test.ts`
- [x] 2.2 落實 `Presentation present mode` 與 `present mode 保留 pause / resume / reset；viewer 只讀`，將 `present` mode 的 elapsed timer 改成讀取當前 slide config 的 countdown，並在啟用 timer 的頁面顯示圓形 timer；驗證：Playwright `presentation present mode shows current next timer and speaker notes`
- [x] 2.3 落實 `Present mode controls timer and viewer mirrors it` 與 `同一瀏覽器 session 內用本地同步通道共享 timer state`，將 public viewer 接上只讀 timer overlay，並與 present mode 在同一瀏覽器 session 內同步；驗證：Playwright `presentation viewer mirrors presenter slide timer in the same browser session`

## 3. Failure handling and boundaries

- [x] 3.1 落實 `failure modes`，處理 `timerEnabled=true` 但秒數缺值/非法、`BroadcastChannel` 不支援、快速切頁等情況；驗證：`lib/presentation/meeting-timer.test.ts` + viewer 同 session Playwright sync
- [x] 3.2 落實 `HTML presentation runtime` 與 `countdown state 不寫回 slide content`，確認 countdown runtime state 不回寫 deck content、不污染 published slide snapshot；驗證：`lib/presentation/runtime.test.ts`，覆蓋 `scope boundaries`

## 4. 驗證與收尾

- [x] 4.1 執行 focused tests、目標 Playwright、`spectra analyze presentation-meeting-timer --json`、`spectra validate presentation-meeting-timer`；驗證：全部通過，對照 `acceptance criteria`
- [ ] 4.2 記錄本機手動 smoke：啟用 30 秒 slide、viewer 顯示、present pause/reset、到 0 overtime；驗證：手動結果回寫到交付說明。
