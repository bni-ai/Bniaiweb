## 1. 專案初始化

- [ ] 1.1 Initialize Next.js 15 app with TypeScript and Tailwind in `Bniaiweb/app/` using `npx create-next-app@latest --typescript --tailwind --app --no-src-dir`; verify `app/layout.tsx` and `app/page.tsx` exist and `npm run dev` starts without error

- [ ] 1.2 Install Supabase SDK and auth helpers (`@supabase/supabase-js`, `@supabase/ssr`); verify `package.json` contains both packages and `npm install` succeeds

- [ ] 1.3 Configure `next.config.ts` with strict mode and image domain for Supabase Storage (`*.supabase.co`); verify `npm run build` completes with no warnings

## 2. 設計系統

- [ ] 2.1 Add CSS custom properties and Noto Sans TC to `app/globals.css` per the Tailwind Design Tokens requirement and **d5 — design tokens (tailwind)** in design.md; verify that a test page rendering `var(--primary)` shows `#dc2626` and the document font is Noto Sans TC (visible in DevTools Computed styles)

- [ ] 2.2 Create `components/ui/button.tsx` implementing `Button` component with `variant: 'primary' | 'secondary' | 'ghost'` per the Shared UI Primitives requirement; verify each variant applies correct bg/text/border styles by rendering `<Button variant="primary">`, `<Button variant="secondary">`, `<Button variant="ghost">` in a test page

- [ ] 2.3 Create `components/ui/card.tsx` implementing `Card` component per the Shared UI Primitives requirement; verify Card renders with `var(--radius-card)` corner radius and `1px solid var(--border)` border visible in DevTools

## 3. Route Group 結構

- [ ] 3.1 Create `app/(auth)/layout.tsx` with centered card layout (no sidebar, no nav) per the Route Group Structure requirement and **d1 — route group structure** in design.md; verify visiting `/login` renders the auth layout by confirming no sidebar element is present in DOM

- [ ] 3.2 Create `app/(auth)/login/page.tsx` with a "使用 Google 帳號登入" button (non-functional placeholder for now) inside the auth card layout; verify page renders without error at `npm run dev`

- [ ] 3.3 Create `app/(auth)/error/page.tsx` displaying "您尚未加入華AI分會" message, officer contact info placeholder, and a "返回登入頁" link per the Non-member email logs in scenario; verify static content renders at `/error`

- [ ] 3.4 Create `app/(member)/layout.tsx` with a top navigation bar per the Route Group Structure requirement; verify visiting `/dashboard` renders the member layout with nav visible in DOM

- [ ] 3.5 Create `app/(member)/dashboard/page.tsx` as a placeholder page showing "儀表板 (coming soon)"; verify it renders at `/dashboard` using the member layout

- [ ] 3.6 Create `app/(admin)/layout.tsx` with a left sidebar matching `ui-mockup-admin-v3.html` nav items per the Route Group Structure requirement; verify visiting `/admin` renders the admin layout with sidebar visible

- [ ] 3.7 Create `app/(admin)/admin/page.tsx` as a placeholder redirecting to `/admin/members`; verify `/admin` redirects correctly

- [ ] 3.8 Create `app/presentation/[id]/page.tsx` as a fullscreen placeholder (no nav chrome) per the Route Group Structure requirement; verify `/presentation/test` renders without any navigation elements in DOM

## 4. Supabase Client 工具

- [ ] 4.1 Create `lib/supabase/client.ts` exporting `createBrowserClient()` per the Supabase Client Utilities requirement and **d4 — supabase client pattern** in design.md; include startup validation that throws `"Missing Supabase env var: NEXT_PUBLIC_SUPABASE_URL"` if the env var is absent per the Environment Variable Validation requirement; verify the error message appears in CI when env var is unset

- [ ] 4.2 Create `lib/supabase/server.ts` exporting `createServerClient()` (using `@supabase/ssr` cookie store) per the Supabase Client Utilities requirement; verify a Server Component can call it and receive a Supabase client without TypeScript errors

## 5. 認證流程

- [ ] 5.1 Create Supabase Auth hook SQL function `custom_access_token_hook` in `supabase/migrations/002_auth_hook.sql` per the Role Injection into Session JWT requirement: queries `members` by `auth.uid()`, adds `app_role` claim to JWT; verify the migration applies cleanly with `supabase db push`

- [ ] 5.2 Enable the `custom_access_token_hook` in Supabase Dashboard → Auth → Hooks and configure Google OAuth provider (Client ID + Secret from Google Console); verify a test login returns a JWT containing `app_role` by decoding via `supabase.auth.getSession().data.session.access_token` at `jwt.io`

- [ ] 5.3 Create `app/(auth)/login/page.tsx` Google OAuth button wired to `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/auth/callback' } })` per the Google OAuth Login requirement and **d2 — supabase auth: google oauth only** in design.md; verify clicking the button redirects to Google consent screen

- [ ] 5.4 Create `app/auth/callback/route.ts` (Route Handler) that exchanges the OAuth code for a session and redirects: to `/admin` if `app_role='admin'`, to `/dashboard` if `app_role='member'`, to `/error` if email not found in `members` per the Existing member logs in and Non-member email logs in scenarios; verify each redirect path with three test accounts

- [ ] 5.5 Implement logout Server Action in `lib/actions/auth.ts` calling `supabase.auth.signOut()` and redirecting to `/login` per the Logout requirement; wire a logout button in `(admin)/layout.tsx` and `(member)/layout.tsx`; verify clicking logout clears the session cookie and lands on `/login`

## 6. RBAC Middleware

- [ ] 6.1 Create `middleware.ts` at project root implementing route access control table per the Route Access Control requirement and **d3 — rbac middleware** in design.md (admin→redirect dashboard, member visiting admin→redirect dashboard, unauthenticated→redirect login, authenticated visiting login→redirect by role, presentation routes→no-op); verify each scenario by manually navigating with different session states or using `next test` integration tests

- [ ] 6.2 Verify middleware reads only JWT claims with zero DB queries per the Middleware Performance requirement; confirm by adding a Supabase query counter spy test — middleware function SHALL invoke 0 Supabase client calls during a request lifecycle
