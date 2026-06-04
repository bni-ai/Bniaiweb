## Why

目前 auth 只能算「可登入」，還不是完整的帳號生命週期。會員缺少忘記密碼、自助註冊、Google OAuth 正確回跳與待審核升權流程，導致管理員要手動建帳號、綁權限，實際營運成本偏高，使用者也容易卡在登入入口。

現在要先把這件事寫清楚，因為既有 `auth-login-hardening` 已修掉登入基線，但還沒有定義「使用者如何自己成為可登入會員」以及「後台如何審核升權」的正式契約。

## What Changes

- 新增自助註冊流程，讓未登入使用者可用 email/password 或可用的社群登入建立帳號，而不是只能等後台手動建立。
- 新增忘記密碼 / 重設密碼流程，讓已存在帳號可自助恢復登入，不必依賴管理員介入。
- 修正 Google OAuth 完成後的 redirect 契約，要求 callback 依帳號目前角色與審核狀態導向 `/admin`、`/dashboard`、`/guest` 或待審核狀態頁，而不是回首頁。
- 新增待審核帳號與後台升權流程：新註冊帳號先以低權限狀態存在，管理員可在後台核准並升為 `member` 或 `admin`。
- 明確定義「來賓／待審核／正式會員」之間的邊界，避免自助註冊直接取得正式會員權限。

## Non-Goals

- 本次不直接改寫整套 auth provider，也不切換到 Better Auth。
- 本次不處理付費、邀請碼、或外部分會同步等更上層的會員治理流程。
- 本次不承諾完全開放匿名訪客自動成為正式會員；正式升權仍需要後台審核。

## Capabilities

### New Capabilities

- `self-service-account-approval`: 自助註冊、待審核狀態、後台升權與待審核使用者回饋流程。
- `password-recovery`: 忘記密碼、重設密碼與密碼更新完成後的返回登入流程。

### Modified Capabilities

- `supabase-auth`: 從單純登入入口擴充成包含註冊、重設密碼、OAuth redirect 與角色導向的完整 auth surface。
- `guest-auth-portal`: 調整低權限登入者的落點，使待審核帳號能有明確的登入後狀態，而不是直接報錯或誤入正式會員入口。
- `rbac-middleware`: 補充待審核／低權限帳號在 `/login`、`/guest`、`/dashboard`、`/admin` 的導向契約。

## Impact

- Affected specs: `self-service-account-approval`, `password-recovery`, `supabase-auth`, `guest-auth-portal`, `rbac-middleware`
- Affected code:
  - Modified: `app/(auth)/login/page.tsx`, `app/auth/callback/route.ts`, `middleware.ts`, `lib/auth/identity.ts`, `lib/auth/access-control.ts`, `app/(guest)/guest/page.tsx`, `app/(admin)/admin/members/page.tsx`
  - New: `app/(auth)/signup/page.tsx`, `app/auth/signup/route.ts`, `app/(auth)/forgot-password/page.tsx`, `app/auth/reset-password/route.ts`, `app/(admin)/admin/members/approvals/**`, `lib/auth/password-recovery.ts`, `lib/auth/approval-workflow.ts`, focused auth and approval tests
  - Removed: none
