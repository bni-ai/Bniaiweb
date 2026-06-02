# SR Alignment Patch（對齊 ui-mockup v3）

日期：2026-06-02
範圍：`app-foundation`、`bni-chapter-platform`、`member-module`、`member-portal`、`admin-backend`、`presentation-engine`、`landing-page`

## 1) Canonical 路由（以 UI v3 為準）

### Member（`ui-mockup-member-v3.html`）

- `/dashboard`：總覽（`page-dashboard`）
- `/dashboard/report`：每週簡報（`page-report`）
- `/dashboard/one-on-one`：一對一預約（`page-onetone`）
- `/dashboard/profile`：個人資料（`page-profile`）
- `/dashboard/directory`：通訊錄（`page-directory`）
- `/dashboard/training`：培訓紀錄（`page-training`）
- `/dashboard/events`：活動（`page-events`）
- `/dashboard/ai`：AI 助手（`page-ai`）

### Admin（`ui-mockup-admin-v3.html`）

- `/admin`：總覽儀表板（`page-overview`）
- `/admin/submission`：簡報提交狀況（`page-submission`）
- `/admin/presentation`：簡報管理（`page-presentation`）
- `/admin/keynote`：8 分鐘短講（`page-keynote`）
- `/admin/guests`：來賓管理（`page-guests`）
- `/admin/members`：會員管理（`page-members`）
- `/admin/import`：資料匯入（`page-import`）
- `/admin/settings`：系統設定（`page-settings`）

### Public

- `/`：landing page（公開）
- `/presentation/[week-date]`：公開簡報 URL（UI 與 bni-chapter-platform 一致）

## 2) 相容別名（避免 SR 互踩）

為了兼容既有 SR 命名差異，先保留以下 alias 轉址：

- `/dashboard/brief` -> `/dashboard/report`
- `/dashboard/weekly` -> `/dashboard/report`
- `/admin/weekly-briefs` -> `/admin/submission`
- `/admin/presentations` -> `/admin/presentation`
- `/presentation/[id]` -> lookup `presentations.id` 後 302 到 `/presentation/[week-date]`

## 3) Canonical 權限模型

- `members.role` 僅兩種：`admin | member`
- `position`、`committee` 作為職掌與委員會資訊，不再另建 `officer/president` role enum

## 4) Canonical 資料模型（跨 SR）

### 必要表（UI + 功能都需要）

- `members`（含公司資訊與 GAINS 欄位）
- `member_top_clients`
- `member_contacts_circle`
- `weekly_briefs`
- `presentations`
- `keynote_talks`
- `guests`
- `guest_visits`
- `weekly_awards`
- `weekly_vp_reports`
- `member_availability`
- `one_on_ones`
- `events`、`event_registrations`
- `training_courses`、`training_records`
- `ai_settings`
- `admin_settings`、`sync_logs`

### 關鍵一致性規則

- Guest 週別、回訪次數以 `guest_visits` 為唯一來源；`guests` 僅存來賓主檔
- 簡報公開連結以 `week_date` 為對外識別；`id` 僅內部管理
- 一對一房號命名統一：`bni-hua-{one_on_one_id 前 8 碼}`

## 5) SR Ownership（避免重工）

- `app-foundation`：框架、auth、RBAC、base tokens、共用 layout
- `landing-page`：公開首頁與 marketing 區塊
- `member-portal`：`/dashboard`、`/dashboard/report`、`/dashboard/directory`
- `member-module`：`/dashboard/profile`、`/dashboard/one-on-one`、`/dashboard/training`、`/dashboard/events`、`/dashboard/ai`、GAINS/top-clients/contacts-circle
- `admin-backend`：`/admin/*`（overview/submission/presentation/keynote/guests/members/import/settings）
- `presentation-engine`：`/presentation/[week-date]` viewer + slide components + builder
- `bni-chapter-platform`：整體藍圖與跨模組整合驗收（不再與上述 SR 重複實作同檔）

## 6) 執行順序（可直接照跑）

1. `app-foundation`（scaffold/auth/RBAC/public presentation skeleton）
2. `bni-chapter-platform`（只先跑 shared schema 任務：例如 2.13、2.14；不碰 UI 頁面）
3. `landing-page`
4. `member-module`（先 profile + one-on-one，再 training/events/ai）
5. `member-portal`
6. `admin-backend`
7. `presentation-engine`
8. `bni-chapter-platform`（最後只跑 integration / E2E / rollout 驗收）

## 7) UI/UX 對齊結論（現況）

- 目前 repo 幾乎尚未進入頁面實作，`app/` 仍空，尚無法宣稱「UI 已對齊」。
- 但 SR 層可先以本 patch 統一命名與資料模型，避免實作後大幅返工。

## 8) 重複 / 互斥 / 未對齊清單（執行前必看）

### 重複（需去重，由 owner SR 負責）

- `member-portal` 與 `bni-chapter-platform` 都有 `/dashboard/report` 與週報 API 任務：以 `member-portal` 為主，`bni-chapter-platform` 僅保留整合驗收。
- `admin-backend` 與 `bni-chapter-platform` 都有 `/admin/submission`、`/admin/presentation`、`/admin/keynote`、`/admin/guests`：以 `admin-backend` 為主，`bni-chapter-platform` 保留整合串接。
- `presentation-engine` 與 `bni-chapter-platform` 都有 slide builder / viewer：以 `presentation-engine` 為主，`bni-chapter-platform` 驗收 publish 後公開可讀。

### 互斥（必須先定 canonical，避免覆寫）

- Public presentation route：`/presentation/[week-date]`（canonical） vs `/presentation/[id]`（legacy）。規則：保留 id alias 但一律轉址到 week-date。
- 週報頁命名：`/dashboard/report`（canonical） vs `/dashboard/brief`、`/dashboard/weekly`（legacy）。
- Admin 簡報/提交流程命名：`/admin/submission`、`/admin/presentation`（canonical） vs `/admin/weekly-briefs`、`/admin/presentations`（legacy）。
- 角色模型：`members.role` 只允許 `admin/member`；`officer/president` 不再作為 role enum。

### 未對齊（需先改再進入實作）

- `member-module` 的 `/dashboard/gains`、`/dashboard/top-clients`、`/dashboard/contacts-circle` 與 UI v3 導航不一致：建議改成 `/dashboard/profile` 內分頁或子區塊，避免新增側欄項目。
- `bni-chapter-platform` 目前仍混有部分「全實作任務」語意，與 owner 分工衝突：應下修為 integration / E2E / rollout gate。
