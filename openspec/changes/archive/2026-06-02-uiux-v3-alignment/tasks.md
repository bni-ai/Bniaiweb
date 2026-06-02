## 1. SR 整理與整合邊界

- [x] 1.1 落實 **d1 — 以「功能級對齊」為主，不做像素級還原**、**d2 — 對每個 mockup 頁面做「三態分類」**、**d4 — 以前端頁面為中心做端口接線審核**，建立 member/admin v3 mockup 對照矩陣：逐頁標記 `wired / partial / missing`，並寫明 route、server action、資料表與驗收案例，直接覆蓋 **Frontend-backend wiring audit** requirement；驗證 `spectra analyze uiux-v3-alignment` Coverage/Consistency/Clean。
- [x] 1.2 落實 **d3 — 未完成主線不直接混入已完成 sr**、**r1 — `bni-chapter-platform` 與現況重疊**、**r2 — `presentation-engine` 與既有 presentation route 重疊**、**r3 — `member-module` 與 member ui 深度耦合`**，針對未完成主線 `bni-chapter-platform`、`presentation-engine`、`member-module` 補 integration notes，明確切出哪些 UI 對齊工作可在本 SR 完成、哪些必須留給後續主線；驗證 design.md 的 Integration Risks 與 tasks 無矛盾。

## 2. Member v3 parity

- [x] 2.1 落實 **Member v3 navigation parity** 與 **Member v3 wired pages expose real status**，對齊 `/dashboard` 與 `/dashboard/report` 到 member v3 的資訊架構：補摘要卡、截止時間、狀態提示、待辦節奏與 mockup 主要 CTA；驗證 member dashboard / weekly brief E2E 仍通過，且頁面內容與 mockup 對照表一致。
- [x] 2.2 落實 **Member v3 wired pages expose real status**，補齊 `/dashboard/profile`，並把 `/dashboard/directory` 對齊到 v3 的 card grid / profile modal / CTA 狀態；驗證 profile route 可開啟、directory 可搜尋並開 modal，未完成的一對一功能不會顯示成可用壞連結。
- [x] 2.3 落實 **d5 — 未完成功能要顯式顯示「受限 / 開發中」** 與 **Member v3 navigation parity**，為 member v3 中尚未完成的 `one-on-one`、`events`、`training`、`ai` 建立明確受限頁或 disabled 入口；驗證所有導航入口都不 404，且畫面清楚標示開發中或受限原因。

## 3. Admin v3 parity

- [x] 3.1 落實 **Admin v3 navigation parity** 與 **Admin wired pages expose real operational state**，對齊 `/admin`、`/admin/submission`、`/admin/presentation` 的 mockup 結構與狀態呈現：補概況卡、未提交摘要、slide list、預覽/發布/連結入口；驗證 admin overview / submission / presentation E2E 仍通過。
- [x] 3.2 落實 **Admin wired pages expose real operational state**，對齊 `/admin/keynote`、`/admin/guests`、`/admin/members` 的 mockup 結構與欄位節奏；驗證來賓管理與會員管理頁面能正確顯示登入準備狀態、角色/職務/委員會等關鍵資訊。
- [x] 3.3 落實 **d5 — 未完成功能要顯式顯示「受限 / 開發中」** 與 **Admin v3 navigation parity**，為 admin v3 中尚未完成的 `/admin/import`、`/admin/settings` 建立明確 route 與安全 placeholder；驗證管理端主導航所有入口都不 404，且不誤導使用者為已完成功能。

## 4. Guardrails 與驗收

- [x] 4.1 落實 **d6 — 不得破壞既有已驗證流程** 與 **UI parity changes must not regress existing flows**，補 UI parity 與 route safety 的 E2E / smoke 測試：涵蓋 nav 入口、placeholder route、既有 member/admin/guest 流程不回歸；驗證 `npm run test`、`npm run build`、`npm run test:e2e`、production E2E 全綠。
- [x] 4.2 完成 UI parity 後，檢查與 `presentation-engine`、`member-module`、`bni-chapter-platform` 的實際整合風險，若發現衝突則先開 debug/change 記錄再修；驗證本 SR 完成時不存在「做 A 壞 B」的已知未記錄風險，且 partial/missing 頁面都有被正確記錄。
