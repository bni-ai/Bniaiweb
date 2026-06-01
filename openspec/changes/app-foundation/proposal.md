## Why

The Bniaiweb project has a complete database schema and UI mockups but zero application code. Every other module (admin backend, member portal, presentation engine) depends on a working Next.js app with Supabase Auth and routing in place. Building this foundation first means all subsequent SRs can focus on feature logic without revisiting auth, session handling, route guards, or Supabase client setup.

## What Changes

- Next.js 15 App Router scaffolding inside `app/` with route groups `(auth)`, `(member)`, `(admin)`, and `presentation`
- Supabase browser and server clients wired to existing `.env.local` variables
- Google OAuth login/logout via Supabase Auth
- Middleware enforcing RBAC: members see `(member)`, admins see `(admin)`, unauthenticated see `(auth)`
- Global Tailwind CSS design system (tokens matching mockup: white bg, `#dc2626` red accent, Noto Sans TC)
- Supabase migration applied: `001_initial_schema.sql` creates all tables

## Non-Goals

- No feature pages (dashboards, forms, slides) — only skeleton route files with placeholder content
- No supastarter dependency; standalone Next.js 15 + Supabase only
- No billing, payments, or multi-chapter routing in this SR

## Capabilities

### New Capabilities

- `nextjs-app-scaffold`: Next.js 15 App Router project with route groups, shared layouts, and Tailwind CSS design tokens from the mockup
- `supabase-auth`: Google OAuth login/logout using Supabase Auth; session stored in HTTP-only cookies; `auth.uid()` bound to `members.id`
- `rbac-middleware`: Next.js middleware that reads session role from `members.role` and redirects unauthenticated or unauthorized requests
- `supabase-client-setup`: Server and browser Supabase clients with typed database schema; migration `001_initial_schema.sql` applied to Supabase project

### Modified Capabilities

(none)

## Impact

- Affected specs: nextjs-app-scaffold, supabase-auth, rbac-middleware, supabase-client-setup
- Affected code:
  - New: `app/(auth)/login/page.tsx`
  - New: `app/(auth)/login/actions.ts`
  - New: `app/(auth)/error/page.tsx`
  - New: `app/(member)/dashboard/page.tsx`
  - New: `app/(admin)/admin/page.tsx`
  - New: `app/presentation/[id]/page.tsx`
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
