# member-top-clients Specification

## Purpose

TBD - created by archiving change 'member-module'. Update Purpose after archive.

## Requirements

### Requirement: Member top clients

The system SHALL let each member maintain up to ten ranked top-client entries with exactly one slot per rank.

#### Scenario: Member fills an empty client rank
- **WHEN** a member saves a top-client entry for an unused rank between 1 and 10
- **THEN** the system MUST create or update the record for that rank and show the saved values on the ranked card

#### Scenario: Member updates an existing client rank
- **WHEN** a member edits industry, company_type, location, or notes for an existing rank
- **THEN** the system MUST keep the same rank and show the updated content after refresh

##### Example:
- **GIVEN** rank `3` already exists with `industry='醫療'`
- **WHEN** member edits rank `3` to `industry='AI服務'`
- **THEN** row rank remains `3` and page reload shows `industry='AI服務'`

#### Scenario: Page shows all ten ranks
- **WHEN** a member opens the top-clients page with fewer than ten saved records
- **THEN** the system MUST render placeholders for every missing rank from 1 through 10

<!-- @trace
source: member-module
updated: 2026-06-02
code:
  - app/favicon.ico
  - lib/actions/member-portal.ts
  - lib/admin-workflows.ts
  - components/member/gains-form.tsx
  - lib/actions/one-on-ones.ts
  - README.md
  - .opencode/skills/spectra-commit/SKILL.md
  - .cursorrules
  - lib/auth/access-control.ts
  - app/(member)/dashboard/directory/page.tsx
  - lib/one-on-one.ts
  - app/(admin)/admin/members/member-form.tsx
  - next.config.ts
  - app/(member)/layout.tsx
  - .github/skills/spectra-apply/SKILL.md
  - lib/actions/presentations.ts
  - .opencode/commands/spectra-apply.md
  - .opencode/commands/spectra-ask.md
  - components/slides/shared.tsx
  - .github/prompts/spectra-ingest.prompt.md
  - app/(admin)/admin/import/page.tsx
  - app/(admin)/admin/guests/create/route.ts
  - .opencode/skills/spectra-ingest/SKILL.md
  - supabase/migrations/002_auth_hook.sql
  - .opencode/commands/spectra-drift.md
  - supabase/migrations/003_admin_backend_patch.sql
  - lib/auth/session-role.ts
  - app/(auth)/login/page.tsx
  - .github/skills/spectra-discuss/SKILL.md
  - .github/prompts/spectra-audit.prompt.md
  - .opencode/commands/spectra-propose.md
  - ui-mockup-member-v3.html
  - .opencode/commands/spectra-audit.md
  - lib/actions/members.ts
  - .github/prompts/spectra-drift.prompt.md
  - AGENTS.md
  - app/(member)/dashboard/weekly/page.tsx
  - .github/prompts/spectra-debug.prompt.md
  - .opencode/skills/spectra-apply/SKILL.md
  - playwright.config.ts
  - app/(marketing)/page.tsx
  - app/(guest)/guest/prepare/page.tsx
  - lib/member-portal-policy.ts
  - .github/skills/spectra-ask/SKILL.md
  - middleware.ts
  - .github/skills/spectra-ingest/SKILL.md
  - .opencode/skills/spectra-ask/SKILL.md
  - app/presentation/[week-date]/page.tsx
  - .github/skills/spectra-propose/SKILL.md
  - .github/skills/spectra-commit/SKILL.md
  - app/(member)/dashboard/events/page.tsx
  - .opencode/commands/spectra-discuss.md
  - components/landing/stats.tsx
  - app/(member)/dashboard/top-clients/page.tsx
  - lib/supabase/server.ts
  - lib/member-form.ts
  - lib/actions/keynote.ts
  - app/(admin)/admin/weekly-briefs/page.tsx
  - lib/presentation/slide-order.ts
  - tsconfig.json
  - app/(admin)/admin/guests/page.tsx
  - .opencode/skills/spectra-propose/SKILL.md
  - lib/supabase/types.ts
  - app/(member)/dashboard/ai/page.tsx
  - lib/actions/vp-report.ts
  - GEMINI.md
  - app/(admin)/admin/members/[id]/page.tsx
  - supabase/migrations/004_chapter_week_locks.sql
  - public/window.svg
  - app/(member)/dashboard/page.tsx
  - app/(guest)/guest/members/page.tsx
  - app/(member)/dashboard/contacts-circle/page.tsx
  - app/globals.css
  - .opencode/skills/spectra-drift/SKILL.md
  - .github/prompts/spectra-commit.prompt.md
  - SR_ALIGNMENT_PATCH.md
  - .github/skills/spectra-audit/SKILL.md
  - .github/skills/spectra-archive/SKILL.md
  - .github/prompts/spectra-archive.prompt.md
  - app/(admin)/admin/page.tsx
  - app/(admin)/admin/members/new/page.tsx
  - app/layout.tsx
  - app/(admin)/admin/presentations/page.tsx
  - app/(marketing)/layout.tsx
  - .spectra.yaml
  - app/(admin)/admin/guests/guest-visit-form.tsx
  - components/slides/index.tsx
  - lib/presentation/builder.ts
  - postcss.config.mjs
  - app/(admin)/layout.tsx
  - package.json
  - lib/supabase/client.ts
  - .github/prompts/spectra-propose.prompt.md
  - app/(admin)/admin/awards/page.tsx
  - app/(admin)/admin/vp-report/page.tsx
  - app/(admin)/admin/presentation/page.tsx
  - app/auth/email-link/route.ts
  - app/(auth)/layout.tsx
  - .github/skills/spectra-drift/SKILL.md
  - public/next.svg
  - app/(guest)/layout.tsx
  - .opencode/commands/spectra-archive.md
  - .github/prompts/spectra-discuss.prompt.md
  - app/(member)/dashboard/brief/page.tsx
  - eslint.config.mjs
  - .github/prompts/spectra-apply.prompt.md
  - supabase/migrations/006_member_module.sql
  - components/landing/features.tsx
  - app/(member)/dashboard/one-on-one/page.tsx
  - lib/actions/auth.ts
  - lib/guest-portal.ts
  - app/(auth)/error/page.tsx
  - public/file.svg
  - app/(member)/dashboard/training/page.tsx
  - components/ui/card.tsx
  - app/(admin)/admin/keynote/page.tsx
  - SR_EXECUTION_OBJECTIVE.md
  - app/(member)/dashboard/gains/page.tsx
  - app/(member)/dashboard/report/page.tsx
  - components/ui/button.tsx
  - app/(member)/dashboard/profile/page.tsx
  - components/landing/cta.tsx
  - lib/presentation/viewer.tsx
  - tmp-admin-switch-check.png
  - .github/skills/spectra-debug/SKILL.md
  - .opencode/commands/spectra-debug.md
  - .opencode/skills/spectra-discuss/SKILL.md
  - CLAUDE.md
  - lib/actions/awards.ts
  - .opencode/commands/spectra-commit.md
  - app/(admin)/admin/vp-report/vp-report-form.tsx
  - supabase/config.toml
  - public/vercel.svg
  - app/(guest)/guest/content/page.tsx
  - .opencode/skills/spectra-archive/SKILL.md
  - lib/presentation/types.ts
  - app/(admin)/admin/presentations/[id]/page.tsx
  - public/globe.svg
  - lib/actions/guests.ts
  - app/(admin)/admin/members/page.tsx
  - components/landing/hero.tsx
  - app/(admin)/admin/settings/page.tsx
  - lib/actions/guest-portal.ts
  - lib/actions/weekly-briefs.ts
  - lib/actions/admin-common.ts
  - vitest.config.ts
  - .opencode/skills/spectra-debug/SKILL.md
  - .github/prompts/spectra-ask.prompt.md
  - app/auth/callback/route.ts
  - .opencode/commands/spectra-ingest.md
  - PHASE_A_VERIFICATION.md
  - .opencode/skills/spectra-audit/SKILL.md
  - app/(admin)/admin/submission/page.tsx
  - app/(guest)/guest/page.tsx
  - lib/access-control.ts
  - supabase/migrations/005_guest_portal.sql
tests:
  - lib/members.test.ts
  - lib/admin-workflows.test.ts
  - e2e/admin-member.spec.ts
  - lib/auth/access-control.test.ts
  - lib/presentation-logic.test.ts
  - lib/guest-portal.test.ts
  - lib/one-on-one.test.ts
  - lib/member-portal-policy.test.ts
  - lib/access-control.test.ts
-->