# guest-access-boundary Specification

## Purpose

TBD - created by archiving change 'guest-portal'. Update Purpose after archive.

## Requirements

### Requirement: Guest role access boundary
The system SHALL treat invited guests as a distinct limited role that is separate from anonymous users, members, and admins.

#### Scenario: Guest tries to open admin
- **WHEN** a user with guest access opens `/admin` or any `/admin/*` route
- **THEN** middleware MUST redirect the user to `/guest`

#### Scenario: Guest tries to open member dashboard
- **WHEN** a user with guest access opens `/dashboard` or any member-only route
- **THEN** middleware MUST redirect the user to `/guest`

#### Scenario: Member email overlaps guest email
- **WHEN** an authenticated email exists in both `members.email` and `guests.email`
- **THEN** the system MUST apply member or admin access before guest access

##### Example: member precedence
- **GIVEN** `members.email=same@example.com` and `guests.email=same@example.com`
- **WHEN** `same@example.com` completes authentication
- **THEN** callback follows the member role path and does not assign guest-only access


<!-- @trace
source: guest-portal
updated: 2026-06-02
code:
  - .opencode/commands/spectra-ask.md
  - app/layout.tsx
  - lib/auth/access-control.ts
  - lib/actions/vp-report.ts
  - app/(member)/dashboard/directory/page.tsx
  - app/(admin)/admin/members/page.tsx
  - supabase/migrations/002_auth_hook.sql
  - supabase/migrations/005_guest_portal.sql
  - lib/actions/awards.ts
  - app/(member)/layout.tsx
  - app/(marketing)/layout.tsx
  - components/landing/cta.tsx
  - app/(member)/dashboard/brief/page.tsx
  - README.md
  - public/vercel.svg
  - public/globe.svg
  - app/(admin)/admin/submission/page.tsx
  - lib/actions/admin-common.ts
  - .opencode/skills/spectra-ask/SKILL.md
  - app/presentation/[week-date]/page.tsx
  - eslint.config.mjs
  - .cursorrules
  - app/(admin)/admin/presentations/page.tsx
  - .opencode/commands/spectra-archive.md
  - middleware.ts
  - app/(admin)/admin/keynote/page.tsx
  - .opencode/commands/spectra-apply.md
  - lib/actions/guests.ts
  - lib/actions/presentations.ts
  - lib/supabase/server.ts
  - lib/actions/member-portal.ts
  - lib/access-control.ts
  - components/landing/stats.tsx
  - app/favicon.ico
  - tsconfig.json
  - lib/admin-workflows.ts
  - lib/actions/guest-portal.ts
  - app/globals.css
  - app/auth/callback/route.ts
  - app/(guest)/guest/page.tsx
  - app/(member)/dashboard/weekly/page.tsx
  - app/(guest)/layout.tsx
  - app/(auth)/error/page.tsx
  - public/next.svg
  - app/(member)/dashboard/report/page.tsx
  - public/file.svg
  - postcss.config.mjs
  - lib/supabase/client.ts
  - app/(auth)/login/page.tsx
  - components/ui/button.tsx
  - app/(admin)/admin/guests/page.tsx
  - .opencode/commands/spectra-commit.md
  - components/landing/hero.tsx
  - supabase/config.toml
  - .opencode/skills/spectra-apply/SKILL.md
  - app/(member)/dashboard/page.tsx
  - supabase/migrations/003_admin_backend_patch.sql
  - public/window.svg
  - components/ui/card.tsx
  - SR_EXECUTION_OBJECTIVE.md
  - .opencode/commands/spectra-drift.md
  - .opencode/skills/spectra-debug/SKILL.md
  - app/(admin)/admin/page.tsx
  - .opencode/skills/spectra-drift/SKILL.md
  - app/(admin)/admin/presentations/[id]/page.tsx
  - .opencode/skills/spectra-ingest/SKILL.md
  - .opencode/commands/spectra-propose.md
  - app/(admin)/admin/vp-report/vp-report-form.tsx
  - package.json
  - .opencode/commands/spectra-ingest.md
  - app/(auth)/layout.tsx
  - components/landing/features.tsx
  - PHASE_A_VERIFICATION.md
  - supabase/migrations/004_chapter_week_locks.sql
  - app/(admin)/admin/weekly-briefs/page.tsx
  - SR_ALIGNMENT_PATCH.md
  - .opencode/commands/spectra-debug.md
  - lib/supabase/types.ts
  - .spectra.yaml
  - lib/actions/weekly-briefs.ts
  - lib/member-portal-policy.ts
  - playwright.config.ts
  - app/(guest)/guest/content/page.tsx
  - lib/guest-portal.ts
  - app/(admin)/admin/presentation/page.tsx
  - next.config.ts
  - app/(marketing)/page.tsx
  - app/(admin)/admin/guests/guest-visit-form.tsx
  - app/(admin)/admin/vp-report/page.tsx
  - .opencode/skills/spectra-archive/SKILL.md
  - .opencode/skills/spectra-discuss/SKILL.md
  - .opencode/skills/spectra-propose/SKILL.md
  - app/auth/email-link/route.ts
  - .opencode/skills/spectra-audit/SKILL.md
  - app/(guest)/guest/members/page.tsx
  - app/(admin)/admin/awards/page.tsx
  - app/(guest)/guest/prepare/page.tsx
  - vitest.config.ts
  - lib/actions/auth.ts
  - .opencode/commands/spectra-audit.md
  - app/(admin)/layout.tsx
  - app/(admin)/admin/guests/create/route.ts
  - .opencode/skills/spectra-commit/SKILL.md
  - lib/actions/keynote.ts
  - .opencode/commands/spectra-discuss.md
tests:
  - lib/member-portal-policy.test.ts
  - lib/admin-workflows.test.ts
  - lib/auth/access-control.test.ts
  - lib/access-control.test.ts
  - e2e/admin-member.spec.ts
  - lib/guest-portal.test.ts
-->

---
### Requirement: Unknown authenticated users remain blocked
The system SHALL continue to block authenticated users whose email is neither a member email nor an invited guest email.

#### Scenario: Unknown user logs in
- **WHEN** an authenticated email does not exist in `members.email` or `guests.email`
- **THEN** the system MUST route the user to an error page explaining that the email is not a member or invited guest

<!-- @trace
source: guest-portal
updated: 2026-06-02
code:
  - .opencode/commands/spectra-ask.md
  - app/layout.tsx
  - lib/auth/access-control.ts
  - lib/actions/vp-report.ts
  - app/(member)/dashboard/directory/page.tsx
  - app/(admin)/admin/members/page.tsx
  - supabase/migrations/002_auth_hook.sql
  - supabase/migrations/005_guest_portal.sql
  - lib/actions/awards.ts
  - app/(member)/layout.tsx
  - app/(marketing)/layout.tsx
  - components/landing/cta.tsx
  - app/(member)/dashboard/brief/page.tsx
  - README.md
  - public/vercel.svg
  - public/globe.svg
  - app/(admin)/admin/submission/page.tsx
  - lib/actions/admin-common.ts
  - .opencode/skills/spectra-ask/SKILL.md
  - app/presentation/[week-date]/page.tsx
  - eslint.config.mjs
  - .cursorrules
  - app/(admin)/admin/presentations/page.tsx
  - .opencode/commands/spectra-archive.md
  - middleware.ts
  - app/(admin)/admin/keynote/page.tsx
  - .opencode/commands/spectra-apply.md
  - lib/actions/guests.ts
  - lib/actions/presentations.ts
  - lib/supabase/server.ts
  - lib/actions/member-portal.ts
  - lib/access-control.ts
  - components/landing/stats.tsx
  - app/favicon.ico
  - tsconfig.json
  - lib/admin-workflows.ts
  - lib/actions/guest-portal.ts
  - app/globals.css
  - app/auth/callback/route.ts
  - app/(guest)/guest/page.tsx
  - app/(member)/dashboard/weekly/page.tsx
  - app/(guest)/layout.tsx
  - app/(auth)/error/page.tsx
  - public/next.svg
  - app/(member)/dashboard/report/page.tsx
  - public/file.svg
  - postcss.config.mjs
  - lib/supabase/client.ts
  - app/(auth)/login/page.tsx
  - components/ui/button.tsx
  - app/(admin)/admin/guests/page.tsx
  - .opencode/commands/spectra-commit.md
  - components/landing/hero.tsx
  - supabase/config.toml
  - .opencode/skills/spectra-apply/SKILL.md
  - app/(member)/dashboard/page.tsx
  - supabase/migrations/003_admin_backend_patch.sql
  - public/window.svg
  - components/ui/card.tsx
  - SR_EXECUTION_OBJECTIVE.md
  - .opencode/commands/spectra-drift.md
  - .opencode/skills/spectra-debug/SKILL.md
  - app/(admin)/admin/page.tsx
  - .opencode/skills/spectra-drift/SKILL.md
  - app/(admin)/admin/presentations/[id]/page.tsx
  - .opencode/skills/spectra-ingest/SKILL.md
  - .opencode/commands/spectra-propose.md
  - app/(admin)/admin/vp-report/vp-report-form.tsx
  - package.json
  - .opencode/commands/spectra-ingest.md
  - app/(auth)/layout.tsx
  - components/landing/features.tsx
  - PHASE_A_VERIFICATION.md
  - supabase/migrations/004_chapter_week_locks.sql
  - app/(admin)/admin/weekly-briefs/page.tsx
  - SR_ALIGNMENT_PATCH.md
  - .opencode/commands/spectra-debug.md
  - lib/supabase/types.ts
  - .spectra.yaml
  - lib/actions/weekly-briefs.ts
  - lib/member-portal-policy.ts
  - playwright.config.ts
  - app/(guest)/guest/content/page.tsx
  - lib/guest-portal.ts
  - app/(admin)/admin/presentation/page.tsx
  - next.config.ts
  - app/(marketing)/page.tsx
  - app/(admin)/admin/guests/guest-visit-form.tsx
  - app/(admin)/admin/vp-report/page.tsx
  - .opencode/skills/spectra-archive/SKILL.md
  - .opencode/skills/spectra-discuss/SKILL.md
  - .opencode/skills/spectra-propose/SKILL.md
  - app/auth/email-link/route.ts
  - .opencode/skills/spectra-audit/SKILL.md
  - app/(guest)/guest/members/page.tsx
  - app/(admin)/admin/awards/page.tsx
  - app/(guest)/guest/prepare/page.tsx
  - vitest.config.ts
  - lib/actions/auth.ts
  - .opencode/commands/spectra-audit.md
  - app/(admin)/layout.tsx
  - app/(admin)/admin/guests/create/route.ts
  - .opencode/skills/spectra-commit/SKILL.md
  - lib/actions/keynote.ts
  - .opencode/commands/spectra-discuss.md
tests:
  - lib/member-portal-policy.test.ts
  - lib/admin-workflows.test.ts
  - lib/auth/access-control.test.ts
  - lib/access-control.test.ts
  - e2e/admin-member.spec.ts
  - lib/guest-portal.test.ts
-->