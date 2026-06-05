## Why

目前來賓入口已有部分頁面與登入資料，但還沒有收成「最小可用版」：公開來賓註冊與登入後 `/guest` 的基本歡迎資訊、聯繫窗口、會後回饋入口仍不夠清楚。這次先把 guest portal 收成 MVP，先解決真實營運需要，再把更大的三入口導航大改留到後續。

## What Changes

- 來賓入口先收成 MVP：
  - 匿名訪客可以從公開 guest 入口理解分會與註冊來賓帳號
  - 已登入來賓可以在 `/guest` 看到基本歡迎資訊、分會 / BNI 簡介、邀約人或聯繫窗口、參訪週次與下一步
  - `/guest` 提供 `會後回饋` 與 `請聯繫人協助引介` 入口
- 保留 guest access boundary：來賓只能看到 guest surface，不可看到 member/admin workflow。
- UI 延續目前 v3 alignment，但這次不做完整三入口導航重構。

## Non-Goals

- 本 SR 不做完整 admin/member/guest portal switch 重構。
- 本 SR 不做正式會員 CSV 契約與匯入。
- 本 SR 不做 guest introduction request 的完整後台追蹤資料流。
- 本 SR 不把來賓開放成完整會員通訊錄權限。

## Capabilities

### New Capabilities

- `guest-auth-portal`: 來賓入口收成最小可用版，能支撐公開註冊、登入後歡迎資訊、聯繫窗口與回饋入口。

### Modified Capabilities

- `guest-public-content`: 區分匿名來賓與已登入來賓的內容層級，並提供公開註冊 CTA。
- `guest-access-boundary`: 明確來賓 portal 不得顯示 member/admin workflow。
- `portal-role-segmentation`: 本輪只保留必要身份提示，不做完整入口重構。

## Impact

- Affected specs: portal-role-segmentation, guest-auth-portal, guest-management, guest-public-content, guest-access-boundary
- Affected code:
  - Modified: app/(guest)/layout.tsx, app/(guest)/guest/page.tsx, app/(guest)/guest/prepare/page.tsx, app/(guest)/guest/content/page.tsx, lib/actions/guest-portal.ts, lib/access-control.ts, middleware.ts
  - New: app/(guest)/guest/feedback/page.tsx, app/(guest)/guest/connections/page.tsx
  - Removed: none
