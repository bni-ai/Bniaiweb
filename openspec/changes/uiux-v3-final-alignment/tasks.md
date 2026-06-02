## 1. 對焦基線

- [ ] 1.1 落實 `Open Design Guided UI Review` 與 `open design 作為視覺對焦工具`：用 Open Design 與兩份 v3 mockup 對照 member/admin 現況，整理頁面差異清單；驗證：design 與 tasks 對齊，且列出優先順序。
- [ ] 1.2 落實 `不動底層資料接線`：凍結功能邊界，本 change 不新增新模組、不改底層 schema / auth / RBAC；驗證：所有任務都屬 UI/UX 對齊而非新功能。

## 2. Member UI 對齊

- [ ] 2.1 落實 `Member and Admin V3 Layout Parity` 與 `先以 mockup 與 open design 對齊資訊架構，再修局部視覺`：對齊 member sidebar、dashboard、report 的資訊架構與 CTA；驗證：E2E 會員主流程維持通過。
- [ ] 2.2 落實 `Member and Admin V3 Layout Parity`：對齊 profile、directory、one-on-one、events、training、ai 的卡片、列表、狀態與空畫面；驗證：頁面可用、路由不壞、狀態清楚。

## 3. Admin UI 對齊

- [ ] 3.1 落實 `Member and Admin V3 Layout Parity`：對齊 admin sidebar、overview、submission、presentation 的資訊架構與狀態節奏；驗證：E2E 管理端主流程維持通過。
- [ ] 3.2 落實 `Member and Admin V3 Layout Parity`：對齊 members、guests、keynote、import、settings、training、events 的表單與列表呈現；驗證：管理端操作與狀態顯示一致。

## 4. 驗收

- [ ] 4.1 落實 `UI Changes Preserve Functional Acceptance` 與 `每完成一段 ui 都要回歸 e2e`：完成 UI 對齊後，重跑 `npm run test`、`npm run build`、`npm run test:e2e`；驗證：全部綠燈。
- [ ] 4.2 落實 `Open Design Guided UI Review`：用 mockup + Open Design + 實際頁面三方對照做最後驗收；驗證：差異被收斂到可進入下一輪微調。
