# 來賓自助註冊功能規劃
版本：v1.0 | 更新：2026-06-04

---

## 功能概述

來賓可透過管理員發出的邀請連結（或公開連結）自助填表註冊，系統建立 Supabase auth 帳號並寫入 `guests` 表，狀態設為 `pending_guest`；管理員在 `/admin/guests` 審核後啟用帳號，來賓收到確認信並可進入 `/guest` portal。

---

## 用戶流程（User Journey）

```
[管理員] 產生邀請連結
    │
    ▼
[來賓] 收到連結 → /signup?inviteToken=<token>
    │
    ▼
[來賓] 填表（姓名、Email、電話、推薦人、公司）
    │
    ▼
[系統] supabase.auth.signUp() 建立 auth.users
       guests 表寫入（status = 'pending_guest'）
       設 sb-role = 'pending_guest' cookie
    │
    ▼
[來賓] 看到「申請已送出，等候審核」畫面
       ─ 驗證 email（可選）──────────────────────────┐
    │                                               │
    ▼                                               ▼
[管理員] /admin/guests → 「待審核」列表        [來賓信箱] 收到驗證信
    │
    ▼
[管理員] 點擊「核准」
       guests.status 更新為 'active'
       sb-role cookie 不變（登入時重新走 identity 解析）
       寄送「帳號已啟用」通知信
    │
    ▼
[來賓] 重新登入 → identity hook 解析 → sb-role='guest' → /guest portal
```

---

## 技術設計

### 新增路由

| 路由 | 類型 | 說明 |
|------|------|------|
| `app/(auth)/signup/page.tsx` | Client Component | **現有**，需加入 `inviteToken` query param 支援並調整送出後顯示「等候審核」而非直接跳轉 |
| `app/auth/signup/route.ts` | Route Handler | **現有**，需改寫：加 `status='pending_guest'`，不再立即設 `sb-role='guest'` |
| `app/(auth)/signup/pending/page.tsx` | Server Component | **新增**：「申請已送出，等候管理員審核」靜態頁面 |
| `app/api/admin/guests/[id]/approve/route.ts` | Route Handler | **新增**：管理員核准 API，PUT/POST，更新 `guests.status` 並觸發通知信 |
| `app/api/admin/guests/[id]/reject/route.ts` | Route Handler | **新增**：管理員拒絕 API，更新狀態、寄通知 |
| `app/api/admin/invitations/route.ts` | Route Handler | **新增**：產生一次性邀請 token，寫入 `guest_invitations` 表 |

### 資料庫改動

**1. `guests` 表新增欄位**

```sql
-- Migration 012_guest_self_registration.sql
ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
    CHECK (status IN (
      'pending_guest',   -- 自助申請，等候審核
      'active',          -- 已啟用（管理員核准或原有資料）
      'rejected'         -- 已拒絕
    )),
  ADD COLUMN IF NOT EXISTS auth_uid uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS registration_note text,       -- 申請者填的備注
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES members(id),
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- 現有由管理員手動建立的 guests 預設為 active，不影響現有資料
UPDATE guests SET status = 'active' WHERE status IS NULL;
```

**2. 新增 `guest_invitations` 表**

```sql
CREATE TABLE guest_invitations (
  id            uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id    uuid  NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  token         text  NOT NULL UNIQUE,
  created_by    uuid  REFERENCES members(id),
  used_by       uuid  REFERENCES guests(id),
  expires_at    timestamptz NOT NULL DEFAULT now() + interval '7 days',
  single_use    boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX guest_invitations_token_idx ON guest_invitations(token)
  WHERE used_by IS NULL AND expires_at > now();
```

### Auth 流程

**現有問題：** `app/auth/signup/route.ts` 目前建立 guest 後直接設 `sb-role='guest'`，沒有等候審核機制。

**改動後流程：**

1. `POST /auth/signup` 建立 `auth.users` + 寫入 `guests`（`status='pending_guest'`）
2. 回傳 `{ redirectTo: "/signup/pending" }` 而非 `/guest`
3. **不設** `sb-role` cookie（或設為 `pending_guest`），middleware 已有此 role 定義
4. 管理員核准後 `guests.status = 'active'`
5. 來賓下次登入走 `resolveAuthIdentityByEmail`：

```
identity hook 現有邏輯：
  members 表找到 → 給 member/admin role
  guests 表找到  → isGuest = true → role = 'guest'

改動：guests 表找到後額外確認 status
  status = 'pending_guest' → role = 'pending_guest' → redirectTo = '/signup/pending'
  status = 'active'        → role = 'guest' → redirectTo = '/guest'
  status = 'rejected'      → redirectTo = '/error?reason=registration-rejected'
```

**具體需改的檔案：**
- `lib/auth/identity.ts`：`resolveAuthIdentityByEmail` 加入 `guests.status` 查詢
- `lib/access-control.ts`：`resolveAuthDestination` 加入 `pending_guest` guest 路徑
- `app/auth/signup/route.ts`：不設 `sb-role='guest'`，改設 `pending_guest` 或不設

---

## 從 supastarter 可以借用的代碼

### 直接借用（幾乎不改）

| supastarter 來源 | 借用到 | 說明 |
|-----------------|--------|------|
| `apps/saas/app/(unauthenticated)/signup/page.tsx` | `app/(auth)/signup/page.tsx` | `invitationId` → `inviteToken` query param 解析邏輯；token 有效性驗證前置判斷 |
| `getInvitation(invitationId)` 模式 | `lib/actions/guest-invitations.ts` | token 查表、驗過期、驗 single_use 的模式直接複製 |

### 需要改寫（邏輯相同，欄位不同）

| supastarter 來源 | 借用邏輯 | 需改的地方 |
|-----------------|----------|-----------|
| `SignupForm.tsx` | 表單送出後顯示「等候審核」的 pending state UI | supastarter 沒有審核流程，這段需自寫；表單欄位從 email/password 改為本系統的 name/email/password/phone/company/referrer |
| invitation table schema | `guest_invitations` 表設計 | supastarter 用 org invitation，本系統用 chapter + single_use token |

### 不能直接用（架構差異太大）

- supastarter 的 `config.enableSignup` 旗標機制：本系統不需要全域開關，以邀請 token 控制
- supastarter 的多語言 `getTranslations`：本系統純繁中文，不引入 next-intl
- supastarter 的 org/team 概念：本系統對應 `chapter_id`

---

## 管理員審核界面

`/admin/guests` 頁面現有功能：按週顯示來賓、登入 readiness 統計。

**需新增：**

**1. 「待審核」分頁 tab**

```
[ 本週來賓 ] [ 下週來賓 ] [ 待審核申請 (3) ]
```

- 列出所有 `guests.status = 'pending_guest'` 的記錄
- 欄位：姓名、Email、電話、公司、推薦人、申請時間
- 操作按鈕：「核准」「拒絕」（各觸發對應 API）

**2. 來賓卡片加入狀態標籤**

現有卡片只顯示「可登入 / 缺 email」，改為顯示：
- `pending_guest`：顯示「待審核」badge（橘色）
- `active`：維持原本「可登入」邏輯
- `rejected`：顯示「已拒絕」badge（紅色）

**3. 核准 / 拒絕 Server Action**

```typescript
// lib/actions/guests.ts 新增
export async function approveGuestRegistration(guestId: string) {
  // 1. UPDATE guests SET status='active', reviewed_by=..., reviewed_at=now()
  // 2. 寄送啟用通知 email（用 Supabase Edge Function 或 resend）
  revalidatePath("/admin/guests");
}

export async function rejectGuestRegistration(guestId: string, reason?: string) {
  // 1. UPDATE guests SET status='rejected', registration_note=reason
  // 2. 寄送拒絕通知 email（可選）
  revalidatePath("/admin/guests");
}
```

---

## 實作任務清單

> 可直接貼入 Spectra change 的 tasks.md

### Wave 1 — 資料庫與 Auth 核心

- [ ] 寫 `supabase/migrations/012_guest_self_registration.sql`：`guests` 表加欄位 + `guest_invitations` 表
- [ ] 改 `lib/auth/identity.ts`：`resolveAuthIdentityByEmail` 加 `guests.status` 判斷
- [ ] 改 `lib/access-control.ts`：`resolveAuthDestination` 的 `isGuest` 分支加 status 路由邏輯
- [ ] 改 `app/auth/signup/route.ts`：`status='pending_guest'`，回傳 `redirectTo: '/signup/pending'`

### Wave 2 — 邀請 token 機制

- [ ] 新增 `lib/actions/guest-invitations.ts`：`createGuestInvitation()`、`validateGuestInvitationToken()`
- [ ] 新增 `app/api/admin/invitations/route.ts`：POST 產生 token，需 admin role
- [ ] 改 `app/(auth)/signup/page.tsx`：讀 `inviteToken` query param，呼叫 `validateGuestInvitationToken`，無效則顯示錯誤

### Wave 3 — 前端頁面

- [ ] 新增 `app/(auth)/signup/pending/page.tsx`：「申請已送出」靜態頁面，提示 24hr 內審核
- [ ] 改 `app/(auth)/signup/page.tsx`：送出後改 redirect 到 `/signup/pending`
- [ ] 改 `app/(auth)/error/page.tsx`（或新增 reason）：處理 `registration-rejected` reason

### Wave 4 — 管理員審核界面

- [ ] 改 `lib/actions/guests.ts`：新增 `getPendingGuestRegistrations()`、`approveGuestRegistration()`、`rejectGuestRegistration()`
- [ ] 新增 `app/api/admin/guests/[id]/approve/route.ts`
- [ ] 新增 `app/api/admin/guests/[id]/reject/route.ts`
- [ ] 改 `app/(admin)/admin/guests/page.tsx`：新增「待審核」tab、來賓卡片加狀態 badge

### Wave 5 — 通知 Email（可後做）

- [ ] 審核通過後寄啟用通知（用 Supabase Auth email template 或 resend）
- [ ] 拒絕後寄通知（可選）
- [ ] 管理員有新申請時通知（可選，webhook 或 cron）

---

## 與 SaaS 化的關係

**目前架構：** 單一分會（`chapters` 表只有一筆）。

**多租戶擴展方向：**

| 設計決策 | 說明 |
|---------|------|
| `guest_invitations.chapter_id` | 邀請 token 綁定 chapter，多分會各自隔離 |
| `guests.chapter_id` | 現有設計已有，自助申請時從 token 繼承 chapter_id |
| 管理員審核範圍 | 目前 admin 無 chapter 過濾；SaaS 化後改為 `WHERE chapter_id = admin.chapter_id` |
| 公開邀請連結 vs 一對一邀請 | `guest_invitations.single_use` 欄位支援兩種模式：`false` = 公開連結（一個 token 多人用），`true` = 一次性 |
| 邀請 token URL 格式 | `/signup?inviteToken=<uuid>` — 不含 chapter slug，多分會時可改為 `/<chapter_slug>/signup?t=<token>` |

**SaaS 化前不需要改的地方：** 所有核心邏輯（auth、guests 表、審核 API）都已用 `chapter_id` 隔離，分會擴充時只需要在 admin 查詢層加過濾條件即可。
