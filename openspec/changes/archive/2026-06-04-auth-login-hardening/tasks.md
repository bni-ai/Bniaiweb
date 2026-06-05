## 1. Env validation 與 utility 基線

- [x] 1.1 依 `D1. 將 Supabase public env 驗證前移到 module scope` 落實 `Environment Variable Validation` 的 observable behavior，讓 `lib/supabase/client.ts` / `lib/supabase/server.ts` 在 import 時就因缺少 `NEXT_PUBLIC_SUPABASE_URL` 或 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 失敗；驗證：新增 focused tests 覆蓋 import-time throw，不再等到點 Google 才出現 `Missing Supabase env var`，並對照 `Implementation Contract` 的 failure modes。
- [x] 1.2 依 `D2. 為 callback / logout 提供 response-bound Supabase cookie writer` 落實 `Supabase Client Utilities` 的 interface / data shape，讓 callback / logout 的 auth cookie 寫入與清除都綁在實際回傳 response 上；驗證：integration tests 斷言 `/auth/callback` 與 logout response 帶出 Supabase cookies 與 `sb-role` 清理結果，符合 acceptance criteria。

## 2. Auth flow 修正

- [x] 2.0 依 `D3. 登入頁 provider 契約以 email/password parity 與 graceful availability 為優先` 落實 `Email password login`，讓登入頁提供直接 email/password 提交、成功後建立持久 session 與 role redirect、失敗時顯示可讀錯誤；驗證：focused tests 覆蓋 member、guest、invalid credential 三條路徑，行為對齊 `supastarter-nextjs` 的 user-facing login parity。
- [x] 2.1 落實 `Google OAuth Login`，讓 Google OAuth 成功後持久保存 Supabase session 與 resolved role，會員導向 `/admin` 或 `/dashboard`、來賓導向 `/guest`，且未知身份不留下 stale role cookie；驗證：focused callback tests 覆蓋 member、guest、identity-not-found 三條路徑，並對照 `Implementation Contract` 的 observable behavior 與 scope boundaries。
- [x] 2.2 落實 `Logout`，讓登出一定同時清除 Supabase session cookie 與 `sb-role`，即使只剩 stale role cookie 或 upstream signOut 異常也不可繼續通行；驗證：focused logout test 與手動重整受保護頁確認返回 `/login`，覆蓋 failure modes。
- [x] 2.3 落實 `Optional GitHub OAuth entry` 與 `D3. 登入頁 provider 契約以 email/password parity 與 graceful availability 為優先`，讓 login page 對 GitHub disabled、OAuth provider error、magic link fallback 都顯示可讀訊息而非 raw exception；驗證：login page focused tests 覆蓋 disabled / error 狀態，手動於 `/login` 點 Google 不再出現 runtime crash。

## 3. 驗證與收尾

- [x] 3.1 依 `D4. 測試先鎖 root cause，再做 auth flow smoke` 執行 focused auth 測試矩陣，覆蓋 `Email password login`、`Google OAuth Login`、`Optional GitHub OAuth entry`、`Logout`、`Supabase Client Utilities`、`Environment Variable Validation`；驗證：新增 tests 全綠，且失敗訊息能對應 root cause。
- [x] 3.2 執行 `npm run build` 與 `spectra validate auth-login-hardening`，確認 auth-login-hardening 沒有 spec drift 或 build regression；驗證：build 與 Spectra validate 通過。
- [x] 3.3 在本機完成 `/login` smoke，確認 Google / magic link / GitHub availability copy 與持久登入行為符合 `Implementation Contract` 的 acceptance criteria 與 scope boundaries；驗證：記錄手動結果，至少確認不再重現 `Missing Supabase env var: NEXT_PUBLIC_SUPABASE_URL` 的前端點擊崩潰。
