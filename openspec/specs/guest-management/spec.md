# guest-management Specification

## Purpose

TBD - created by archiving change 'admin-backend'. Update Purpose after archive.

## Requirements

### Requirement: Guest management

The system SHALL let officers manage guest identities and guest visit records for each meeting week while distinguishing new and returning guests.

#### Scenario: Officer adds a first-time guest visit
- **WHEN** an officer creates a guest and records their first visit for a selected week
- **THEN** the system MUST create the guest identity, create a guest_visits record with visit_number 1, and label the guest as new

#### Scenario: Officer records a returning guest visit
- **WHEN** an officer creates or edits a guest visit for someone who has visited before
- **THEN** the system MUST reuse the guest identity, increment or preserve the visit_number, and label the visit as returning

##### Example:
- **GIVEN** guest `g-020` has prior visits with max `visit_number=2`
- **WHEN** officer schedules the same guest for `2026-06-08`
- **THEN** new `guest_visits` row uses `visit_number=3` and badge shows returning

#### Scenario: Officer switches between week tabs
- **WHEN** an officer changes between the 本週來賓 and 下週來賓 tabs
- **THEN** the system MUST filter guest visit cards by the matching week_date and preserve each guest visit classification badge

##### Example:
- **GIVEN** `2026-06-01` has 5 guests and `2026-06-08` has 3 guests
- **WHEN** officer switches tab from 本週 to 下週
- **THEN** card list changes from 5 to 3 rows and each row keeps new/returning badge

#### Scenario: Officer updates guest details
- **WHEN** an officer edits guest profile or visit details such as specialty, referrer, self_intro, or feedback
- **THEN** the system MUST persist the changes and refresh the guest card preview for the selected week

##### Example:
- **GIVEN** visit `gv-300` has `self_intro='初次來訪'`
- **WHEN** officer updates it to `對AI合作有興趣`
- **THEN** `gv-300.self_intro` is updated and guest card preview shows the new text

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