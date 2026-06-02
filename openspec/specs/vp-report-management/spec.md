# vp-report-management Specification

## Purpose

TBD - created by archiving change 'admin-backend'. Update Purpose after archive.

## Requirements

### Requirement: VP report management

The system SHALL let officers enter and maintain one weekly VP report with validated numeric metrics.

#### Scenario: Officer saves a VP report
- **WHEN** an officer enters valid totals for referrals, one-on-ones, visitors, attendance, referral value, and notes
- **THEN** the system MUST create or update the weekly_vp_reports row for the selected chapter-week and show the saved values on reload

##### Example:
- **GIVEN** week `2026-06-01` has no VP report
- **WHEN** officer saves `total_referrals=18`, `total_one_on_ones=24`, `referral_value_twd=520000`
- **THEN** one `weekly_vp_reports` row is created for that week and values match after reload

#### Scenario: Officer edits an existing VP report
- **WHEN** an officer changes one or more metrics for a week that already has a VP report
- **THEN** the system MUST update the existing row instead of creating a duplicate report

##### Example:
- **GIVEN** week `2026-06-01` already has report `vp-001`
- **WHEN** officer changes `total_visitors` from `6` to `7`
- **THEN** row `vp-001` is updated and row count for that week remains `1`

#### Scenario: Officer submits invalid negative metrics
- **WHEN** an officer attempts to save a negative count or negative TWD amount
- **THEN** the system MUST reject the save, keep the entered values visible, and show field-level validation feedback

##### Example:
- **GIVEN** officer enters `total_referrals=-1`
- **WHEN** officer clicks save
- **THEN** API rejects request and UI shows validation error on `total_referrals` field without persisting data

<!-- @trace
source: admin-backend
updated: 2026-06-02
code:
  - app/(admin)/admin/guests/page.tsx
  - supabase/migrations/005_guest_portal.sql
  - app/(admin)/admin/vp-report/vp-report-form.tsx
  - .cursorrules
  - GEMINI.md
  - app/(marketing)/page.tsx
  - .github/prompts/spectra-debug.prompt.md
  - app/(marketing)/layout.tsx
  - components/landing/cta.tsx
  - postcss.config.mjs
  - app/(auth)/error/page.tsx
  - lib/actions/guest-portal.ts
  - app/(admin)/admin/awards/page.tsx
  - .opencode/commands/spectra-audit.md
  - components/landing/hero.tsx
  - app/(admin)/admin/members/page.tsx
  - eslint.config.mjs
  - lib/admin-workflows.ts
  - .github/skills/spectra-archive/SKILL.md
  - app/(member)/dashboard/brief/page.tsx
  - .opencode/skills/spectra-propose/SKILL.md
  - PHASE_A_VERIFICATION.md
  - app/presentation/[week-date]/page.tsx
  - public/file.svg
  - app/(admin)/admin/page.tsx
  - lib/actions/vp-report.ts
  - app/(auth)/layout.tsx
  - lib/actions/guests.ts
  - app/(guest)/guest/prepare/page.tsx
  - lib/guest-portal.ts
  - .github/skills/spectra-ingest/SKILL.md
  - app/(member)/dashboard/page.tsx
  - app/(admin)/admin/keynote/page.tsx
  - app/auth/email-link/route.ts
  - lib/supabase/types.ts
  - app/(member)/dashboard/report/page.tsx
  - app/(guest)/layout.tsx
  - ui-mockup-member-v3.html
  - .github/skills/spectra-commit/SKILL.md
  - lib/actions/member-portal.ts
  - SR_EXECUTION_OBJECTIVE.md
  - lib/actions/admin-common.ts
  - CLAUDE.md
  - public/vercel.svg
  - app/auth/callback/route.ts
  - .opencode/skills/spectra-drift/SKILL.md
  - .github/skills/spectra-ask/SKILL.md
  - .github/prompts/spectra-drift.prompt.md
  - components/landing/stats.tsx
  - lib/supabase/client.ts
  - .opencode/commands/spectra-drift.md
  - app/(guest)/guest/members/page.tsx
  - app/(admin)/admin/presentation/page.tsx
  - .opencode/commands/spectra-propose.md
  - app/globals.css
  - .opencode/skills/spectra-audit/SKILL.md
  - app/(guest)/guest/page.tsx
  - .opencode/commands/spectra-commit.md
  - app/(admin)/layout.tsx
  - public/window.svg
  - lib/actions/auth.ts
  - supabase/config.toml
  - lib/supabase/server.ts
  - .opencode/skills/spectra-commit/SKILL.md
  - components/ui/card.tsx
  - .github/skills/spectra-apply/SKILL.md
  - app/(guest)/guest/content/page.tsx
  - SR_ALIGNMENT_PATCH.md
  - vitest.config.ts
  - .opencode/skills/spectra-ingest/SKILL.md
  - app/layout.tsx
  - app/(admin)/admin/presentations/[id]/page.tsx
  - app/(admin)/admin/weekly-briefs/page.tsx
  - app/(member)/layout.tsx
  - lib/member-portal-policy.ts
  - app/(admin)/admin/vp-report/page.tsx
  - components/landing/features.tsx
  - .spectra.yaml
  - app/(admin)/admin/presentations/page.tsx
  - .github/prompts/spectra-audit.prompt.md
  - app/(member)/dashboard/weekly/page.tsx
  - .github/prompts/spectra-ingest.prompt.md
  - .github/prompts/spectra-archive.prompt.md
  - .opencode/commands/spectra-debug.md
  - app/(admin)/admin/guests/create/route.ts
  - lib/auth/access-control.ts
  - next.config.ts
  - lib/actions/weekly-briefs.ts
  - .opencode/commands/spectra-discuss.md
  - .github/skills/spectra-propose/SKILL.md
  - lib/actions/awards.ts
  - public/next.svg
  - package.json
  - .github/prompts/spectra-apply.prompt.md
  - public/globe.svg
  - .opencode/commands/spectra-ingest.md
  - AGENTS.md
  - components/ui/button.tsx
  - supabase/migrations/002_auth_hook.sql
  - app/(member)/dashboard/directory/page.tsx
  - lib/actions/keynote.ts
  - .github/prompts/spectra-commit.prompt.md
  - app/(auth)/login/page.tsx
  - tsconfig.json
  - README.md
  - .github/prompts/spectra-propose.prompt.md
  - .github/prompts/spectra-ask.prompt.md
  - .github/prompts/spectra-discuss.prompt.md
  - .github/skills/spectra-debug/SKILL.md
  - .opencode/skills/spectra-archive/SKILL.md
  - .github/skills/spectra-audit/SKILL.md
  - lib/actions/presentations.ts
  - .opencode/skills/spectra-discuss/SKILL.md
  - lib/access-control.ts
  - app/(admin)/admin/guests/guest-visit-form.tsx
  - .opencode/commands/spectra-ask.md
  - .opencode/skills/spectra-debug/SKILL.md
  - .opencode/commands/spectra-apply.md
  - .github/skills/spectra-drift/SKILL.md
  - supabase/migrations/003_admin_backend_patch.sql
  - app/favicon.ico
  - app/(admin)/admin/submission/page.tsx
  - .github/skills/spectra-discuss/SKILL.md
  - playwright.config.ts
  - .opencode/skills/spectra-ask/SKILL.md
  - .opencode/commands/spectra-archive.md
  - .opencode/skills/spectra-apply/SKILL.md
  - supabase/migrations/004_chapter_week_locks.sql
  - middleware.ts
tests:
  - lib/access-control.test.ts
  - lib/guest-portal.test.ts
  - lib/member-portal-policy.test.ts
  - e2e/admin-member.spec.ts
  - lib/admin-workflows.test.ts
  - lib/auth/access-control.test.ts
-->