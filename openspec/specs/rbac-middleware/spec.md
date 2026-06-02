# rbac-middleware Specification

## Purpose

TBD - created by archiving change 'app-foundation'. Update Purpose after archive.

## Requirements

### Requirement: Route Access Control

The Next.js `middleware.ts` SHALL enforce role-based access on every request using the JWT `app_role` claim. The middleware SHALL run on all routes except `/presentation/*`, `/error`, and `/_next/*`.

| Path pattern | Minimum role | Redirect when unauthorized |
|---|---|---|
| `/admin` and `/admin/*` | `admin` | `/dashboard` |
| `/dashboard` and `/dashboard/*` | `member` or `admin` | `/login` |
| `/login` | unauthenticated only | `/dashboard` (member) or `/admin` (admin) |

#### Scenario: Unauthenticated user visits dashboard

- **WHEN** a request with no valid session cookie matches `/dashboard`
- **THEN** the middleware SHALL redirect to `/login`

#### Scenario: Member-role user visits admin

- **WHEN** a request with `app_role: 'member'` in the JWT matches `/admin`
- **THEN** the middleware SHALL redirect to `/dashboard`

#### Scenario: Admin-role user visits login

- **WHEN** a request with `app_role: 'admin'` in the JWT matches `/login`
- **THEN** the middleware SHALL redirect to `/admin`

#### Scenario: Presentation route is public

- **WHEN** a request matches `/presentation/2026-06-07` with no session cookie
- **THEN** the middleware SHALL allow the request through without redirection


<!-- @trace
source: app-foundation
updated: 2026-06-02
code:
  - supabase/migrations/005_guest_portal.sql
  - eslint.config.mjs
  - .github/prompts/spectra-ingest.prompt.md
  - .github/skills/spectra-ask/SKILL.md
  - app/(admin)/admin/submission/page.tsx
  - supabase/migrations/003_admin_backend_patch.sql
  - .github/skills/spectra-debug/SKILL.md
  - app/(admin)/admin/guests/guest-visit-form.tsx
  - lib/actions/member-portal.ts
  - app/(guest)/guest/prepare/page.tsx
  - components/ui/card.tsx
  - app/(admin)/admin/keynote/page.tsx
  - lib/actions/keynote.ts
  - ui-mockup-member-v3.html
  - app/(marketing)/page.tsx
  - .github/prompts/spectra-drift.prompt.md
  - .opencode/skills/spectra-discuss/SKILL.md
  - supabase/migrations/004_chapter_week_locks.sql
  - app/(auth)/layout.tsx
  - app/(admin)/admin/weekly-briefs/page.tsx
  - app/(member)/dashboard/report/page.tsx
  - app/(member)/dashboard/directory/page.tsx
  - app/(member)/layout.tsx
  - lib/actions/presentations.ts
  - app/(admin)/admin/members/page.tsx
  - app/(admin)/admin/awards/page.tsx
  - public/vercel.svg
  - app/globals.css
  - app/auth/email-link/route.ts
  - lib/actions/vp-report.ts
  - .opencode/commands/spectra-debug.md
  - app/presentation/[week-date]/page.tsx
  - .github/skills/spectra-archive/SKILL.md
  - .opencode/skills/spectra-archive/SKILL.md
  - .opencode/skills/spectra-drift/SKILL.md
  - .opencode/skills/spectra-ingest/SKILL.md
  - SR_EXECUTION_OBJECTIVE.md
  - middleware.ts
  - components/landing/stats.tsx
  - components/landing/cta.tsx
  - .opencode/skills/spectra-apply/SKILL.md
  - app/favicon.ico
  - .cursorrules
  - lib/access-control.ts
  - app/layout.tsx
  - .github/prompts/spectra-debug.prompt.md
  - .github/skills/spectra-propose/SKILL.md
  - .github/skills/spectra-apply/SKILL.md
  - AGENTS.md
  - vitest.config.ts
  - .github/skills/spectra-ingest/SKILL.md
  - app/(guest)/guest/page.tsx
  - .spectra.yaml
  - app/(member)/dashboard/page.tsx
  - .github/skills/spectra-audit/SKILL.md
  - app/(member)/dashboard/weekly/page.tsx
  - app/(admin)/admin/guests/create/route.ts
  - public/next.svg
  - tsconfig.json
  - components/landing/hero.tsx
  - app/auth/callback/route.ts
  - GEMINI.md
  - README.md
  - app/(admin)/admin/vp-report/page.tsx
  - app/(admin)/layout.tsx
  - .opencode/skills/spectra-debug/SKILL.md
  - lib/guest-portal.ts
  - lib/supabase/types.ts
  - lib/member-portal-policy.ts
  - app/(auth)/login/page.tsx
  - .github/prompts/spectra-propose.prompt.md
  - .opencode/skills/spectra-audit/SKILL.md
  - postcss.config.mjs
  - .opencode/commands/spectra-ingest.md
  - .github/skills/spectra-drift/SKILL.md
  - playwright.config.ts
  - .github/prompts/spectra-ask.prompt.md
  - components/ui/button.tsx
  - app/(admin)/admin/guests/page.tsx
  - lib/supabase/client.ts
  - public/window.svg
  - supabase/config.toml
  - app/(admin)/admin/page.tsx
  - app/(auth)/error/page.tsx
  - lib/auth/access-control.ts
  - .github/skills/spectra-commit/SKILL.md
  - .opencode/skills/spectra-ask/SKILL.md
  - PHASE_A_VERIFICATION.md
  - package.json
  - SR_ALIGNMENT_PATCH.md
  - lib/supabase/server.ts
  - .github/prompts/spectra-archive.prompt.md
  - lib/actions/auth.ts
  - .opencode/commands/spectra-archive.md
  - app/(admin)/admin/vp-report/vp-report-form.tsx
  - app/(admin)/admin/presentations/[id]/page.tsx
  - lib/admin-workflows.ts
  - components/landing/features.tsx
  - app/(guest)/layout.tsx
  - .opencode/commands/spectra-commit.md
  - next.config.ts
  - .opencode/commands/spectra-apply.md
  - app/(admin)/admin/presentation/page.tsx
  - .github/prompts/spectra-audit.prompt.md
  - .github/skills/spectra-discuss/SKILL.md
  - .opencode/commands/spectra-propose.md
  - .github/prompts/spectra-apply.prompt.md
  - .github/prompts/spectra-commit.prompt.md
  - lib/actions/admin-common.ts
  - .opencode/skills/spectra-propose/SKILL.md
  - app/(admin)/admin/presentations/page.tsx
  - app/(guest)/guest/members/page.tsx
  - app/(member)/dashboard/brief/page.tsx
  - .opencode/commands/spectra-ask.md
  - .opencode/commands/spectra-drift.md
  - .opencode/commands/spectra-discuss.md
  - app/(guest)/guest/content/page.tsx
  - CLAUDE.md
  - lib/actions/guests.ts
  - lib/actions/weekly-briefs.ts
  - .opencode/commands/spectra-audit.md
  - public/globe.svg
  - .github/prompts/spectra-discuss.prompt.md
  - public/file.svg
  - lib/actions/guest-portal.ts
  - .opencode/skills/spectra-commit/SKILL.md
  - supabase/migrations/002_auth_hook.sql
  - lib/actions/awards.ts
  - app/(marketing)/layout.tsx
tests:
  - lib/access-control.test.ts
  - e2e/admin-member.spec.ts
  - lib/admin-workflows.test.ts
  - lib/member-portal-policy.test.ts
  - lib/auth/access-control.test.ts
  - lib/guest-portal.test.ts
-->

---
### Requirement: Middleware Performance

The middleware SHALL read role from the session JWT without making any database queries. The JWT `app_role` claim (injected at login by the Auth hook) is the sole source of role truth in the middleware.

#### Scenario: No DB call in middleware

- **WHEN** middleware evaluates an incoming request
- **THEN** no Supabase database queries SHALL be made; only JWT decoding is performed

##### Example: Member request to dashboard with JWT claim

- **GIVEN** request path `/dashboard`, cookie `sb-access-token=<jwt(app_role='member')>`
- **WHEN** middleware decodes JWT and checks access rule
- **THEN** middleware returns `NextResponse.next()` and query count remains `0`

<!-- @trace
source: app-foundation
updated: 2026-06-02
code:
  - supabase/migrations/005_guest_portal.sql
  - eslint.config.mjs
  - .github/prompts/spectra-ingest.prompt.md
  - .github/skills/spectra-ask/SKILL.md
  - app/(admin)/admin/submission/page.tsx
  - supabase/migrations/003_admin_backend_patch.sql
  - .github/skills/spectra-debug/SKILL.md
  - app/(admin)/admin/guests/guest-visit-form.tsx
  - lib/actions/member-portal.ts
  - app/(guest)/guest/prepare/page.tsx
  - components/ui/card.tsx
  - app/(admin)/admin/keynote/page.tsx
  - lib/actions/keynote.ts
  - ui-mockup-member-v3.html
  - app/(marketing)/page.tsx
  - .github/prompts/spectra-drift.prompt.md
  - .opencode/skills/spectra-discuss/SKILL.md
  - supabase/migrations/004_chapter_week_locks.sql
  - app/(auth)/layout.tsx
  - app/(admin)/admin/weekly-briefs/page.tsx
  - app/(member)/dashboard/report/page.tsx
  - app/(member)/dashboard/directory/page.tsx
  - app/(member)/layout.tsx
  - lib/actions/presentations.ts
  - app/(admin)/admin/members/page.tsx
  - app/(admin)/admin/awards/page.tsx
  - public/vercel.svg
  - app/globals.css
  - app/auth/email-link/route.ts
  - lib/actions/vp-report.ts
  - .opencode/commands/spectra-debug.md
  - app/presentation/[week-date]/page.tsx
  - .github/skills/spectra-archive/SKILL.md
  - .opencode/skills/spectra-archive/SKILL.md
  - .opencode/skills/spectra-drift/SKILL.md
  - .opencode/skills/spectra-ingest/SKILL.md
  - SR_EXECUTION_OBJECTIVE.md
  - middleware.ts
  - components/landing/stats.tsx
  - components/landing/cta.tsx
  - .opencode/skills/spectra-apply/SKILL.md
  - app/favicon.ico
  - .cursorrules
  - lib/access-control.ts
  - app/layout.tsx
  - .github/prompts/spectra-debug.prompt.md
  - .github/skills/spectra-propose/SKILL.md
  - .github/skills/spectra-apply/SKILL.md
  - AGENTS.md
  - vitest.config.ts
  - .github/skills/spectra-ingest/SKILL.md
  - app/(guest)/guest/page.tsx
  - .spectra.yaml
  - app/(member)/dashboard/page.tsx
  - .github/skills/spectra-audit/SKILL.md
  - app/(member)/dashboard/weekly/page.tsx
  - app/(admin)/admin/guests/create/route.ts
  - public/next.svg
  - tsconfig.json
  - components/landing/hero.tsx
  - app/auth/callback/route.ts
  - GEMINI.md
  - README.md
  - app/(admin)/admin/vp-report/page.tsx
  - app/(admin)/layout.tsx
  - .opencode/skills/spectra-debug/SKILL.md
  - lib/guest-portal.ts
  - lib/supabase/types.ts
  - lib/member-portal-policy.ts
  - app/(auth)/login/page.tsx
  - .github/prompts/spectra-propose.prompt.md
  - .opencode/skills/spectra-audit/SKILL.md
  - postcss.config.mjs
  - .opencode/commands/spectra-ingest.md
  - .github/skills/spectra-drift/SKILL.md
  - playwright.config.ts
  - .github/prompts/spectra-ask.prompt.md
  - components/ui/button.tsx
  - app/(admin)/admin/guests/page.tsx
  - lib/supabase/client.ts
  - public/window.svg
  - supabase/config.toml
  - app/(admin)/admin/page.tsx
  - app/(auth)/error/page.tsx
  - lib/auth/access-control.ts
  - .github/skills/spectra-commit/SKILL.md
  - .opencode/skills/spectra-ask/SKILL.md
  - PHASE_A_VERIFICATION.md
  - package.json
  - SR_ALIGNMENT_PATCH.md
  - lib/supabase/server.ts
  - .github/prompts/spectra-archive.prompt.md
  - lib/actions/auth.ts
  - .opencode/commands/spectra-archive.md
  - app/(admin)/admin/vp-report/vp-report-form.tsx
  - app/(admin)/admin/presentations/[id]/page.tsx
  - lib/admin-workflows.ts
  - components/landing/features.tsx
  - app/(guest)/layout.tsx
  - .opencode/commands/spectra-commit.md
  - next.config.ts
  - .opencode/commands/spectra-apply.md
  - app/(admin)/admin/presentation/page.tsx
  - .github/prompts/spectra-audit.prompt.md
  - .github/skills/spectra-discuss/SKILL.md
  - .opencode/commands/spectra-propose.md
  - .github/prompts/spectra-apply.prompt.md
  - .github/prompts/spectra-commit.prompt.md
  - lib/actions/admin-common.ts
  - .opencode/skills/spectra-propose/SKILL.md
  - app/(admin)/admin/presentations/page.tsx
  - app/(guest)/guest/members/page.tsx
  - app/(member)/dashboard/brief/page.tsx
  - .opencode/commands/spectra-ask.md
  - .opencode/commands/spectra-drift.md
  - .opencode/commands/spectra-discuss.md
  - app/(guest)/guest/content/page.tsx
  - CLAUDE.md
  - lib/actions/guests.ts
  - lib/actions/weekly-briefs.ts
  - .opencode/commands/spectra-audit.md
  - public/globe.svg
  - .github/prompts/spectra-discuss.prompt.md
  - public/file.svg
  - lib/actions/guest-portal.ts
  - .opencode/skills/spectra-commit/SKILL.md
  - supabase/migrations/002_auth_hook.sql
  - lib/actions/awards.ts
  - app/(marketing)/layout.tsx
tests:
  - lib/access-control.test.ts
  - e2e/admin-member.spec.ts
  - lib/admin-workflows.test.ts
  - lib/member-portal-policy.test.ts
  - lib/auth/access-control.test.ts
  - lib/guest-portal.test.ts
-->