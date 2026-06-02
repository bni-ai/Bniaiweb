## 1. 專案初始化

- [x] 1.1 在 `Bniaiweb/app/` 用 `npx create-next-app@latest --typescript --tailwind --app --no-src-dir` 初始化 Next.js 15（TypeScript + Tailwind）；驗證 `app/layout.tsx`、`app/page.tsx` 已建立，且 `npm run dev` 可無錯啟動

- [x] 1.2 安裝 Supabase SDK 與 auth helpers（`@supabase/supabase-js`、`@supabase/ssr`）；驗證 `package.json` 含兩個套件且 `npm install` 成功

- [x] 1.3 設定 `next.config.ts`：開啟 strict mode，並加入 Supabase Storage 圖片網域（`*.supabase.co`）；驗證 `npm run build` 無警告完成

## 2. 設計系統

- [x] 2.1 在 `app/globals.css` 加入 CSS custom properties 與 Noto Sans TC（對齊 Tailwind Design Tokens 與 design.md 的 **d5 — 設計 tokens（tailwind）**）；驗證測試頁渲染 `var(--primary)` 會顯示 `#dc2626`，且文件字型在 DevTools Computed styles 顯示為 Noto Sans TC

- [x] 2.2 建立 `components/ui/button.tsx` 的 `Button` 元件，支援 `variant: 'primary' | 'secondary' | 'ghost'`（對齊 Shared UI Primitives）；驗證測試頁渲染 `<Button variant="primary">`、`<Button variant="secondary">`、`<Button variant="ghost">` 時，背景/文字/邊框樣式正確

- [x] 2.3 建立 `components/ui/card.tsx` 的 `Card` 元件（對齊 Shared UI Primitives）；驗證 Card 在 DevTools 可見 `var(--radius-card)` 圓角與 `1px solid var(--border)` 邊框

## 3. Route Group 結構

- [x] 3.1 建立 `app/(auth)/layout.tsx`，採置中卡片版型（無 sidebar、無 nav），對齊 Route Group Structure 與 design.md 的 **d1 — route group 結構**；驗證進入 `/login` 時 DOM 不存在 sidebar 元素

- [x] 3.2 建立 `app/(auth)/login/page.tsx`，在 auth card 內放置「使用 Google 帳號登入」按鈕（先做非功能 placeholder）；驗證 `npm run dev` 下頁面可正常渲染

- [x] 3.3 建立 `app/(auth)/error/page.tsx`，顯示「您尚未加入華AI分會」、幹部聯絡資訊 placeholder 與「返回登入頁」連結（對齊 Non-member email logs in 情境）；驗證 `/error` 靜態內容顯示正確

- [x] 3.4 建立 `app/(member)/layout.tsx`，提供頂部導覽列（對齊 Route Group Structure）；驗證進入 `/dashboard` 時 DOM 可見 nav

- [x] 3.5 建立 `app/(member)/dashboard/page.tsx` placeholder，顯示「儀表板（coming soon）」；驗證 `/dashboard` 可透過 member layout 正常顯示

- [x] 3.6 建立 `app/(admin)/layout.tsx`，左側 sidebar 導覽項目對齊 `ui-mockup-admin-v3.html`；驗證進入 `/admin` 時可見 sidebar

- [x] 3.7 建立 `app/(admin)/admin/page.tsx` placeholder，導向 `/admin/members`；驗證 `/admin` 導向正確

- [x] 3.8 建立 `app/presentation/[week-date]/page.tsx` 全螢幕 placeholder（無 nav chrome），對齊 Route Group Structure；驗證 `/presentation/2026-06-07` DOM 不含任何導覽元素

- [x] 3.9 在 `app/presentation/[week-date]/page.tsx` 內支援相容轉址（非日期參數視為 legacy id，lookup 後導向 `/presentation/[week-date]`）；驗證舊 ID 連結可正確到 canonical 路由

## 4. Supabase Client 工具

- [x] 4.1 建立 `lib/supabase/client.ts`，匯出 `createBrowserClient()`（對齊 Supabase Client Utilities 與 design.md 的 **d4 — supabase client pattern**）；並實作 **Environment Variable Validation**：若缺少 env var 則拋出 `"Missing Supabase env var: NEXT_PUBLIC_SUPABASE_URL"`；驗證在未設定 env var 的 CI 可看到對應錯誤訊息

- [x] 4.2 建立 `lib/supabase/server.ts`，匯出 `createServerClient()`（使用 `@supabase/ssr` cookie store）；驗證 Server Component 可呼叫且取得 Supabase client，TypeScript 無錯

## 5. 認證流程

- [x] 5.1 在 `supabase/migrations/002_auth_hook.sql` 建立 Supabase Auth hook SQL function `custom_access_token_hook`（對齊 Role Injection into Session JWT）：以 `auth.uid()` 查 `members`，將 `app_role` 加入 JWT；驗證 `supabase db push` migration 可順利套用

- [x] 5.2 在 Supabase Dashboard → Auth → Hooks 啟用 `custom_access_token_hook`，並設定 Google OAuth provider（Google Console 的 Client ID + Secret）；驗證測試登入後，以 `supabase.auth.getSession().data.session.access_token` 取 token 並在 `jwt.io` 解碼可看到 `app_role`（已透過 Supabase CLI/Management config 推送，OAuth authorize 302 導向 Google；臨時 Auth 使用者登入後 JWT 解碼得到 `app_role=member` 並已刪除測試使用者）

- [x] 5.3 在 `app/(auth)/login/page.tsx` 實作 Google OAuth 按鈕，呼叫 `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/auth/callback' } })`（對齊 Google OAuth Login 與 design.md 的 **d2 — supabase auth（僅 google oauth）**）；驗證點擊後會導向 Google 同意頁

- [x] 5.4 建立 `app/auth/callback/route.ts`（Route Handler）：兌換 OAuth code 後依角色導向（`app_role='admin'` → `/admin`、`app_role='member'` → `/dashboard`、`members` 查無 email → `/error`，對齊 Existing member logs in / Non-member email logs in）；驗證三種帳號路徑導向皆正確

- [x] 5.5 在 `lib/actions/auth.ts` 實作 logout Server Action（呼叫 `supabase.auth.signOut()` 並導向 `/login`），並在 `(admin)/layout.tsx`、`(member)/layout.tsx` 接上登出按鈕；驗證點擊後 session cookie 被清除並回到 `/login`

## 6. RBAC Middleware

- [x] 6.1 在專案根目錄建立 `middleware.ts`，依 Route Access Control 規格與 design.md 的 **d3 — rbac middleware** 實作路由存取表（admin 存取限制、member 存取 admin 時導向 dashboard、未登入導向 login、已登入進 login 時依角色導向、presentation 路由不處理）；驗證各情境可透過手動導頁或 `next test` 整合測試通過

- [x] 6.2 驗證 middleware 僅讀 JWT claims、零 DB 查詢（對齊 Middleware Performance）；以 Supabase query counter spy test 確認 middleware 在單次 request lifecycle 內對 Supabase client 呼叫次數為 0（`lib/auth/access-control.test.ts`）。
