# one-on-one-form Specification

## Purpose

TBD - created by archiving change 'member-module'. Update Purpose after archive.

## Requirements

### Requirement: One-on-one form

The system SHALL let members manage availability and create one-on-one bookings that generate a Jitsi meeting room for valid timeslots.

#### Scenario: Member sets availability
- **WHEN** a member saves one or more availability windows with day_of_week, start_time, and end_time
- **THEN** the system MUST store the windows for that member and show them in the one-on-one dashboard

##### Example:
- **GIVEN** member `m-010`
- **WHEN** member saves `day_of_week=3`, `start_time=10:00`, `end_time=11:00`
- **THEN** one row is stored in `member_availability` and appears in availability UI after refresh

#### Scenario: Member books an available timeslot
- **WHEN** a member selects another active member and chooses a timeslot within the invitee availability window
- **THEN** the system MUST create a pending one_on_ones record with inviter_id, invitee_id, scheduled_at, and a generated jitsi_room value

##### Example:
- **GIVEN** inviter `m-010` and invitee `m-026` with available slot `2026-06-04 10:00`
- **WHEN** inviter confirms booking for that slot
- **THEN** `one_on_ones` row is created with `status='pending'` and `jitsi_room` not null

#### Scenario: Booking conflict is rejected
- **WHEN** a member tries to book themselves, chooses a slot outside availability, or creates an overlapping booking for either participant
- **THEN** the system MUST reject the booking and show a validation error without creating a one_on_ones record

##### Example:
- **GIVEN** invitee `m-026` already has confirmed booking at `2026-06-04 10:00`
- **WHEN** another member tries to book `m-026` at the same time
- **THEN** API returns conflict error and no new `one_on_ones` row is inserted

#### Scenario: Member updates booking status
- **WHEN** a participant marks a booking as confirmed, completed, or cancelled
- **THEN** the system MUST persist the new status and continue showing the same Jitsi meeting link for that booking

##### Example:
- **GIVEN** booking `oo-1001` has `status='pending'` and `jitsi_room='abc123xyz'`
- **WHEN** invitee accepts and status changes to `confirmed`
- **THEN** row `oo-1001` stores `status='confirmed'` and keeps the same `jitsi_room`

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