## 1. 對焦基線

- [x] 1.1 落實 `Open Design Guided UI Review`、`open design 作為視覺對焦工具` 與 `Priority Gap List`：用 Open Design 與兩份 v3 mockup 對照 member/admin 現況，整理頁面差異清單；驗證：design 與 tasks 對齊，且列出優先順序。
- [x] 1.2 落實 `不動底層資料接線` 與 `Frozen Boundaries`：凍結功能邊界，本 change 不新增新模組、不改底層 schema / auth / RBAC；驗證：所有任務都屬 UI/UX 對齊而非新功能。

## 2. Member UI 對齊

- [x] 2.1 落實 `Member and Admin V3 Layout Parity` 與 `先以 mockup 與 open design 對齊資訊架構，再修局部視覺`：對齊 member sidebar、dashboard、report 的資訊架構與 CTA；驗證：E2E 會員主流程維持通過。
- [x] 2.2 落實 `Member and Admin V3 Layout Parity`：對齊 profile、directory、one-on-one、events、training、ai 的卡片、列表、狀態與空畫面；驗證：頁面可用、路由不壞、狀態清楚。

## 3. Admin UI 對齊

- [x] 3.1 落實 `Member and Admin V3 Layout Parity`：對齊 admin sidebar、overview、submission、presentation 的資訊架構與狀態節奏；驗證：E2E 管理端主流程維持通過。
- [x] 3.2 落實 `Member and Admin V3 Layout Parity`：對齊 members、guests、keynote、import、settings、training、events 的表單與列表呈現；驗證：管理端操作與狀態顯示一致。

## 4. 驗收

- [x] 4.1 落實 `UI Changes Preserve Functional Acceptance`、`Implementation Verification Notes` 與 `每完成一段 ui 都要回歸 e2e`：完成 UI 對齊後，重跑 `npm run test`、`npm run build`、`npm run test:e2e`；驗證：全部綠燈。
- [x] 4.2 落實 `Open Design Guided UI Review`：用 mockup + Open Design + 實際頁面三方對照做最後驗收；驗證：差異被收斂到可進入下一輪微調。

## 5. Open Design Artifact Port Notes / 實作移植

- [x] 5.1 落實 `bniaiweb-uiux-v3-final-alignment.html` 的具體設計系統：移植 276px sidebar、sticky topbar、portal switch、chapter card、topbar 右上登入者資訊、metric/card/table/list/status/button token；驗證：source contract 鎖住 Open Design class 與 CSS token。
- [x] 5.2 串接幹部後台資料：`/admin` 使用 Open Design admin overview，但資料仍來自 `getMembers`、`getWeeklyBriefRows`、`getGuestVisits`、`getAwards`、`getVpReport`；驗證：卡片、表格、快動作皆連回既有後台路由。
- [x] 5.3 串接會員工作台資料：`/dashboard` 使用 Open Design member overview，但資料仍來自 `getMemberDashboardData`、`getMemberMonthlySignals`；驗證：本週任務、CTA、狀態與會員資料仍可操作。
- [x] 5.4 重跑本機與 live 驗收：`npm run test`、`npm run build`、production server E2E、部署後 Playwright 驗 `/admin` 與 `/dashboard`；驗證：不是只有白底，而是實際對齊 Open Design artifact。
- [x] 5.5 修正 live 會員頁與 icon 對齊：Supabase server client 在 Server Component refresh session 時不得讓 cookie write 造成 500；sidebar、topbar、metric card icon 必須使用 Open Design SVG stroke icon，不可用文字佔位；驗證：live 真登入 `/dashboard` 無 digest error，`.od-icon-wrap` text icon count = 0。
