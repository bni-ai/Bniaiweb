# weekly-brief-submission Specification

## Purpose

TBD - created by archiving change 'member-portal'. Update Purpose after archive.

## Requirements

### Requirement: Weekly brief submission

The system SHALL let a member create, edit, draft, and submit one weekly brief for the current chapter-week while the week remains unlocked.

#### Scenario: Member opens an empty weekly brief form
- **WHEN** a member visits the weekly brief page for a week with no existing row
- **THEN** the system MUST initialize the form with the current Monday week_date and empty have_this_week and want_this_week fields

##### Example:
- **GIVEN** member `m-018` has no `weekly_briefs` row for `week_date=2026-06-01`
- **WHEN** member opens `/dashboard/report`
- **THEN** form shows `week_date=2026-06-01` with empty `have_this_week` and `want_this_week`

#### Scenario: Member saves a draft brief
- **WHEN** a member enters have_this_week and want_this_week content and chooses `儲存草稿`
- **THEN** the system MUST save or update the brief with status `draft` and keep the content available on the next visit

#### Scenario: Member submits a weekly brief
- **WHEN** a member chooses `提交` on a valid weekly brief
- **THEN** the system MUST save the content with status `submitted` and set submitted_at for that week

#### Scenario: Member edits an existing weekly brief
- **WHEN** a member revisits a week that already has a draft or submitted brief while the week is still unlocked
- **THEN** the system MUST prefill the existing content and allow updates to the same weekly_briefs row

##### Example:
- **GIVEN** row `weekly_briefs.id=wb-001` exists for `member_id=m-018`, `week_date=2026-06-01`, `status='draft'`
- **WHEN** member edits `want_this_week` and clicks save
- **THEN** system updates `wb-001` instead of creating a new row

#### Scenario: Member tries to edit a locked week
- **WHEN** a member opens or submits the form for a week locked by admin policy
- **THEN** the system MUST show the saved content in read-only mode and reject new writes

##### Example:
- **GIVEN** admin marked `week_date=2026-05-25` as locked and member already has a submitted brief
- **WHEN** member opens `/dashboard/report?week=2026-05-25` and attempts to modify content
- **THEN** UI is read-only and PATCH/POST write attempts return rejection

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