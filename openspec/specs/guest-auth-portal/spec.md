# guest-auth-portal Specification

## Purpose

TBD - created by archiving change 'guest-portal'. Update Purpose after archive.

## Requirements

### Requirement: Authenticated guest dashboard
The system SHALL route authenticated invited guests to a guest dashboard that shows personalized invitation context and preparation guidance.

#### Scenario: Invited guest logs in
- **WHEN** an authenticated user email does not match `members.email` but matches `guests.email`
- **THEN** the system MUST route the user to `/guest` and show their guest dashboard instead of `/error`

##### Example: guest email routing
- **GIVEN** `guests.email=guest@example.com` and no member exists for `guest@example.com`
- **WHEN** that email completes authentication
- **THEN** callback sets guest access and redirects to `/guest`

#### Scenario: Guest sees inviter and visit information
- **WHEN** a logged-in guest has a guest visit with an inviter member
- **THEN** the dashboard MUST show inviter name, selected visit week, guest status, and visit number badge

##### Example: inviter and visit badge
- **GIVEN** guest `g-001` is invited by member `王小明` for week `2026-06-08` with `visit_number=2`
- **WHEN** that guest opens `/guest` after login
- **THEN** the dashboard shows inviter `王小明`, week `2026-06-08`, and returning guest badge

#### Scenario: Guest sees fifteen-second preparation guidance
- **WHEN** a logged-in guest opens the preparation page
- **THEN** the system MUST show prompts for name, company, specialty, target referral, and one clear ask suitable for a fifteen-second introduction

##### Example: fifteen-second prompt fields
- **GIVEN** guest `g-001` opens `/guest/prepare`
- **WHEN** preparation guidance is rendered
- **THEN** the page shows fields for `姓名`, `公司`, `專業`, `希望被引薦的對象`, and `一句明確需求`


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
### Requirement: Guest limited member directory
The system SHALL allow authenticated guests to view a limited member directory while excluding member-only actions.

#### Scenario: Guest opens limited member directory
- **WHEN** a guest opens `/guest/members`
- **THEN** the system MUST show public member fields such as name, company, and specialty and MUST NOT show one-on-one booking, member editing, or admin actions

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