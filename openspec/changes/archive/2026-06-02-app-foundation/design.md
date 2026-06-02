## 背景

Bniaiweb 是一個獨立的 Next.js 15 + Supabase 應用，服務 BNI 華AI分會（36 位會員）。目前 `app/` 目錄仍為空。資料庫 schema（`supabase/migrations/001_initial_schema.sql`）與 UI mockup（`ui-mockup-*.html`）都已完成。本 SR 的目標是建立可執行的應用骨架，供後續功能 SR 直接疊加。

## 目標 / 非目標

**目標：**
- 可運行的 Next.js 15 App Router，並具備 auth/member/admin/presentation 的 route groups
- 以 Supabase Auth 完成 Google OAuth 登入，並綁定 `members` table
- 以 middleware 在每次 request 執行 RBAC
- 建立可重用的 Supabase typed client（server + browser）
- Tailwind CSS 設計系統對齊 mockup（紅色 `#dc2626`、Noto Sans TC、白色主底）

**非目標：**
- 不做 dashboard、表單或資料抓取邏輯，只做 skeleton pages
- 不做 multi-chapter / multi-tenant 路由（schema 有 `chapter_id` 但本 SR 不使用）
- 不引入 supastarter

## 設計決策

### D1 — Route Group 結構

```
app/
  (auth)/
    login/          ← Google OAuth 入口 + callback
    error/          ← 非會員 email 的錯誤頁
  (member)/
    dashboard/      ← 會員首頁（placeholder）
  (admin)/
    admin/          ← 後台首頁（placeholder）
  presentation/
    [week-date]/    ← 公開投影片檢視（不需登入，canonical；同一路由支援 legacy id 轉址）
  layout.tsx        ← Root layout: fonts, globals.css
  globals.css       ← Tailwind base + design tokens
middleware.ts       ← RBAC 保護
```

### D2 — Supabase Auth（僅 Google OAuth）

登入方式只支援 Google OAuth，不做 email/password。OAuth callback 流程：
1. Supabase 建立或更新 `auth.users`
2. Server Action 以 email 查 `members`
3. 找到會員：綁定 `auth_uid`、寫入角色 cookie、依角色導向
4. 找不到會員：導向 `/error` 顯示「非分會會員」

角色來源為 `members.role`（`member` 或 `admin`）。角色會注入 Supabase session JWT custom claim，讓 middleware 不必每次都查 DB。

### D3 — RBAC Middleware

`middleware.ts` 套用在所有路由，排除 `/presentation/*`（公開）與 `/error`（公開）：

| 路徑樣式 | 需要角色 | 不符合時導向 |
|---|---|---|
| `/admin/*` | `admin` | `/dashboard` |
| `/dashboard/*` | `member` 或 `admin` | `/login` |
| `/login` | 未登入 | `/dashboard` |

### D4 — Supabase Client Pattern

- `lib/supabase/server.ts`：`createServerClient`（使用 `next/headers` 的 `cookies()`），給 Server Components / Server Actions
- `lib/supabase/client.ts`：`createBrowserClient`，給 Client Components
- `lib/supabase/types.ts`：由 schema 產生 `Database` 型別，提供 type-safe queries

### D5 — 設計 Tokens（Tailwind）

```
primary: #dc2626       (red-600)
primary-fg: #ffffff
surface: #ffffff
surface-2: #f9fafb     (gray-50)
border: #e5e7eb        (gray-200)
text-1: #111827        (gray-900)
text-2: #6b7280        (gray-500)
font: 'Noto Sans TC', sans-serif
radius: 8px (cards), 6px (inputs), 4px (badges)
```

## 實作契約

**行為：**
- 進入 `/login` 會看到單一按鈕「使用 Google 帳號登入」
- OAuth 完成後，member 導向 `/dashboard`、admin 導向 `/admin`
- 非會員 email 導向 `/error`，顯示幹部聯絡資訊
- member 直接進 `/admin` 會靜默導向 `/dashboard`
- 未登入存取受保護路由會導向 `/login`
- `/presentation/[week-date]` 可在未登入狀態直接讀取

**介面：**
- `createServerSupabase()` → `SupabaseClient<Database>`（server 端，支援 cookies）
- `createBrowserSupabase()` → `SupabaseClient<Database>`（client 端）
- `lib/supabase/types.ts` 的 `Database` 需覆蓋 `001_initial_schema.sql` 內所有核心表
- middleware 透過 `request.cookies.get('sb-role')` 判斷角色，不查 DB

**失敗模式：**
- Supabase 無法連線：由 Next.js error boundary 接住並顯示通用錯誤頁
- OAuth callback 收到未知 email：導向 `/error`，不拋例外
- 缺少必要 env vars：`next.config.ts` 在 build 時就丟錯並中止

**驗收標準：**
1. `npm run dev` 可正常啟動
2. 點擊「使用 Google 帳號登入」能完成 OAuth，並依角色正確導向
3. `members` 內 email 會進 `/dashboard`；未知 email 會進 `/error`
4. `member` 角色直接進 `/admin` 會被導向 `/dashboard`
5. `lib/supabase/types.ts` 具備 `members`、`weekly_briefs`、`guests`、`presentations` 等 typed tables

## 風險 / 取捨

- **JWT custom claims**：Supabase 需要額外 trigger 或 auth hook 把 `members.role` 注入 JWT，會新增一段 SQL；但可換取 middleware 每次請求都不查 DB，整體效能更好。
- **僅先做骨架**：後續 SR 都依賴此結構，route group 名稱在 SR-01 上線後不應隨意改動。
