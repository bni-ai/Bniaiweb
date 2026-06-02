## 為什麼

Bniaiweb 目前已經有完整的資料庫 schema 與 UI mockup，但應用程式程式碼仍是 0。後續所有模組（後台、會員入口、簡報引擎）都依賴可運行的 Next.js 應用、Supabase Auth 與路由權限。先把基礎層建好，後續 SR 就能專注在功能邏輯，不必反覆重做登入、session、路由保護與 Supabase client。

## 要改什麼

- 在 `app/` 內建立 Next.js 15 App Router 基礎骨架，包含 `(auth)`、`(member)`、`(admin)`、`presentation` route groups
- 建立 Supabase browser/server client，串接既有 `.env.local` 變數
- 用 Supabase Auth 完成 Google OAuth 登入與登出
- 以 middleware 實作 RBAC：member 看 `(member)`、admin 看 `(admin)`、未登入看 `(auth)`
- 建立全域 Tailwind CSS 設計系統（對齊 mockup：白底、`#dc2626` 紅色點綴、Noto Sans TC）
- 套用 Supabase migration：`001_initial_schema.sql`（建立所有資料表）

## 不在本次範圍

- 不做功能頁（dashboard、表單、投影片）實作，只建立路由骨架與 placeholder
- 不引入 supastarter；維持純 Next.js 15 + Supabase
- 本 SR 不處理 billing、payment、multi-chapter routing

## 能力項目

### 新增能力

- `nextjs-app-scaffold`：建立 Next.js 15 App Router 專案骨架、route groups、共用 layout，並套用 mockup 對應 Tailwind design tokens
- `supabase-auth`：透過 Supabase Auth 完成 Google OAuth 登入/登出；session 存放於 HTTP-only cookies；`auth.uid()` 綁定 `members.id`
- `rbac-middleware`：Next.js middleware 依 `members.role` 做路由導向與存取保護
- `supabase-client-setup`：提供 server/browser Supabase clients（含 typed schema），並套用 `001_initial_schema.sql`

### 調整能力

（無）

## 影響範圍

- 影響 specs：nextjs-app-scaffold、supabase-auth、rbac-middleware、supabase-client-setup
- 影響程式碼：
  - New: `app/(auth)/login/page.tsx`
  - New: `app/(auth)/login/actions.ts`
  - New: `app/(auth)/error/page.tsx`
  - New: `app/(member)/dashboard/page.tsx`
  - New: `app/(admin)/admin/page.tsx`
  - New: `app/presentation/[week-date]/page.tsx`（同一路由處理 legacy id alias 轉址）
  - New: `app/layout.tsx`
  - New: `app/globals.css`
  - New: `middleware.ts`
  - New: `lib/supabase/server.ts`
  - New: `lib/supabase/client.ts`
  - New: `lib/supabase/types.ts`
  - New: `components/ui/button.tsx`
  - New: `components/ui/card.tsx`
  - New: `next.config.ts`
  - New: `tailwind.config.ts`
  - New: `package.json`
  - Modified: `supabase/migrations/001_initial_schema.sql`
