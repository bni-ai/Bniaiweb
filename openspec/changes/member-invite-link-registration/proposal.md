## Why

目前會員與來賓的帳號邊界還不乾淨：`/signup` 是公開來賓註冊頁，但產品決策已改成「會員邀請制、來賓公開註冊分流」；同時 `/login` 仍對所有人顯示 Google / GitHub，讓來賓也可能走社群登入，與「Google / GitHub 只給會員帳號使用」的決策衝突。這會讓來賓、待審核會員與正式會員的入口混淆，增加身份衝突與錯誤導向風險。

## What Changes

- 新增 `member_invites` 資料表，儲存 admin 針對特定 email 產生的一次性邀請 token（含到期時間與使用記錄）。
- 將會員與來賓註冊入口分流：
  - `/signup` 僅供受邀會員使用
  - `/guest/register` 作為公開來賓註冊頁
  - `/auth/signup` 處理會員受邀註冊
  - `/auth/guest-signup` 處理來賓公開註冊
- `/signup` 頁面在無有效 token 時擋掉表單，不讓陌生人看到會員申請入口。
- Admin 後台新增「產生邀請連結」動作，可對指定 email 產生帶 token 的一次性連結。
- `/login` 的 Google / GitHub 明確標示為會員登入方式，不再讓來賓把社群登入當成 guest 入口。
- OAuth callback 新增身份守門：若社群登入解析到 `guest` 或 `pending_member`，系統 SHALL 阻擋並回到錯誤頁，而不是把社群登入導向 `/guest`。

## Non-Goals

- 不做批次邀請（CSV 匯入等）。
- 不實作 email 自動寄送（連結由 admin 手動複製後轉傳）。
- 不修改現有的 pending_member 審核升權邏輯。
- 不實作 guest 自助升會員；來賓升會員仍由後台升權處理。

## Capabilities

### New Capabilities

- `member-invite-token`：admin 對指定 email 產生一次性邀請 token；token 寫入 `member_invites` 表，帶 `expires_at` 與 `used_at`；`/signup?token=xxx` 驗證 token 有效性後才顯示表單；token 用完即標記，不可重複使用。

### Modified Capabilities

- `supabase-auth`：signup route 須先驗證 token 有效性（存在、未過期、未使用），通過後才建立 pending_member 帳號，並將 token 標記為已使用；guest signup 改走獨立 route，不再共用會員 signup；社群登入 SHALL 僅允許解析到正式會員 / 管理員身份，若解析到 `guest` 或 `pending_member` 則阻擋登入並要求改用 email/password 或 magic link。
- `self-service-account-approval`：會員自助申請場景新增前置條件：必須持有有效邀請 token，沒有 token 的訪客 SHALL 看到「無法申請」說明，而不是申請表單。

## Impact

- Affected specs: `member-invite-token`（新增）、`supabase-auth`（修改）、`self-service-account-approval`（修改）
- Affected code:
  - New: `supabase/migrations/20260604_create_member_invites.sql`
  - New: `app/actions/member-invite.ts`
  - New: `app/(guest)/guest/register/page.tsx`
  - New: `app/auth/guest-signup/route.ts`
  - Modified: `app/(auth)/signup/page.tsx`
  - Modified: `app/(auth)/login/page.tsx`
  - Modified: `app/auth/signup/route.ts`
  - Modified: `app/auth/callback/route.ts`
  - Modified: `app/(admin)/admin/members/page.tsx`
