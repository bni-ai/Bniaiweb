# slide-builder Specification

## Purpose

TBD - created by archiving change 'presentation-engine'. Update Purpose after archive.

## Requirements

### Requirement: Slide builder

The system SHALL generate deterministic `slide_order` data for one chapter-week using the available weekly meeting records.

#### Scenario: Builder creates a complete deck
- **WHEN** keynote, weekly brief, guest visit, award, and VP report data all exist for a chapter-week
- **THEN** the system MUST output slide_order entries starting with cover, followed by keynote, member briefs ordered by member_number, guest visits, awards, vp_report, and ending with team

##### Example:
- **GIVEN** week `2026-06-01` has 1 keynote, 36 briefs, 4 guests, 2 awards, and 1 VP report
- **WHEN** `buildSlideOrder('2026-06-01', 'ch-huaai')` runs
- **THEN** result starts with `cover`, ends with `team`, and includes member slides in `member_number` ascending order

#### Scenario: Builder skips missing datasets
- **WHEN** one or more optional weekly datasets are absent for the selected chapter-week
- **THEN** the system MUST omit those slide entries while still returning a valid deck with cover and team slides

##### Example:
- **GIVEN** week `2026-06-08` has no awards and no VP report
- **WHEN** builder runs for that week
- **THEN** output excludes `award` and `vp_report` entries but still includes `cover` and `team`

#### Scenario: Builder marks visible slide entries
- **WHEN** the builder creates keynote, member, guest, award, or vp_report entries
- **THEN** the system MUST set `visible` to true on each generated entry

#### Scenario: Builder receives data for multiple chapters
- **WHEN** the backing tables contain rows for more than one chapter in the same week
- **THEN** the system MUST include only rows for the requested chapter_id in the generated slide_order

##### Example:
- **GIVEN** week `2026-06-01` has rows for `ch-huaai` and `ch-other`
- **WHEN** builder runs with `chapter_id='ch-huaai'`
- **THEN** output contains only IDs belonging to `ch-huaai`

<!-- @trace
source: presentation-engine
updated: 2026-06-02
code:
  - middleware.ts
  - .github/prompts/spectra-propose.prompt.md
  - components/landing/features.tsx
  - components/landing/cta.tsx
  - lib/supabase/types.ts
  - .spectra.yaml
  - app/(admin)/admin/page.tsx
  - tmp-admin-switch-check.png
  - app/auth/callback/route.ts
  - .opencode/commands/spectra-propose.md
  - .github/prompts/spectra-commit.prompt.md
  - supabase/config.toml
  - .github/skills/spectra-audit/SKILL.md
  - public/next.svg
  - README.md
  - .github/prompts/spectra-discuss.prompt.md
  - .github/prompts/spectra-ingest.prompt.md
  - .github/skills/spectra-discuss/SKILL.md
  - app/(marketing)/layout.tsx
  - app/(admin)/admin/vp-report/vp-report-form.tsx
  - app/(member)/layout.tsx
  - app/globals.css
  - .opencode/commands/spectra-commit.md
  - app/(member)/dashboard/top-clients/page.tsx
  - app/(admin)/admin/keynote/page.tsx
  - app/(admin)/layout.tsx
  - supabase/migrations/005_guest_portal.sql
  - lib/presentation/builder.ts
  - PHASE_A_VERIFICATION.md
  - .opencode/skills/spectra-archive/SKILL.md
  - app/(member)/dashboard/profile/page.tsx
  - .opencode/skills/spectra-debug/SKILL.md
  - lib/actions/presentations.ts
  - .github/prompts/spectra-apply.prompt.md
  - lib/actions/admin-common.ts
  - lib/one-on-one.ts
  - app/(admin)/admin/presentations/page.tsx
  - app/(admin)/admin/guests/page.tsx
  - app/(auth)/layout.tsx
  - app/favicon.ico
  - .github/prompts/spectra-audit.prompt.md
  - components/landing/stats.tsx
  - .github/skills/spectra-ingest/SKILL.md
  - SR_EXECUTION_OBJECTIVE.md
  - app/(admin)/admin/presentation/page.tsx
  - .github/skills/spectra-archive/SKILL.md
  - .github/skills/spectra-commit/SKILL.md
  - app/(admin)/admin/submission/page.tsx
  - .github/prompts/spectra-archive.prompt.md
  - app/(member)/dashboard/ai/page.tsx
  - supabase/migrations/004_chapter_week_locks.sql
  - .cursorrules
  - ui-mockup-member-v3.html
  - app/(admin)/admin/vp-report/page.tsx
  - app/(member)/dashboard/training/page.tsx
  - CLAUDE.md
  - app/(member)/dashboard/events/page.tsx
  - lib/actions/guests.ts
  - app/(member)/dashboard/one-on-one/page.tsx
  - .opencode/commands/spectra-ingest.md
  - .opencode/skills/spectra-commit/SKILL.md
  - app/layout.tsx
  - .opencode/commands/spectra-debug.md
  - .opencode/commands/spectra-ask.md
  - lib/actions/awards.ts
  - app/auth/email-link/route.ts
  - tsconfig.json
  - lib/actions/weekly-briefs.ts
  - lib/member-form.ts
  - app/(guest)/guest/page.tsx
  - lib/actions/keynote.ts
  - .github/prompts/spectra-drift.prompt.md
  - .github/skills/spectra-debug/SKILL.md
  - public/globe.svg
  - app/(admin)/admin/guests/guest-visit-form.tsx
  - AGENTS.md
  - app/(guest)/guest/members/page.tsx
  - public/file.svg
  - components/slides/index.tsx
  - lib/presentation/viewer.tsx
  - supabase/migrations/006_member_module.sql
  - .opencode/commands/spectra-audit.md
  - .github/skills/spectra-apply/SKILL.md
  - app/(member)/dashboard/gains/page.tsx
  - .opencode/commands/spectra-drift.md
  - supabase/migrations/002_auth_hook.sql
  - supabase/migrations/003_admin_backend_patch.sql
  - postcss.config.mjs
  - .opencode/skills/spectra-apply/SKILL.md
  - app/(admin)/admin/members/member-form.tsx
  - vitest.config.ts
  - app/(admin)/admin/import/page.tsx
  - .github/skills/spectra-ask/SKILL.md
  - lib/actions/member-portal.ts
  - .opencode/skills/spectra-audit/SKILL.md
  - playwright.config.ts
  - public/vercel.svg
  - public/window.svg
  - .opencode/skills/spectra-drift/SKILL.md
  - lib/guest-portal.ts
  - app/(member)/dashboard/page.tsx
  - app/(guest)/layout.tsx
  - .opencode/skills/spectra-ask/SKILL.md
  - lib/supabase/client.ts
  - next.config.ts
  - SR_ALIGNMENT_PATCH.md
  - components/slides/shared.tsx
  - lib/actions/members.ts
  - eslint.config.mjs
  - app/(marketing)/page.tsx
  - app/(admin)/admin/awards/page.tsx
  - lib/access-control.ts
  - .opencode/skills/spectra-discuss/SKILL.md
  - lib/actions/one-on-ones.ts
  - components/landing/hero.tsx
  - package.json
  - app/(guest)/guest/content/page.tsx
  - .opencode/commands/spectra-apply.md
  - GEMINI.md
  - app/(admin)/admin/settings/page.tsx
  - app/(auth)/login/page.tsx
  - app/(admin)/admin/weekly-briefs/page.tsx
  - .github/prompts/spectra-debug.prompt.md
  - app/(auth)/error/page.tsx
  - lib/member-portal-policy.ts
  - lib/actions/guest-portal.ts
  - .opencode/commands/spectra-archive.md
  - app/(guest)/guest/prepare/page.tsx
  - components/member/gains-form.tsx
  - app/presentation/[week-date]/page.tsx
  - .github/skills/spectra-drift/SKILL.md
  - .github/prompts/spectra-ask.prompt.md
  - lib/auth/session-role.ts
  - lib/actions/vp-report.ts
  - lib/auth/access-control.ts
  - .github/skills/spectra-propose/SKILL.md
  - app/(admin)/admin/presentations/[id]/page.tsx
  - app/(admin)/admin/members/page.tsx
  - app/(admin)/admin/members/new/page.tsx
  - app/(member)/dashboard/directory/page.tsx
  - app/(member)/dashboard/contacts-circle/page.tsx
  - lib/actions/auth.ts
  - lib/admin-workflows.ts
  - components/ui/button.tsx
  - app/(member)/dashboard/report/page.tsx
  - app/(admin)/admin/guests/create/route.ts
  - app/(member)/dashboard/brief/page.tsx
  - lib/supabase/server.ts
  - app/(admin)/admin/members/[id]/page.tsx
  - .opencode/skills/spectra-propose/SKILL.md
  - components/ui/card.tsx
  - .opencode/commands/spectra-discuss.md
  - lib/presentation/slide-order.ts
  - app/(member)/dashboard/weekly/page.tsx
  - lib/presentation/types.ts
  - .opencode/skills/spectra-ingest/SKILL.md
tests:
  - lib/admin-workflows.test.ts
  - e2e/admin-member.spec.ts
  - lib/member-portal-policy.test.ts
  - lib/one-on-one.test.ts
  - lib/access-control.test.ts
  - lib/members.test.ts
  - lib/presentation-logic.test.ts
  - lib/auth/access-control.test.ts
  - lib/guest-portal.test.ts
-->