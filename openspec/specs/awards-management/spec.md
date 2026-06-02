# awards-management Specification

## Purpose

TBD - created by archiving change 'admin-backend'. Update Purpose after archive.

## Requirements

### Requirement: Awards management

The system SHALL let officers manage multiple award records for the same meeting week.

#### Scenario: Officer adds an award
- **WHEN** an officer selects a recipient, chooses an award type, and saves a description for the selected week
- **THEN** the system MUST create a weekly_awards row and show it in the weekly awards list

##### Example:
- **GIVEN** week `2026-06-01` has no `visitor_award`
- **WHEN** officer selects recipient `m-018`, type `visitor_award`, description `帶來2位來賓`
- **THEN** new `weekly_awards` row appears in that week's award list

#### Scenario: Officer edits an award
- **WHEN** an officer changes the recipient, award type, or description for an existing weekly award
- **THEN** the system MUST persist the updated values and keep the award associated with the same week

##### Example:
- **GIVEN** award `a-001` belongs to `2026-06-01`
- **WHEN** officer changes description from `帶來1位來賓` to `帶來2位來賓`
- **THEN** row `a-001` updates and still belongs to week `2026-06-01`

#### Scenario: Officer deletes a single award
- **WHEN** an officer removes one award from the weekly awards list
- **THEN** the system MUST delete only that weekly_awards row and leave other awards for the week untouched

##### Example:
- **GIVEN** week `2026-06-01` has awards `a-001`, `a-002`
- **WHEN** officer deletes `a-001`
- **THEN** `a-002` remains and only `a-001` is removed

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