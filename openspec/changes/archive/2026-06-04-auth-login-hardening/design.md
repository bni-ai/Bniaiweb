## Context

目前登入頁是 client component，Google / GitHub 透過 `lib/supabase/client.ts` 建立 browser client 後呼叫 `signInWithOAuth()`；magic link 則走 `app/auth/email-link/route.ts` 產生連結，再導回 `app/auth/callback/route.ts`。產品實作已經不是最初 spec 的「只有 Google 一顆按鈕」，而是同時存在 magic link、Google、GitHub（受 `NEXT_PUBLIC_AUTH_GITHUB_ENABLED` 控制），但還沒有 email/password 入口。

這套流程目前有兩個已驗證的技術缺口。第一，`lib/supabase/client.ts` 與 `lib/supabase/server.ts` 的 env 驗證是 lazy 的：module import 不會失敗，只有在呼叫 `createBrowserClient()` / `createServerClient()` 時才會丟錯，因此 deployment 可以帶病上線，直到使用者點 OAuth 才在瀏覽器崩潰。第二，callback / logout 目前共用的 server client 沒有顯式綁定到回傳 response，導致 Supabase session cookie 是否真正寫入與清除不夠可驗證；目前只有 `sb-role` cookie 被明確設在 callback response 上。

## Goals / Non-Goals

**Goals:**

- 讓 `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` 缺失時在 auth utility 載入階段就失敗，避免使用者互動後才爆炸。
- 讓 OAuth callback、magic link callback、logout 都走可驗證的 cookie persistence 路徑，確保 session 與 role state 一致。
- 重新定義登入頁契約：email/password 與 Google 為主要入口、magic link 為 fallback、GitHub 僅在啟用時顯示，provider 出錯時要有可讀訊息。
- 以 focused tests 覆蓋 root cause，而不是只做手動 smoke。

**Non-Goals:**

- 不在本 change 中更換整套 auth provider 或資料庫 schema 到 `supastarter-nextjs` 的 Better Auth 模型。
- 不在本 change 中更換 Supabase、middleware、或 access-control 架構。
- 不處理會員/來賓資料同步或名冊缺漏問題，只處理登入與 session 本身。

## Decisions

### D1. 將 Supabase public env 驗證前移到 module scope

`lib/supabase/client.ts` 與 `lib/supabase/server.ts` 會在 module scope 就解析 `NEXT_PUBLIC_SUPABASE_URL` 與 `NEXT_PUBLIC_SUPABASE_ANON_KEY`，並把結果存在常數，而不是每次呼叫 factory 時才檢查。
其中 `lib/supabase/client.ts` 必須使用靜態 `process.env.NEXT_PUBLIC_*` 存取，不能走 `process.env[name]` 這種動態索引，否則 Next 不會把 public env 正確注入 client bundle。

這樣做的理由是讓 misconfiguration 在 build / import 時即顯現，符合既有 spec，也能直接解釋使用者目前看到的「點 Google 才炸」症狀。相比把 login page 改成 try/catch 後顯示 prettier error，前移驗證更能修 root cause。

### D2. 為 callback / logout 提供 response-bound Supabase cookie writer

新增或調整 server-side auth helper，讓 route handler / server action 可以把 Supabase 寫入 cookie 的 side effect 綁到明確的 `NextResponse` 上。callback 在 exchange/verify 成功後，必須同時完成兩件事：

1. Supabase session cookie 寫入 response
2. `sb-role` cookie 依 member / guest 解析結果寫入同一個 response

logout 也要走同一套路徑，確保 Supabase session cookie 與 `sb-role` 一起清除，而不是只呼叫 `supabase.auth.signOut()` 後假設 framework 會自動把 cookie 帶回去。

不採用「保留現況，只補 e2e 驗證」的原因是目前風險來自 cookie 寫入邊界不明，測試只能證明部分結果，不能降低結構風險。

### D3. 登入頁 provider 契約以 email/password parity 與 graceful availability 為優先

登入頁維持四種入口語義：

- Email/password：比照 `supastarter-nextjs` 的主要 email 登入方式
- Google：主要 OAuth 入口，預設顯示
- Magic link：fallback，保留但不再是假定唯一正式流程
- GitHub：僅在 `NEXT_PUBLIC_AUTH_GITHUB_ENABLED=true` 時顯示

email/password 會先在既有 Supabase Auth 架構內實作，不直接搬移 `supastarter-nextjs` 的 Better Auth。對使用者的 observable behavior 要對齊：可直接輸入 email/password 登入、登入後 session 會持久、登出會乾淨清掉。若 provider 在前端不可初始化、Supabase 回傳 OAuth error、GitHub 尚未啟用、或 email/password 驗證失敗，UI 必須顯示可理解錯誤訊息，不能把 raw exception 直接炸到使用者面前。

這個決策只對齊 login parity，不把 signup、forgot password、reset password 一起擴進來，因為那會牽涉帳號生命週期與名冊綁定規則，超出本次修復範圍。

### D4. 測試先鎖 root cause，再做 auth flow smoke

因為 `.spectra.yaml` 啟用了 `tdd: true`，本 change 的 apply 要先補 failing tests，再修碼。測試分三層：

- unit：`lib/supabase/client.ts` / `lib/supabase/server.ts` 的 env 驗證時機
- integration：callback / logout 是否在 response 上帶出正確 cookies
- focused flow：登入頁在 email/password success/failure、GitHub disabled、OAuth error、magic link success 等情境的文案與流程

完整第三方 OAuth 真登入不作為這次唯一驗證，因為 provider 設定與外站行為會讓 root cause 被雜訊掩蓋。

## Implementation Contract

### Observable behavior

- 若 `NEXT_PUBLIC_SUPABASE_URL` 或 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 缺失，app 會在載入 Supabase auth utility 時就失敗，而不是到使用者點 Google / GitHub 才在瀏覽器端出現 uncaught error。
- 使用者以 email/password、Google 或 magic link 登入後，重新整理頁面仍維持登入狀態；登入成功後會依 member/admin/guest 導向正確入口。
- 使用者登出後，重新整理或回到受保護頁面會被導回 `/login`，不會殘留 `sb-role` 或舊 session。
- GitHub 未啟用時，頁面不會嘗試發起 GitHub OAuth；若使用者觸發相關入口，只看到可理解提示。

### Interface / data shape

- `createBrowserClient()` / `createServerClient()` 仍為唯一 Supabase 入口，對呼叫方 API 不改名。
- callback / logout 會透過 response-bound cookie adapter 寫入或清除 Supabase auth cookies 與 `sb-role` cookie。
- `/auth/callback` 繼續接受 `code` 或 `token_hash + type`；成功後依 `resolveAuthDestination()` 導向 `/admin`、`/dashboard`、`/guest` 或 `/error`。
- email/password 入口會提交到 server-side login handler，由該 handler 驗證 Supabase 密碼登入後建立 session，再依 `resolveAuthDestination()` 完成 role-based redirect。

### Failure modes

- env 缺失：在 module import / build 階段失敗，錯誤訊息維持 `Missing Supabase env var: <NAME>`。
- email/password 錯誤：顯示可理解登入失敗訊息，不洩漏多餘系統細節。
- OAuth provider 回傳錯誤：login page 顯示文字錯誤，不丟未捕捉例外。
- callback 找不到 member/guest：導向 `/error`，並清理 `sb-role`。
- logout 即使 Supabase signOut 回傳異常，也不得留下可繼續通行的 `sb-role` cookie。

### Acceptance criteria

- focused tests 先失敗後修綠：env validation、email/password、callback cookie persistence、logout cookie clearing。
- `npm run build` 通過。
- 至少一個 focused auth 測試證明 email/password 錯誤與 GitHub disabled / OAuth error 時 login page 顯示可讀錯誤而非 raw exception。
- 手動 smoke：本機 `/login` 可開啟，點 Google 不再出現 `Missing Supabase env var: NEXT_PUBLIC_SUPABASE_URL` 這種 runtime crash。

### Scope boundaries

- In scope：email/password login parity、Google OAuth crash、magic link callback/session persistence、logout cookie correctness、GitHub availability copy。
- Out of scope：signup、forgot/reset password、Supabase dashboard provider 設定教學、會員資料修補、完整外站 OAuth UAT 自動化、整套 Better Auth migration。

## Risks / Trade-offs

- [Risk] module-scope env 驗證會讓 misconfigured preview 更早 fail → Mitigation：這是刻意行為，讓壞部署不要到互動期才暴露。
- [Risk] 調整 cookie writer 可能影響既有 magic link flow → Mitigation：callback / logout 先補 focused integration tests，再改實作。
- [Risk] email/password parity 若直接照搬 `supastarter-nextjs` 會忽略 Supabase 與 Better Auth 差異 → Mitigation：只對齊 user-facing flow，不直接移植底層實作。
- [Risk] login UI 文案調整可能與舊 spec/設計稿不一致 → Mitigation：本 change 同步更新 `supabase-auth` spec，讓 spec 與真實產品重新對齊。

## Migration Plan

1. 先補 failing tests，重現 lazy env validation 與 callback/logout cookie 問題。
2. 調整 Supabase client/server helper，前移 env 驗證並補 response-bound cookie adapter。
3. 修正 login page / password login handler / callback / logout。
4. 跑 focused tests 與 `npm run build`。
5. 部署到 preview，確認 `/login` 與 callback 不再出現 runtime crash。
6. 如需 production，等用戶確認後再升級流量。

## Open Questions

- email/password 的正式帳號來源要採用「既有 Supabase Auth 使用者」還是要加一條 admin 建立/同步流程。
