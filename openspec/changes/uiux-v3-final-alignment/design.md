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
