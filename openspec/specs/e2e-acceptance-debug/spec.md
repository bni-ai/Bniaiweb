# e2e-acceptance-debug Specification

## Purpose

TBD - created by archiving change 'debug-e2e-acceptance-failures'. Update Purpose after archive.

## Requirements

### Requirement: E2E failure remediation
The system SHALL record and remediate acceptance-test failures before claiming SR completion.

#### Scenario: VP validation failure is surfaced
- **WHEN** the VP report E2E enters a negative metric and submits the form
- **THEN** the page MUST show a visible validation message and MUST NOT silently pass or crash

#### Scenario: E2E selector ambiguity is removed
- **WHEN** the member directory E2E verifies the directory page
- **THEN** the assertion MUST target the page heading instead of ambiguous duplicate text

#### Scenario: Full E2E suite is rerun
- **WHEN** debug fixes are applied
- **THEN** `npm run test:e2e` MUST pass before the debug SR task is marked complete

<!-- @trace
source: debug-e2e-acceptance-failures
updated: 2026-06-02
code:
  - app/(admin)/admin/guests/guest-visit-form.tsx
  - lib/supabase/server.ts
  - app/auth/email-link/route.ts
  - .opencode/skills/spectra-ask/SKILL.md
  - app/(admin)/admin/submission/page.tsx
  - lib/supabase/client.ts
  - components/landing/hero.tsx
  - lib/actions/presentations.ts
  - .spectra.yaml
  - supabase/migrations/003_admin_backend_patch.sql
  - app/(member)/dashboard/brief/page.tsx
  - lib/actions/guest-portal.ts
  - app/(admin)/admin/guests/create/route.ts
  - app/presentation/[week-date]/page.tsx
  - app/(admin)/admin/presentations/[id]/page.tsx
  - lib/auth/access-control.ts
  - components/ui/card.tsx
  - .opencode/commands/spectra-audit.md
  - lib/actions/guests.ts
  - app/(guest)/guest/content/page.tsx
  - .opencode/commands/spectra-ask.md
  - .opencode/commands/spectra-ingest.md
  - lib/actions/admin-common.ts
  - .opencode/skills/spectra-audit/SKILL.md
  - README.md
  - app/(guest)/guest/members/page.tsx
  - app/(auth)/layout.tsx
  - app/(member)/dashboard/page.tsx
  - postcss.config.mjs
  - app/(admin)/admin/guests/page.tsx
  - app/(member)/dashboard/directory/page.tsx
  - app/globals.css
  - app/(guest)/layout.tsx
  - app/(member)/dashboard/weekly/page.tsx
  - app/(admin)/admin/awards/page.tsx
  - package.json
  - app/(admin)/admin/weekly-briefs/page.tsx
  - components/ui/button.tsx
  - app/(admin)/admin/vp-report/page.tsx
  - public/vercel.svg
  - components/landing/cta.tsx
  - .opencode/skills/spectra-ingest/SKILL.md
  - app/(admin)/admin/members/page.tsx
  - .opencode/commands/spectra-apply.md
  - lib/actions/awards.ts
  - supabase/migrations/002_auth_hook.sql
  - SR_ALIGNMENT_PATCH.md
  - next.config.ts
  - tsconfig.json
  - lib/access-control.ts
  - lib/actions/member-portal.ts
  - lib/actions/keynote.ts
  - supabase/migrations/004_chapter_week_locks.sql
  - .opencode/commands/spectra-drift.md
  - app/(admin)/admin/keynote/page.tsx
  - app/(member)/layout.tsx
  - components/landing/stats.tsx
  - .opencode/skills/spectra-propose/SKILL.md
  - lib/guest-portal.ts
  - .opencode/skills/spectra-archive/SKILL.md
  - app/(marketing)/layout.tsx
  - supabase/config.toml
  - app/(admin)/admin/vp-report/vp-report-form.tsx
  - app/(auth)/error/page.tsx
  - app/(marketing)/page.tsx
  - components/landing/features.tsx
  - .opencode/commands/spectra-propose.md
  - app/(auth)/login/page.tsx
  - app/favicon.ico
  - lib/actions/vp-report.ts
  - lib/admin-workflows.ts
  - .opencode/commands/spectra-archive.md
  - app/(admin)/admin/presentation/page.tsx
  - .opencode/commands/spectra-commit.md
  - .opencode/commands/spectra-discuss.md
  - .cursorrules
  - supabase/migrations/005_guest_portal.sql
  - app/layout.tsx
  - lib/member-portal-policy.ts
  - lib/supabase/types.ts
  - app/(admin)/admin/page.tsx
  - public/file.svg
  - app/(admin)/layout.tsx
  - .opencode/commands/spectra-debug.md
  - SR_EXECUTION_OBJECTIVE.md
  - public/globe.svg
  - .opencode/skills/spectra-discuss/SKILL.md
  - .opencode/skills/spectra-commit/SKILL.md
  - app/(admin)/admin/presentations/page.tsx
  - app/auth/callback/route.ts
  - app/(guest)/guest/page.tsx
  - .opencode/skills/spectra-apply/SKILL.md
  - vitest.config.ts
  - public/next.svg
  - public/window.svg
  - playwright.config.ts
  - lib/actions/weekly-briefs.ts
  - .opencode/skills/spectra-drift/SKILL.md
  - .opencode/skills/spectra-debug/SKILL.md
  - app/(member)/dashboard/report/page.tsx
  - eslint.config.mjs
  - lib/actions/auth.ts
  - PHASE_A_VERIFICATION.md
  - app/(guest)/guest/prepare/page.tsx
  - middleware.ts
tests:
  - lib/admin-workflows.test.ts
  - lib/access-control.test.ts
  - e2e/admin-member.spec.ts
  - lib/auth/access-control.test.ts
  - lib/guest-portal.test.ts
  - lib/member-portal-policy.test.ts
-->