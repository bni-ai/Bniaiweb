## Why

目前 Bniaiweb 的前後端主幹已經建立，登入、會員前台、管理後台、來賓專區都已可運作，也已經通過本機與 production E2E。  
但 `ui-mockup-member-v3.html` 與 `ui-mockup-admin-v3.html` 所表達的資訊架構、入口順序、欄位顯示、狀態呈現與互動方式，和現在實作版仍有明顯落差。

這個落差不是單純視覺問題，而是會影響驗收：

- 使用者從 UI 無法直覺判斷哪些功能已接、哪些尚未完成
- 同一路由雖然存在，但頁面資訊密度與 mockup 期待不一致
- 某些 mockup 入口在現況沒有對應頁面、沒有 disabled 狀態，或沒有明確的前後端接線證據
- 後續還有三條未完成主線：`bni-chapter-platform`、`presentation-engine`、`member-module`，若在 UI 對齊時沒有先切清邊界，容易發生「做 A 壞 B」

## What Changes

- 新增一個專門的 UI/UX 對齊 SR，審核 member/admin v3 mockup 與目前實作的差異
- 針對會員端與管理員端建立「頁面 / 功能 / 狀態 / 資料來源 / 驗收方式」對照表
- 明確列出哪些頁面是：
  - 已接且需補 UI
  - 已有入口但功能未完成，需顯示開發中或受限狀態
  - 尚未實作，必須與未完成 SR 對齊後再做
- 將前端頁面與 server action / route handler / Supabase table 的接線關係寫入 SR，作為驗收基準
- 把整合守則寫進 SR：UI 對齊不得破壞既有登入、RBAC、member/admin/guest flow、presentation 發布鏈路

## Non-Goals

- 本 SR 不追求 pixel-perfect 還原 mockup 視覺
- 本 SR 不直接完成 `presentation-engine`、`member-module`、`bni-chapter-platform` 的全部未完任務
- 本 SR 不重做已通過驗收的 auth / guest portal / admin backend 核心邏輯
- 本 SR 不新增與 mockup 無關的新產品能力

## Capabilities

### New Capabilities

- `member-v3-ui-parity`: 會員端 v3 mockup 的頁面結構、資訊狀態與前後端接線對齊
- `admin-v3-ui-parity`: 管理端 v3 mockup 的頁面結構、資訊狀態與前後端接線對齊
- `frontend-backend-wiring-audit`: 以前端頁面為起點，審核 server actions / route handlers / Supabase tables 是否完整接上

## Impact

- Affected specs:
  - `member-v3-ui-parity`
  - `admin-v3-ui-parity`
  - `frontend-backend-wiring-audit`
- Affected code:
  - `app/(member)/*`
  - `app/(admin)/*`
  - `app/presentation/[week-date]/page.tsx`
  - `lib/actions/*`
  - `e2e/admin-member.spec.ts`
- Coordination with incomplete changes:
  - `bni-chapter-platform`
  - `presentation-engine`
  - `member-module`
