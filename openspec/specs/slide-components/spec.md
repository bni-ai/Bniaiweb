# slide-components Specification

## Purpose

TBD - created by archiving change 'presentation-engine'. Update Purpose after archive.

## Requirements

### Requirement: Slide components

The system SHALL provide typed slide components for the seven planned presentation segment types and feed them with pre-fetched data props only.

#### Scenario: Cover slide renders chapter context
- **WHEN** the viewer renders a cover slide entry
- **THEN** the system MUST show the chapter name, week date, and meeting time within the shared 16:9 presentation frame

#### Scenario: Member and keynote slides render weekly content
- **WHEN** the viewer renders member or keynote slide entries with pre-fetched records
- **THEN** the system MUST display the configured profile, brief, topic, outline, and image data without issuing database calls inside the slide components

##### Example:
- **GIVEN** prefetched member brief and keynote props are passed into slide components
- **WHEN** `MemberSlide` and `KeynoteSlide` render
- **THEN** UI shows those prop values and no in-component DB fetch is executed

#### Scenario: Guest, award, team, and VP report slides render meeting context
- **WHEN** the viewer renders guest, award, team, or vp_report slide entries with pre-fetched records
- **THEN** the system MUST display their mapped fields inside the same shared visual frame and typography system

##### Example:
- **GIVEN** viewer has prefetched `guest_visits`, `weekly_awards`, and `weekly_vp_reports` for `2026-06-01`
- **WHEN** corresponding slide components render
- **THEN** each slide displays mapped fields (guest visit badge, award info, VP metrics) within shared 16:9 frame

#### Scenario: Slide content exceeds the frame
- **WHEN** a slide receives long text or many display elements
- **THEN** the system MUST clamp or wrap the content so the slide remains readable within the 16:9 layout

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