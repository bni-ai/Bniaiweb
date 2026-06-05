## 0. Review 基線（已完成）

- [x] 0.1 記錄 2026-06-03 code review 結論至 `design.md`（含高/中/低風險與優先序）；驗證：`openspec/changes/platform-code-review-hardening/design.md` 含 Code Review Findings SSOT 章節。
- [x] 0.2 記錄審查當下驗證基線：`vitest` 72 passed、`build` 通過；驗證：proposal Impact 區塊有記載。

## 1. 授權硬化（高優先）

- [ ] 1.1 落實 **Admin server actions verify session before service role writes**：新增 `assertAdminSession()`（或等價 helper），驗證 Supabase user + administrator member role；驗證：單元測試覆蓋未登入、member、admin 三種結果。
- [ ] 1.2 落實 **Admin server actions verify session before service role writes**：在 `lib/actions/presentations.ts` 所有寫入 action 開頭呼叫授權 helper；驗證：未授權呼叫不寫入 DB。
- [ ] 1.3 落實 **Middleware role cookie is not sufficient for authorization**：盤點其他 `createAdminClient()` 寫入 actions 並補獨立 session 驗證；驗證：grep 清單與 `server-action-authorization` spec 一致。

## 2. 發布與重導向（高優先）

- [ ] 2.1 落實 **Admin return_to redirect whitelist**：實作 `sanitizeAdminReturnTo()`，拒絕外部 URL 與非 `/admin/` 路徑；驗證：單元測試含 `https://evil.com`、`//evil`、`/dashboard` 等案例。
- [ ] 2.2 落實 **Publish always redirects after success**：更新 publish/unpublish actions，成功後一律 redirect（無合法 `return_to` 時 fallback）；驗證：手動或 e2e 發布後 URL 正確。

## 3. 簡報可觀測性（中優先）

- [ ] 3.1 落實 **Unresolved slide entries are surfaced to editors**：實作 `collectUnresolvedSlides()`；驗證：單元測試對 missing member id 回傳警告項。
- [ ] 3.2 落實 **Unresolved slide entries are surfaced to editors**：在編輯頁與 preview 顯示警告 UI；驗證：缺資料 slide_order 時頁面可見警告且儲存不阻擋。
- [ ] 3.3 落實 **Presentation background image upload consistency**：對齊 canvas accept 與 `assertImageFile`；驗證：選擇的格式在上傳路徑不 500。

## 4. 技術債清理（低優先）

- [ ] 4.1 落實 **Single HTML runtime render path for published decks**：標記或移除 `renderPresentationSlides` 死碼；驗證：grep 無生產引用且公開頁走 runtime deck。
- [ ] 4.2 為 `regeneratePresentationAction` 增加破壞性確認（二次確認或明確警告文案）；驗證：UI 文案提及會覆寫 canvas 編輯。
- [ ] 4.3 （可選）為 `saveSlideOrderAction` / workbench 的 `JSON.parse` 加 try/catch 與可讀錯誤訊息；驗證：壞 payload 回傳明確錯誤非未處理 exception。

## 5. 驗收

- [ ] 5.1 跑 `npm run test`、`npm run build`；驗證：全綠。
- [ ] 5.2 跑 `spectra validate platform-code-review-hardening`；驗證：通過。
- [ ] 5.3 （建議）補一則 e2e：非 admin 無法發布簡報，或 publish redirect 至預期 admin URL；驗證：e2e 通過或記錄為 follow-up。
