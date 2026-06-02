# supabase-auth Specification

## Purpose

TBD - created by archiving change 'app-foundation'. Update Purpose after archive.

## Requirements

### Requirement: Google OAuth Login

The system SHALL authenticate members using Google OAuth via Supabase Auth. The login page SHALL display a single "使用 Google 帳號登入" button. Upon successful OAuth callback, the system SHALL look up the authenticated email in the `members` table and bind `auth.uid()` to the member record.

#### Scenario: Existing member logs in

- **WHEN** a user completes Google OAuth and their email exists in the `members` table
- **THEN** the system SHALL update `members.auth_uid` with `auth.uid()`, store the member's role in the session, and redirect to `/admin` if `role='admin'` or `/dashboard` if `role='member'`

#### Scenario: Non-member email logs in

- **WHEN** a user completes Google OAuth and their email does NOT exist in the `members` table
- **THEN** the system SHALL render `/error` with a "您尚未加入華AI分會" message, officer contact info (LINE group), and a "返回登入頁" link; no exception SHALL be thrown


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
### Requirement: Logout

The system SHALL provide a logout action that clears the Supabase session cookie and redirects to `/login`.

#### Scenario: Member logs out

- **WHEN** a member clicks the logout button from any authenticated page
- **THEN** the system SHALL call `supabase.auth.signOut()`, clear the session cookie, and redirect to `/login`


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
### Requirement: Role Injection into Session JWT

The system SHALL inject `members.role` into the Supabase session JWT as a custom claim `app_role` using a Supabase Auth hook (`custom_access_token_hook`). This allows middleware to read the role from the JWT without a database query on every request.

#### Scenario: JWT contains role after login

- **WHEN** a member completes Google OAuth
- **THEN** the decoded JWT SHALL contain `app_role: 'admin'` or `app_role: 'member'` matching `members.role` for that email

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