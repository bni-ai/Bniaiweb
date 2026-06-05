## Why

`bni-chapter-platform` 的功能基線已完成，包含匯入、設定、events、training、AI baseline、媒體上傳、一對一視訊入口，並已通過 `vitest`、`next build`、`playwright` 完整驗收。

下一段工作的主目標不再是補功能，而是把目前可用的前後端功能，對齊到：

- `/Users/fishtv/Development/knowledge/bni/Bniaiweb/ui-mockup-member-v3.html`
- `/Users/fishtv/Development/knowledge/bni/Bniaiweb/ui-mockup-admin-v3.html`
- Open Design 的後續視覺與互動檢視流程

這一段必須在不破壞現有功能與資料接線的前提下進行，避免再次發生「做 A 壞 B」。

## What Changes

- 新增一個純 UI/UX 對齊 change，聚焦 member/admin v3 mockup 的最終對齊
- 以 Open Design 作為比對與後續視覺調整工具，而不是只靠文字描述改畫面
- 對齊 sidebar、dashboard 卡片、表單節奏、空狀態、badge、列表、modal 與 CTA 位置
- 保留既有 server actions、route handlers、Supabase tables，不大改底層架構
- 所有 UI 調整都必須跑現有 E2E，確保功能不回歸

## Non-Goals

- 本 change 不新增新的產品模組
- 本 change 不重寫 auth、RBAC、presentation engine、member-module、chapter-platform 已完成能力
- 本 change 不做無依據的視覺重設計，所有方向都以既有 mockup 與 Open Design 對焦為準

## Capabilities

### New Capability

- `uiux-v3-final-alignment`: 在既有功能基線上，完成 member/admin v3 mockup 與 Open Design 對齊

## Impact

- Affected specs:
  - `uiux-v3-final-alignment`
- Affected code:
  - `app/(member)/*`
  - `app/(admin)/*`
  - `components/*`
  - `e2e/admin-member.spec.ts`
