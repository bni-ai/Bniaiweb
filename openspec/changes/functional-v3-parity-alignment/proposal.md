## Why

目前網站的功能基線已經存在，但「功能怎麼被管理者與會員看見、操作、驗證」仍與既有 v3 mockup 和先前討論的使用模型不一致。最明顯的落差是：管理員/會員/來賓的可見頁面邊界不夠清楚、簡報後台暴露 `slide_order` JSON 而不是可操作的工作台、系統設定雖有資料接線卻沒有對齊管理者可理解的資訊架構。

這一輪需要先把功能呈現與前後端接線對齊，讓「後台填寫 -> 前台 HTML 預覽 -> 發布/驗收」與「設定變更 -> 實際影響 deadline/reminder/provider」都成立，之後再做最終 UI/UX 視覺對齊，避免先修畫面再回頭拆功能。

## What Changes

- 重整角色可見範圍與 fallback，明確落實 `admin 可看 Admin + Dashboard + Guest`、`member 可看 Dashboard + Guest`、`guest 只可看 Guest`。
- 把管理端簡報頁改成工作台模式：週次清單、投影片順序、HTML 預覽、狀態卡、發布操作都以人可操作的 UI 呈現，不再把 JSON 當主操作介面。
- 對齊前台 HTML viewer 與後台簡報資料契約，確保後台變更順序、可見性或內容時，預覽與發布頁能即時反映。
- 把系統設定頁重整成分會資訊、AI 設定、例會設定三個管理分區，並讓儲存後的 effect 明確對應到 deadline、reminder、AI provider、sync baseline。
- 補齊 admin/member shell 的登入者資訊卡，讓左上角能顯示頭像、姓名、角色、職務或會員編號。
- 將會員端一對一與 Jitsi Meet 流程改成 mockup 對齊的操作表面，包含即將進行、發起預約、預約紀錄與站內視訊入口。
- 將 AI 助手由 baseline query page 改為聊天型表面，保留既有 provider/query backend。
- 將圖片與素材上傳整理成會員與後台可理解的 Media UX，本輪保留 Supabase Storage，R2 留到後續 adapter。
- 建立 page-level wiring audit，讓簡報與設定相關頁面都能對照 route、action、data source、preview/public surface 與驗收案例。
- 將工作拆成前端 parity 與後端 wiring 兩條任務線，避免只改畫面或只改後端而再次出現功能/介面脫節。

## Non-Goals

- 這次不做 pixel-perfect 的最終視覺還原；重點是功能呈現、資訊架構、預覽流程與響應式骨架對齊。
- 這次不重寫 auth、Supabase schema、slide engine 或既有 modules 的核心資料模型。
- 這次不新增新的產品模組；只修正現有功能如何被管理、預覽、發布與驗收。

## Capabilities

### New Capabilities

- `admin-settings-workbench`: 以管理者可理解的方式管理分會資訊、AI 設定與例會設定，並明確反映儲存後的系統效果。

### Modified Capabilities

- `rbac-middleware`: 調整角色可見頁面與 redirect/fallback 行為，讓 admin、member、guest 的權限表面與實際可見頁面一致。
- `presentation-publishing`: 把簡報建立/編輯/發布流程從 JSON 直編調整為工作台 + HTML 預覽 + 發布流程。
- `admin-v3-ui-parity`: 將簡報管理、系統設定等 admin v3 頁面從 placeholder/工程視角呈現提升為真實管理工作台。
- `member-v3-ui-parity`: 調整 member shell、media、one-on-one/Jitsi、AI assistant 與 fallback，讓會員端呈現與 mockup 的操作模型一致。
- `frontend-backend-wiring-audit`: 補強簡報、設定、角色切換相關頁面的 route/action/data-source/preview 驗收對照。

## Impact

- Affected specs:
  - `admin-settings-workbench`
  - `rbac-middleware`
  - `presentation-publishing`
  - `admin-v3-ui-parity`
  - `member-v3-ui-parity`
  - `frontend-backend-wiring-audit`
- Affected code:
  - Modified: `middleware.ts`, `lib/access-control.ts`, `lib/auth/access-control.ts`, `lib/actions/presentations.ts`, `lib/actions/settings.ts`, `lib/actions/member-portal.ts`, `lib/actions/one-on-ones.ts`, `lib/actions/ai-assistant.ts`, `lib/actions/members.ts`, `app/(admin)/layout.tsx`, `app/(admin)/admin/presentation/page.tsx`, `app/(admin)/admin/presentations/[id]/page.tsx`, `app/(admin)/admin/settings/page.tsx`, `app/(member)/layout.tsx`, `app/(member)/dashboard/page.tsx`, `app/(member)/dashboard/profile/page.tsx`, `app/(member)/dashboard/one-on-one/page.tsx`, `app/(member)/dashboard/one-on-one/[id]/video/page.tsx`, `app/(member)/dashboard/ai/page.tsx`, `app/presentation/[week-date]/page.tsx`, `components/slides/*`, `e2e/admin-member.spec.ts`
  - New: `openspec/changes/functional-v3-parity-alignment/specs/admin-settings-workbench/spec.md`
  - Removed: none
