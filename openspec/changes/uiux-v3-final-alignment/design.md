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

Open Design MCP 第二次確認仍無法連線到 `127.0.0.1:7456`，因此 4.2 的 Open Design 三方對照尚未勾選；目前完成的是 mockup HTML + 實際頁面 + E2E 對照。
