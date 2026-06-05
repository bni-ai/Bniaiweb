## Context

目前 auth 邊界與產品決策不一致：

- `/signup` 仍是公開來賓註冊頁，沒有把會員與來賓入口分開。
- `guest` 使用者若自行前往 `/signup`，可能和會員邀請流程混在一起。
- `/login` 對所有人顯示 Google / GitHub，但產品決策已定為「社群登入只給會員帳號使用」。
- OAuth callback 目前只按 email 解析身份，若 email 在 `guests` 命中，就可能把社群登入導回 `/guest`，與預期不符。

這次 change 要把「會員邀請制」落實到 route、callback 與登入文案層，同時保留來賓公開註冊與後台升權流程。

## Goals / Non-Goals

**Goals:**

- 新增 `member_invites` 資料表儲存一次性邀請 token。
- Admin 後台可對指定 email 產生帶 token 的邀請連結。
- `/signup?token=xxx` 在前端驗證 token 存在後才顯示表單；後端 route 在建帳號前再次驗證。
- Token 使用後標記為已使用（`used_at`），不可重複使用。
- 會員與來賓註冊入口分流：`/signup` 只處理會員受邀註冊，`/guest/register` 處理公開來賓註冊。
- Google / GitHub 明確限定為會員登入方式，不可讓來賓或 `pending_member` 透過社群登入拿到 `/guest`。

**Non-Goals:**

- 不做 email 自動寄送（admin 手動複製連結後轉傳）。
- 不做批次邀請（CSV 匯入等）。
- 不修改 pending_member 審核升權邏輯。
- 不把來賓升會員流程改成自助申請；仍由後台管理員直接升權。

## Decisions

### D1. member_invites 表儲存 token，而不是擴充 members 表

邀請 token 是暫態資料（使用完即廢棄），不屬於會員紀錄。獨立建表可讓查詢與清理更乾淨，也不會污染 members 表的欄位。
Schema：`id（uuid PK）`、`email（text）`、`token（text unique）`、`created_at`、`expires_at`、`used_at（nullable）`。

### D2. Token 採用 crypto 隨機字串（32 bytes hex），而不是 UUID

UUID 可預測性較高；`crypto.randomBytes(32).toString('hex')` 產生 64 字元隨機字串，暴力破解難度更高。到期時間預設 7 天。

### D3. 前端頁面載入時驗證 token，後端 route 提交時再驗證（雙重驗證）

前端驗證（Server Component 查表）負責隱藏表單，防止陌生人看到申請入口。
後端驗證（signup route）負責防止繞過前端直接呼叫 API 的攻擊。

### D4. Admin 後台在 members 頁面新增「邀請新會員」按鈕，不另開獨立頁面

邀請動作是成員管理的延伸，放在 `/admin/members` 頁面維持工作流一致性。Admin 輸入 email → 按鈕產生連結 → 顯示可複製的 URL。

### D5. 會員與來賓註冊 route 明確分流，而不是用同一個 `/signup`

`/signup` 改成會員受邀入口，必須帶有效 token 才能顯示表單；公開來賓註冊改到 `/guest/register`。對應 API 也分開：

- `/auth/signup`：會員受邀註冊
- `/auth/guest-signup`：來賓公開註冊

這樣 login / signup 文案、權限邊界與後台管理才能一致。替代方案是保留同一路由、用前端文案區分；這會讓身份邊界繼續混亂，不採用。

### D6. 社群登入只允許正式會員或管理員，不允許 guest / pending_member

Google / GitHub 仍保留，但定位為會員帳號登入。OAuth callback 在完成 Supabase session 後，若身份解析結果是 `guest` 或 `pending_member`，系統必須清掉 auth cookies、導回錯誤頁，並提示改用 email/password 或 magic link。替代方案是讓 guest 也能用社群登入；這與產品決策衝突，也會讓 guest / member 邊界模糊，不採用。

## Implementation Contract

### Observable behavior

- Admin 進入 `/admin/members`，輸入目標 email，點擊「產生邀請連結」，頁面 SHALL 顯示可複製的 `/signup?token=xxx` 連結。
- 訪客持有效 token 進入 `/signup?token=xxx`，SHALL 看到申請表單。
- 訪客進入 `/signup`（無 token）或帶無效 token，SHALL 看到「此頁面僅供受邀者使用」說明，不得顯示申請表單。
- 訪客進入 `/guest/register`，SHALL 看到公開來賓註冊表單，而不是會員邀請說明。
- 提交表單後，token SHALL 被標記為 `used_at = now()`，再次使用該連結 SHALL 顯示「連結已失效」。
- Token 超過 `expires_at` 後，SHALL 視為無效。
- `/login` 的 Google / GitHub 區塊 SHALL 明確標示為會員社群登入；來賓入口改由 `/guest` / `/guest/register` 承接。
- 若使用 Google / GitHub 完成 OAuth，但 email 解析到 `guest` 或 `pending_member`，系統 SHALL 阻擋進入 `/guest`，清除 cookies，並顯示可讀錯誤訊息。

### Interface / data shape

**DB table: member_invites**
```
id          uuid primary key default gen_random_uuid()
email       text not null
token       text not null unique
created_at  timestamptz not null default now()
expires_at  timestamptz not null
used_at     timestamptz nullable
```

**Server Action: generateMemberInviteAction(email: string)**
回傳 `{ inviteUrl: string }` 或 `{ error: string }`。

**Signup page（Server Component）**
props 包含 `searchParams.token`；查 `member_invites` 表驗證後決定渲染表單或封鎖畫面。

**Signup route POST `/auth/signup`**
request body 新增 `inviteToken: string`；驗證邏輯：token 存在 + `used_at IS NULL` + `expires_at > now()`，通過後建帳號並 `UPDATE member_invites SET used_at = now()`。

**Guest signup page `/guest/register`**
公開註冊來賓表單，提交至 `/auth/guest-signup`，成功後導向 `/guest`。

**OAuth callback**
完成 Supabase session 後，依 email 解析身份；若結果是 `member` / `admin` 則維持原導向，若結果是 `guest` / `pending_member` 則阻擋並清 cookie。

### Failure modes

- token 不存在或已使用或已過期：signup page 顯示封鎖畫面；signup route 回傳 `400 { error: "邀請連結無效或已過期。" }`。
- 同一 email 已有帳號：維持原有邏輯，回傳 `400 duplicate error`。
- DB 查詢失敗：回傳 `500`，不洩漏 token 內容。
- guest 嘗試用 Google / GitHub：callback 不給 `/guest` session，改導向錯誤頁並清除 cookies。

### Acceptance criteria

- 無 token 的 `/signup` 請求顯示封鎖畫面（不顯示申請表單）。
- 有效 token 的 `/signup?token=xxx` 請求顯示申請表單。
- 用過的 token 再次使用時顯示「已失效」。
- `generateMemberInviteAction` 在 `member_invites` 表建立一筆紀錄，`used_at` 為 null。
- `/guest/register` 可以建立來賓帳號，且不依賴 invite token。
- guest / pending_member 的 Google / GitHub callback 會被阻擋，不會導向 `/guest`。
- focused tests 覆蓋：valid token、invalid token、expired token、already-used token、guest signup route split、guest social login blocked。

### Scope boundaries

- In scope：`member_invites` 表、generateMemberInviteAction、signup page token 驗證、signup route token 驗證、guest signup route split、OAuth guest/member boundary、admin members UI 新增邀請按鈕。
- Out of scope：email 寄送、批次邀請、token 撤銷介面、pending_member 審核邏輯、guest 升會員自助流程。

## Risks / Trade-offs

- [Risk] token 連結轉傳給非預期對象 → Mitigation：到期時間 7 天 + 一次性使用，降低外流危害。
- [Risk] 前端 Server Component 查表增加頁面延遲 → Mitigation：`member_invites.token` 有 unique index，查詢 O(1)。
- [Risk] Admin 忘記複製連結，token 浪費 → Mitigation：設計上可對同一 email 重複產生新 token（舊 token 仍有效直到到期），不做唯一性限制。
- [Risk] guest 現有註冊入口改路徑，舊連結失效 → Mitigation：在 `/signup` blocked state 與 `/login` guest CTA 明確導到 `/guest/register`。
- [Risk] 社群登入阻擋 guest 後，使用者誤以為系統壞掉 → Mitigation：錯誤頁使用清楚文案，直接指出 guest 請改用 Email / 密碼或 magic link。
