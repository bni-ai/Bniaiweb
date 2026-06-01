## Context

Bniaiweb is a standalone Next.js 15 + Supabase application for BNI 華AI分會 (36 members). The `app/` directory is currently empty. The database schema (`supabase/migrations/001_initial_schema.sql`) and UI mockups (`ui-mockup-*.html`) are complete. This SR establishes the runnable application skeleton that all feature SRs build on.

## Goals / Non-Goals

**Goals:**
- Working Next.js 15 App Router with correct route groups for auth, member, admin, and presentation surfaces
- Google OAuth login via Supabase Auth bound to the `members` table
- RBAC middleware that enforces role access on every request
- Supabase typed client (server + browser) ready for use in all subsequent SRs
- Tailwind CSS design system matching the mockup (red `#dc2626` accent, Noto Sans TC, white base)

**Non-Goals:**
- No feature dashboards, forms, or data-fetching logic — skeleton pages only
- No multi-chapter/multi-tenant routing (chapter_id is in schema but not routed yet)
- No supastarter dependency

## Decisions

### D1 — Route Group Structure

```
app/
  (auth)/
    login/          ← Google OAuth trigger + callback
    error/          ← Non-member email error page
  (member)/
    dashboard/      ← Member home (placeholder)
  (admin)/
    admin/          ← Admin home (placeholder)
  presentation/
    [id]/           ← Public slide viewer (no auth required)
  layout.tsx        ← Root layout: fonts, globals.css
  globals.css       ← Tailwind base + design tokens
middleware.ts       ← RBAC guard
```

### D2 — Supabase Auth: Google OAuth Only

Auth is Google OAuth only — no email/password. On OAuth callback:
1. Supabase creates/updates `auth.users` entry
2. Server Action looks up `members` table by email
3. If found: bind `auth_uid` to member record, set cookie with role, redirect by role
4. If not found: redirect to `/error` with "not a member" message

Role is read from `members.role` (values: `'member'` or `'admin'`). Role is stored in the Supabase session JWT custom claim so middleware can read it without a DB round-trip on every request.

### D3 — RBAC Middleware

`middleware.ts` runs on all routes except `/presentation/*` (public) and `/error` (public):

| Path pattern | Required role | Fallback |
|---|---|---|
| `/admin/*` | `admin` | redirect `/dashboard` |
| `/dashboard/*` | `member` or `admin` | redirect `/login` |
| `/login` | unauthenticated | redirect `/dashboard` |

### D4 — Supabase Client Pattern

- `lib/supabase/server.ts`: `createServerClient` using `cookies()` from `next/headers` — for Server Components and Server Actions
- `lib/supabase/client.ts`: `createBrowserClient` — for Client Components
- `lib/supabase/types.ts`: Generated `Database` type from schema for type-safe queries

### D5 — Design Tokens (Tailwind)

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

## Implementation Contract

**Behavior:**
- Visiting `/login` renders a page with a single "使用 Google 帳號登入" button
- After OAuth, authenticated members land on `/dashboard` (member) or `/admin` (admin)
- Non-member emails see `/error` with officer contact info
- Visiting `/admin` as a member redirects silently to `/dashboard`
- Visiting any protected route unauthenticated redirects to `/login`
- `/presentation/[id]` loads without authentication

**Interface:**
- `createServerSupabase()` → `SupabaseClient<Database>` (server-side, cookies-aware)
- `createBrowserSupabase()` → `SupabaseClient<Database>` (client-side)
- `Database` type in `lib/supabase/types.ts` covers all tables in `001_initial_schema.sql`
- Middleware reads `request.cookies.get('sb-role')` to determine role without DB query

**Failure modes:**
- Supabase unreachable: Next.js error boundary catches, shows generic error page
- OAuth callback with unknown email: renders `/error`, no exception thrown
- Missing env vars: `next.config.ts` validates required vars at build time and throws

**Acceptance criteria:**
1. `npm run dev` starts without errors
2. Clicking "使用 Google 帳號登入" completes OAuth and redirects correctly by role
3. A `members`-table email authenticates to `/dashboard`; an unknown email goes to `/error`
4. Direct navigation to `/admin` by a `member`-role session redirects to `/dashboard`
5. `lib/supabase/types.ts` has typed `members`, `weekly_briefs`, `guests`, `presentations` tables

## Risks / Trade-offs

- **JWT custom claims**: Supabase requires a database trigger or auth hook to inject `members.role` into the JWT. This adds one SQL trigger to the migration but removes a DB call from every middleware execution — worth it.
- **`app/` scaffold only**: Subsequent SRs depend on this structure being stable. Route group names must not change after SR-01 ships.
