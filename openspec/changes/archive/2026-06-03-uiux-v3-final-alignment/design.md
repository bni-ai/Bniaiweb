## Context

目前產品已具備完整驗收所需功能，但 UI 與 `ui-mockup-member-v3.html`、`ui-mockup-admin-v3.html` 仍有落差。這次 change 不再討論功能有無，而是只處理「功能已存在時，呈現方式是否對齊 mockup 與驗收感受」。

## Design Decisions

### D1. 先以 mockup 與 Open Design 對齊資訊架構，再修局部視覺

先對齊：
- 導覽層級
- 卡片排序
- CTA 位置
- 表格與列表節奏
- 狀態 badge / empty state / disabled state

之後才修字級、留白、陰影、圓角等純視覺細節。

### D2. Open Design 作為視覺對焦工具

實作前先讀取目前 active artifact 或 mockup 對照，讓 UI 調整有可檢查的視覺基準。

### D3. 不動底層資料接線

本次不改：
- auth callback flow
- Supabase schema
- presentation builder/viewer data contract
- member/admin/guest RBAC

UI 只可在既有接線之上重排、重組與補明確狀態。

### D4. 每完成一段 UI 都要回歸 E2E

因為這次會大量動 layout、link、form、CTA 與 component 結構，所以每段都要回歸：
- `npm run test`
- `npm run build`
- `npm run test:e2e`

## Risks

- 側欄與 route-group shell 調整，最容易打壞既有導頁
- dashboard 卡片重排，最容易讓測試 selector 失效
- 會員與管理端共用 component 時，容易出現 role state 汙染

## Acceptance Strategy

- 先做 member shell/dashboard/report/profile/directory
- 再做 admin shell/overview/submission/presentation/members/guests/keynote
- 每完成一段就跑測試
- 最後用 Open Design / mockup / 本機 build 三方對照驗收

## Scope Correction: Open Design Artifact Must Be The Concrete UI Target

前一輪只把頁面改成白底、灰階與 8px radius，這不足以稱為對齊。新的驗收基準改成實際移植
`bniaiweb-uiux-v3-final-alignment.html` 的 UI system，而不是只沿用方向。

本輪必須移植：

- 276px 灰色 sidebar、brand lockup、chapter card、Portal 切換與 sidebar footer
- sticky topbar、segmented member/admin switch、週期 chip、右上角登入者資料
- metric card、cta card、table card、list row、status pill、ghost/soft/primary button
- mobile responsive 規則與無水平溢位

本輪仍不可變更：

- Supabase schema
- auth callback / session / RBAC
- member/admin server action contract
- presentation runtime data contract

完成標準：live `/admin` 與 `/dashboard` 的截圖必須能看出它們來自
`bniaiweb-uiux-v3-final-alignment.html`，而不只是「白底 dashboard」。

## Current Review Notes

Open Design MCP 目前無法連線到本機 daemon（`127.0.0.1:7456`），本輪先用 repo 內 mockup HTML 作為視覺基準：

- `ui-mockup-member-v3.html`
- `ui-mockup-admin-v3.html`
- `ui-mockup-member.html` 補充一對一/Jitsi 細節
- `ui-mockup-admin.html` 補充簡報與設定細節

### Priority Gap List

| 優先 | 區域 | Mockup 期望 | 目前落差 | 處理方式 |
| --- | --- | --- | --- | --- |
| P0 | Member 一對一 / Jitsi | 頁首立即顯示「即將進行」Jitsi 視訊卡，並有時段設定、發起預約、預約紀錄三區 | Jitsi 入口只在 confirmed + 時間窗口時才出現，驗收者平常看不到，也不知道如何測 | 不改 schema，重排 `/dashboard/one-on-one`，明確顯示 Jitsi 狀態、測試入口、時間窗口說明與紀錄 CTA |
| P1 | Member shell | 左側導覽有品牌、使用者、清楚 nav group，主內容白底卡片節奏 | 已有 shell，但樣式仍偏泛用 dashboard，active/section/group 視覺弱 | 調整 sidebar spacing、section label、active 狀態、底部返回/登出，保留 route |
| P1 | Admin shell | v3 mockup 分為概覽、每週例會、成員、系統；幹部可切會員視角 | 目前 nav 是單層列表，和 mockup 分區不同 | 調整 nav 結構與 section label，不改 RBAC |
| P1 | Dashboard/Admin overview | v3 mockup 重點是 stat cards + 未提交/例會狀態 + 明確 CTA | 現況資訊存在但視覺層級與 CTA 節奏偏散 | 重排 hero、stat cards、status cards；保留資料來源 |
| P2 | Member directory/profile/events/training/AI | 卡片、badge、空狀態要一致，CTA 要可見 | 部分頁面可用但卡片風格混雜，空狀態與 CTA 不夠明確 | 建立同一套 section/card/badge 視覺語彙後逐頁套用 |
| P2 | Admin members/guests/keynote/import/settings | 表單/列表/狀態 badge 對齊 v3 | 功能可用但視覺節奏不同 | 保留 server actions，只調整表單與列表呈現 |

### Frozen Boundaries

本 change 不改下列底層：

- Supabase schema
- Auth callback / Google / GitHub / Email login flow
- RBAC / middleware
- Presentation runtime data contract
- One-on-one booking validation、Jitsi room 產生規則與時間窗口邏輯

### Implementation Verification Notes

本輪已完成 mockup fallback 對照與實際 E2E 驗證：

- Member sidebar 改為 `核心任務 / 個人網絡 / 分會資源` 分區，並保留登入者資訊卡與管理員返回後台入口。
- Admin sidebar 改為 `概覽 / 每週例會 / 成員 / 系統` 分區，補齊 VP 報告與獎項入口，保留管理員切換會員視角。
- `/dashboard/one-on-one` 新增頁首 `Jitsi 線上視訊` 狀態卡，confirmed 且在時間窗口內會顯示站內視訊入口；無會議時顯示可測試條件。
- 全域 Card / Button / radius / border 語彙統一，會員與管理端頁面往 v3 mockup 的大圓角、暖白底、清楚 CTA 靠攏。
- 提交狀況頁保留 table 語意與 server actions，但改為更清楚的後台工作台視覺。
- 完整驗證：`npm run build` 通過、`npm run test` 17 files / 65 tests 通過、`npm run test:e2e` 36/36 通過。

Open Design 已重新啟動同一個 active project（`建立Bni華AI系統頁面`），並補完整 brief 產出 `bniaiweb-uiux-v3-final-alignment.html`：

- Open Design run：`7d1a632f-4eae-4f5e-bcc3-0c3054a713e6`
- Preview：`http://127.0.0.1:55511/api/projects/ef2a964e-f4d2-4b20-94b7-433a9860483b/raw/bniaiweb-uiux-v3-final-alignment.html`
- Open Design 方向：白底主畫布、灰 sidebar、節制 BNI red、8px radius、member/admin 兩個 portal 的營運資訊架構。

最後對照後，本輪實際收斂：

- `app/globals.css`、`components/ui/card.tsx`、`components/ui/button.tsx` 改回 v3 mockup 的 8px radius、薄邊框、低陰影、白底灰階 token。
- `app/(member)/layout.tsx`、`app/(admin)/layout.tsx` 對齊 224px sidebar、BNI brand mark、compact nav section、active dot；mobile 不再讓 sidebar 佔滿第一屏。
- `app/(member)/dashboard/page.tsx` 從黑底大 hero 改成 v3 的 page header、stat cards、本週待辦、近期活動與快速操作。
- `app/(admin)/admin/page.tsx` 從黑底大 hero 改成 v3 的 page header、五張 stat cards、未提交成員、本週例會狀態、快速進入與營運節奏。
- 新增 `lib/ui-v3-alignment.test.ts`，鎖住 v3 mockup radius、避免 dashboard 回到黑底 hero、避免 shell 回到 260px / 大圓角 sidebar。

最後驗證：

- `npm run test`：18 files / 68 tests 通過。
- `npm run build`：通過；僅保留既有 `<img>` lint warnings。
- `E2E_BASE_URL=http://localhost:4010 npm run test:e2e`：36/36 通過（production server）。
- Playwright 實際截圖：`test-results/uiux-v3-final-alignment-member.png`、`test-results/uiux-v3-final-alignment-admin.png`、`test-results/uiux-v3-final-alignment-member-mobile.png`。
- Playwright DOM/CSS check：desktop member/admin sidebar 皆為 224px、header 無深色背景、無水平溢位；mobile 無水平溢位且 sidebar 不再佔滿整個第一屏。

Live deployment note:

- 使用者截圖顯示 live/preview 仍是舊黑底 hero，代表前一輪只驗到本機 source / localhost，未驗使用者正在看的 Vercel 環境。
- 已補 `.vercelignore`，避免 Vercel CLI 部署時上傳 agent 設定目錄與測試截圖。
- 已部署 production：`https://bni-ai-web.vercel.app`（deployment：`https://bni-ai-2y23em524-bniai-s-projects.vercel.app`）。
- 已用 Playwright 驗 live `/admin`：`OFFICER DASHBOARD` 與 `本週運營摘要` 皆不存在；`h1 = 總覽儀表板`；sidebar width = 224；無水平溢位；截圖 `test-results/live-admin-uiux-v3-final-alignment.png`。

### Open Design Artifact Port Notes

本輪已改為直接移植 `bniaiweb-uiux-v3-final-alignment.html` 的具體 UI system：

- 新增共用 shell：`components/layout/bni-portal-shell.tsx`
- `app/globals.css` 新增 OD token 與 `.od-*` component classes，包含 276px sidebar、sticky topbar、portal switch、identity card、metric/cta/table/list/status/button
- `app/(admin)/layout.tsx`、`app/(member)/layout.tsx` 改用共用 OD shell
- `/admin` 串接既有 `getMembers`、`getWeeklyBriefRows`、`getGuestVisits`、`getAwards`、`getVpReport`
- `/dashboard` 串接既有 `getMemberDashboardData`、`getMemberMonthlySignals`
- 右上角補回登入者資料，sidebar 也保留 `shell-user-card` 身份卡，避免身份狀態只靠頁面內容推測
- 保留「切換到會員視角」、「返回管理後台」、「安排一對一」等功能驗收入口文字

最後驗證：

- `npm run test -- --run lib/ui-v3-alignment.test.ts`：3/3 通過
- `npm run test`：18 files / 68 tests 通過
- `npm run build`：通過；僅保留既有 `<img>` lint warnings，新增 shell avatar 同樣觸發此 warning
- `E2E_BASE_URL=http://localhost:4010 npm run test:e2e`：36/36 通過
- 本機 Playwright visual/DOM check：`/admin`、`/dashboard` 皆為 276px sidebar、OD shell、topbar user、sidebar identity、4 metric、2 cta、1 table、無水平溢位
- Production deployment：`https://bni-ai-web.vercel.app`，deployment `https://bni-ai-eqotdozjd-bniai-s-projects.vercel.app`
- Live Playwright check：`/admin`、`/dashboard` 皆為 OD shell；`OFFICER DASHBOARD`、`本週運營摘要` 不存在；mobile 無水平溢位
- 截圖：`test-results/live-uiux-od-admin.png`、`test-results/live-uiux-od-member.png`、`test-results/live-uiux-od-member-mobile.png`

Follow-up live fix:

- 修正 `lib/supabase/server.ts`：Server Component render 時 Supabase refresh session 可能嘗試寫 cookie，Next.js production 會丟 `Cookies can only be modified in a Server Action or Route Handler`，造成 live `/dashboard` application error。現在 `setAll` 在不可寫 cookie 的 render context 會捕捉並忽略，Route Handler / Server Action 仍可寫入。
- 新增 `components/layout/bni-icons.tsx`，把 sidebar、topbar、metric card 的文字佔位 icon 改成與 Open Design artifact 相同語彙的 20x20 stroke SVG。
- Live 真 magic-link session 驗證 `https://bni-ai-web.vercel.app/dashboard`：無 application error、digest = null、`h1 = 早安，余啟銘`、`.od-icon-wrap` 17 個全都有 SVG、text icon count = 0。
- 部署：`https://bni-ai-pra8u75bm-bniai-s-projects.vercel.app`，alias `https://bni-ai-web.vercel.app`。
