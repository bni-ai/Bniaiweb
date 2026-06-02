# member-dashboard Specification

## Purpose

TBD - created by archiving change 'member-portal'. Update Purpose after archive.

## Requirements

### Requirement: Member dashboard

The system SHALL provide an authenticated dashboard home that summarizes the signed-in member profile and this week's brief state.

#### Scenario: Member opens the dashboard home
- **WHEN** an authenticated member navigates to `/dashboard`
- **THEN** the system MUST show the member profile summary card, this week's brief status, and quick-action links for brief entry, directory, and profile updates

#### Scenario: Member has no brief for the current week
- **WHEN** the signed-in member has not created a weekly brief for the current week
- **THEN** the system MUST show a not-started status and keep the quick-action link pointing to `/dashboard/report`（legacy `/dashboard/brief` 與 `/dashboard/weekly` 需可相容導向）

#### Scenario: Member has a saved brief for the current week
- **WHEN** the signed-in member already has a draft or submitted brief for the current week
- **THEN** the system MUST show the matching status badge on the dashboard home

##### Example:
- **GIVEN** member `m-026` has `weekly_briefs` row for `week_date=2026-06-01` with `status='submitted'`
- **WHEN** member `m-026` opens `/dashboard`
- **THEN** dashboard shows status badge `已提交` and quick-action still points to `/dashboard/report`

<!-- @trace
source: member-portal
updated: 2026-06-02
code:
  - .opencode/commands/spectra-ask.md
  - .github/skills/spectra-apply/SKILL.md
  - lib/supabase/server.ts
  - .github/skills/spectra-propose/SKILL.md
  - app/(admin)/admin/guests/create/route.ts
  - lib/actions/weekly-briefs.ts
  - playwright.config.ts
  - .github/prompts/spectra-discuss.prompt.md
  - lib/supabase/client.ts
  - app/(admin)/admin/guests/page.tsx
  - app/(admin)/admin/keynote/page.tsx
  - .opencode/commands/spectra-archive.md
  - app/(guest)/guest/content/page.tsx
  - .opencode/skills/spectra-archive/SKILL.md
  - app/(admin)/admin/presentations/[id]/page.tsx
  - supabase/migrations/003_admin_backend_patch.sql
  - .github/skills/spectra-archive/SKILL.md
  - .opencode/skills/spectra-ingest/SKILL.md
  - .opencode/skills/spectra-propose/SKILL.md
  - supabase/migrations/002_auth_hook.sql
  - .github/skills/spectra-ingest/SKILL.md
  - .github/prompts/spectra-audit.prompt.md
  - .opencode/commands/spectra-discuss.md
  - app/(guest)/layout.tsx
  - app/(marketing)/layout.tsx
  - public/file.svg
  - app/(admin)/admin/page.tsx
  - lib/supabase/types.ts
  - .opencode/commands/spectra-commit.md
  - app/(admin)/admin/submission/page.tsx
  - app/(member)/dashboard/page.tsx
  - .github/skills/spectra-discuss/SKILL.md
  - .opencode/skills/spectra-audit/SKILL.md
  - AGENTS.md
  - supabase/migrations/005_guest_portal.sql
  - app/(admin)/admin/guests/guest-visit-form.tsx
  - app/auth/callback/route.ts
  - lib/actions/presentations.ts
  - .github/skills/spectra-ask/SKILL.md
  - .spectra.yaml
  - .opencode/skills/spectra-ask/SKILL.md
  - app/(admin)/admin/vp-report/vp-report-form.tsx
  - app/globals.css
  - eslint.config.mjs
  - lib/actions/vp-report.ts
  - lib/member-portal-policy.ts
  - ui-mockup-member-v3.html
  - .github/prompts/spectra-apply.prompt.md
  - .cursorrules
  - .opencode/skills/spectra-commit/SKILL.md
  - GEMINI.md
  - public/vercel.svg
  - components/landing/stats.tsx
  - app/(admin)/admin/presentations/page.tsx
  - postcss.config.mjs
  - app/(auth)/error/page.tsx
  - lib/actions/awards.ts
  - .opencode/commands/spectra-propose.md
  - .github/prompts/spectra-commit.prompt.md
  - app/(member)/layout.tsx
  - lib/actions/member-portal.ts
  - .github/prompts/spectra-propose.prompt.md
  - PHASE_A_VERIFICATION.md
  - app/(member)/dashboard/weekly/page.tsx
  - lib/auth/access-control.ts
  - .opencode/commands/spectra-debug.md
  - app/(admin)/admin/presentation/page.tsx
  - tsconfig.json
  - SR_EXECUTION_OBJECTIVE.md
  - supabase/config.toml
  - app/(admin)/layout.tsx
  - lib/access-control.ts
  - app/(admin)/admin/awards/page.tsx
  - components/landing/features.tsx
  - vitest.config.ts
  - lib/actions/admin-common.ts
  - .github/prompts/spectra-ingest.prompt.md
  - app/(auth)/login/page.tsx
  - .opencode/skills/spectra-apply/SKILL.md
  - .opencode/skills/spectra-drift/SKILL.md
  - app/(member)/dashboard/brief/page.tsx
  - SR_ALIGNMENT_PATCH.md
  - lib/actions/guests.ts
  - lib/admin-workflows.ts
  - public/next.svg
  - lib/guest-portal.ts
  - .opencode/skills/spectra-debug/SKILL.md
  - middleware.ts
  - app/(marketing)/page.tsx
  - lib/actions/guest-portal.ts
  - lib/actions/keynote.ts
  - components/landing/cta.tsx
  - .github/skills/spectra-commit/SKILL.md
  - .github/prompts/spectra-ask.prompt.md
  - app/(member)/dashboard/report/page.tsx
  - app/layout.tsx
  - .github/skills/spectra-audit/SKILL.md
  - next.config.ts
  - .github/prompts/spectra-archive.prompt.md
  - .opencode/commands/spectra-audit.md
  - app/(guest)/guest/page.tsx
  - .opencode/commands/spectra-drift.md
  - .opencode/commands/spectra-ingest.md
  - app/presentation/[week-date]/page.tsx
  - .github/skills/spectra-debug/SKILL.md
  - app/(admin)/admin/vp-report/page.tsx
  - lib/actions/auth.ts
  - CLAUDE.md
  - app/(guest)/guest/members/page.tsx
  - app/auth/email-link/route.ts
  - .github/prompts/spectra-drift.prompt.md
  - .opencode/commands/spectra-apply.md
  - .opencode/skills/spectra-discuss/SKILL.md
  - components/landing/hero.tsx
  - app/favicon.ico
  - README.md
  - supabase/migrations/004_chapter_week_locks.sql
  - .github/prompts/spectra-debug.prompt.md
  - app/(auth)/layout.tsx
  - package.json
  - components/ui/card.tsx
  - app/(member)/dashboard/directory/page.tsx
  - public/globe.svg
  - components/ui/button.tsx
  - app/(guest)/guest/prepare/page.tsx
  - public/window.svg
  - app/(admin)/admin/members/page.tsx
  - .github/skills/spectra-drift/SKILL.md
  - app/(admin)/admin/weekly-briefs/page.tsx
tests:
  - lib/guest-portal.test.ts
  - lib/auth/access-control.test.ts
  - lib/member-portal-policy.test.ts
  - lib/access-control.test.ts
  - e2e/admin-member.spec.ts
  - lib/admin-workflows.test.ts
-->