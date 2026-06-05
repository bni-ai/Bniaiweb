## Problem

目前登入體驗與 auth 基線同時有四個問題：第一，Google OAuth 在部分環境會於使用者點擊按鈕後才因 `NEXT_PUBLIC_SUPABASE_URL` 缺失而在瀏覽器端崩潰；第二，callback / logout 的 session cookie 寫入路徑不夠明確，導致「登入是否真的持久、登出是否真的清乾淨」缺乏保證；第三，目前產品實作已從最初 spec 的單一 Google 入口漂移成「magic link + Google + optional GitHub」，但沒有把 provider 可用性、fallback 與錯誤呈現重新收斂成正式契約；第四，使用者希望像 `supastarter-nextjs` 一樣直接用 email/password 登入，而不是每次都要回信箱點 magic link。

這個問題要現在處理，因為它已經影響真實登入流程：使用者每次都要回信箱點 magic link 很不方便，而 OAuth 入口又可能在前端執行時才炸掉，讓部署看起來正常、實際登入卻失敗。

## What Changes

- 將 Supabase public env 驗證改成在 auth utility 載入時就失敗，而不是等到使用者點 Google / GitHub 才在瀏覽器端拋錯。
- 修正 auth callback 與 logout 的 cookie 寫入流程，確保 Supabase session 與 `sb-role` cookie 都能正確建立、持久化與清除。
- 收斂登入頁行為：提供 email/password 作為主要 email 登入方式，Google 作為主要 OAuth 入口、magic link 作為 fallback、GitHub 僅在明確啟用時顯示；provider 不可用時必須顯示可理解錯誤，不可丟出未捕捉例外。
- 補上 focused tests，覆蓋 env 驗證、email/password、OAuth callback session persistence、logout 清 cookie、provider availability copy。

## Non-Goals

- 本次不新增全新的會員資料模型或改動 `members` / `guests` 權限邊界。
- 本次不把 email magic link 完全移除；它仍保留為 fallback。
- 本次不直接把整套 auth 底層改成 `supastarter-nextjs` 的 Better Auth；先在既有 Supabase 架構內對齊 email/password 與持久登入體驗。

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `supabase-auth`: 調整登入入口、email/password、OAuth callback/session persistence、logout 行為與 provider 錯誤處理契約。
- `supabase-client-setup`: 調整 Supabase env 驗證時機與 route-handler cookie persistence 契約。

## Impact

- Affected specs: `supabase-auth`, `supabase-client-setup`
- Affected code:
  - Modified: `app/(auth)/login/page.tsx`, `app/auth/callback/route.ts`, `app/auth/email-link/route.ts`, `lib/actions/auth.ts`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `middleware.ts`
  - New: `app/auth/password-login/route.ts`, `lib/supabase/client.test.ts`, `lib/supabase/server.test.ts`, `lib/auth/callback.test.ts`, `lib/auth/password-login.test.ts`
  - Removed: none
