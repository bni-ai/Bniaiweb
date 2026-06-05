## 1. 資料庫基礎

- [ ] 1.1 落實 `Admin can generate a one-time member invite token` 與 `member_invites 表儲存 token，而不是擴充 members 表` 的資料基礎：建立 `supabase/migrations/20260604_create_member_invites.sql`，新增 `member_invites` 資料表，欄位包含 `id uuid PK`、`email text not null`、`token text not null unique`、`created_at timestamptz default now()`、`expires_at timestamptz not null`、`used_at timestamptz nullable`，並在 `token` 欄位建立唯一索引；驗證：`supabase db push` 通過且可在本地資料庫查到 `member_invites` 資料表結構。

## 2. 邀請 Token 核心邏輯

- [x] [P] 2.1 落實 `Admin can generate a one-time member invite token` 與 `token 採用 crypto 隨機字串（32 bytes hex），而不是 uuid`：建立 `app/actions/member-invite.ts`，實作 `generateMemberInviteAction(email: string)` Server Action，以 `crypto.randomBytes(32).toString('hex')` 產生 token，寫入 `member_invites`（`expires_at = now() + 7 days`），回傳 `{ inviteUrl: string }`（格式：`/signup?token=<token>`）或 `{ error: string }`；驗證：`app/actions/member-invite.test.ts` 覆蓋 token 格式與回傳 URL。
- [x] [P] 2.2 落實 `Signup page validates invite token before displaying form`、`Member self-service registration is invitation-only` 與 `前端頁面載入時驗證 token，後端 route 提交時再驗證（雙重驗證）` 的前端半段：修改 `app/(auth)/signup/page.tsx`（Server Component），讀取 `searchParams.token`，查 `member_invites` 表驗證 token 有效性（exists + `used_at IS NULL` + `expires_at > now()`），有效時渲染表單，無效或缺少 token 時渲染封鎖畫面並導向 guest 替代入口；驗證：無 token 的 `/signup` 顯示封鎖畫面，有效 token 的 `/signup?token=xxx` 顯示表單。
- [x] 2.3 落實 `Signup route validates token before creating account`、`Signup route enforces invite token before account creation`、`Self-service registration creates a low-privilege account` 與 `前端頁面載入時驗證 token，後端 route 提交時再驗證（雙重驗證）` 的後端半段：修改 `app/auth/signup/route.ts` POST handler，解析 `inviteToken` 並在建帳號前查表驗證（token 存在 + `used_at IS NULL` + `expires_at > now()`），驗證失敗回傳 `400 { error: "邀請連結無效或已過期。" }`，驗證成功後建 `pending_member` 帳號並 `UPDATE member_invites SET used_at = now()`；驗證：用過的 token 再次提交回傳 400，有效 token 提交成功並在 DB 看到 `used_at` 被寫入。

## 3. 會員 / 來賓入口分流

- [x] [P] 3.1 落實 `Guest public signup uses a dedicated route` 與 `會員與來賓註冊 route 明確分流，而不是用同一個 /signup`：新增 `app/(guest)/guest/register/page.tsx` 與 `app/auth/guest-signup/route.ts`，把現有公開來賓註冊流程搬到 `/guest/register` 與 `/auth/guest-signup`；驗證：匿名訪客可在 `/guest/register` 建立來賓帳號並導向 `/guest`。
- [x] [P] 3.2 重寫 `app/(auth)/signup/page.tsx` 的文案與提交 payload，讓它只處理會員受邀註冊，提交時帶 `inviteToken`；驗證：`/signup?token=xxx` 顯示會員註冊文案，送出 body 含 `inviteToken`。
- [x] 3.3 修改 `app/(auth)/login/page.tsx`，將 guest CTA 明確導向 `/guest` / `/guest/register`，並把 Google / GitHub 文案標示為會員社群登入；驗證：`/login` 頁面同時看得到會員登入與來賓入口，但不再把 guest 與社群登入混成同一路徑。
- [x] 3.4 落實 `Social login is reserved for approved member identities` 與 `社群登入只允許正式會員或管理員，不允許 guest / pending_member`：修改 `app/auth/callback/route.ts` 與相關 identity 邏輯，若 OAuth callback 解析到 `guest` 或 `pending_member`，則清除 auth cookies、導向錯誤頁並顯示需改用 Email / 密碼或 magic link 的訊息；驗證：模擬 guest / pending_member 的 OAuth callback 時不會導向 `/guest`。

## 4. Admin 後台邀請介面

- [x] 4.1 落實 `Admin can generate a one-time member invite token` 與 `admin 後台在 members 頁面新增「邀請新會員」按鈕，不另開獨立頁面`：修改 `app/(admin)/admin/members/page.tsx`，新增「邀請新會員」表單，含 email 輸入欄位，呼叫 `generateMemberInviteAction`，成功後在頁面顯示可複製的邀請連結；驗證：admin 輸入 email 後點擊按鈕，頁面顯示 `/signup?token=xxx` 格式的連結。

## 5. 測試與收尾

- [x] [P] 5.1 在 `app/auth/signup/route.test.ts`、`app/auth/callback/route.test.ts` 與 `e2e/auth-login.spec.ts` 補齊 focused tests，覆蓋：valid token、expired token、already-used token、unknown token、guest public signup route、guest OAuth blocked；驗證：auth focused tests 全綠，且 e2e 覆蓋 `/signup`、`/guest/register`、`/login` 三種入口。
- [x] 5.2 依 `observable behavior`、`interface / data shape`、`failure modes`、`acceptance criteria` 與 `scope boundaries` 執行整體驗收：跑 `npm run build`、`spectra analyze member-invite-link-registration --json`、`spectra validate member-invite-link-registration`；驗證：build 0 錯誤，spectra checks 通過。
