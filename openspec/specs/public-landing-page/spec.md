# public-landing-page Specification

## Purpose

TBD - created by archiving change 'landing-page'. Update Purpose after archive.

## Requirements

### Requirement: Public landing page

The system SHALL expose a public homepage at `/` that introduces BNI 華AI分會, presents core chapter value, and routes visitors toward login or inquiry actions.

#### Scenario: Visitor opens the homepage
- **WHEN** an unauthenticated visitor requests `/`
- **THEN** the system MUST render the public landing page without redirecting to login

#### Scenario: Visitor reviews core sections
- **WHEN** the landing page finishes loading
- **THEN** the system MUST show hero, stats, features, and CTA sections in that order with Traditional Chinese marketing copy

##### Example:
- **GIVEN** viewport width `1440px`
- **WHEN** visitor opens `/`
- **THEN** page section order is `hero -> stats -> features -> cta` and each section shows Traditional Chinese copy

#### Scenario: Visitor uses primary actions
- **WHEN** the visitor clicks the header login button or the final join CTA
- **THEN** the system MUST route the login action to `/login` and the join action to `mailto:huaai@bni.com.tw`

#### Scenario: Visitor views the page on mobile
- **WHEN** the landing page is rendered on a viewport narrower than 768 pixels
- **THEN** the system MUST collapse the section layouts to a readable single-column presentation without horizontal scrolling

<!-- @trace
source: landing-page
updated: 2026-06-02
code:
  - public/next.svg
  - .github/prompts/spectra-drift.prompt.md
  - lib/access-control.ts
  - next.config.ts
  - app/(admin)/admin/awards/page.tsx
  - .spectra.yaml
  - .github/skills/spectra-ask/SKILL.md
  - eslint.config.mjs
  - lib/supabase/server.ts
  - supabase/migrations/004_chapter_week_locks.sql
  - app/(admin)/admin/presentations/[id]/page.tsx
  - app/(admin)/layout.tsx
  - components/landing/stats.tsx
  - app/(admin)/admin/presentations/page.tsx
  - app/globals.css
  - app/(admin)/admin/page.tsx
  - lib/actions/auth.ts
  - app/(auth)/login/page.tsx
  - lib/actions/admin-common.ts
  - .opencode/skills/spectra-debug/SKILL.md
  - .opencode/skills/spectra-discuss/SKILL.md
  - .github/skills/spectra-ingest/SKILL.md
  - app/(member)/dashboard/page.tsx
  - app/(admin)/admin/weekly-briefs/page.tsx
  - public/file.svg
  - public/globe.svg
  - .opencode/commands/spectra-apply.md
  - supabase/config.toml
  - .opencode/skills/spectra-ask/SKILL.md
  - .opencode/skills/spectra-drift/SKILL.md
  - app/(member)/dashboard/weekly/page.tsx
  - supabase/migrations/002_auth_hook.sql
  - app/(guest)/guest/content/page.tsx
  - .github/prompts/spectra-apply.prompt.md
  - .opencode/skills/spectra-ingest/SKILL.md
  - .github/prompts/spectra-debug.prompt.md
  - components/ui/button.tsx
  - .github/prompts/spectra-ingest.prompt.md
  - public/vercel.svg
  - .github/prompts/spectra-propose.prompt.md
  - lib/actions/vp-report.ts
  - app/auth/email-link/route.ts
  - SR_EXECUTION_OBJECTIVE.md
  - lib/admin-workflows.ts
  - app/(guest)/guest/prepare/page.tsx
  - .opencode/commands/spectra-ingest.md
  - .opencode/commands/spectra-propose.md
  - .opencode/commands/spectra-audit.md
  - playwright.config.ts
  - .github/prompts/spectra-commit.prompt.md
  - .opencode/skills/spectra-audit/SKILL.md
  - AGENTS.md
  - lib/member-portal-policy.ts
  - app/(auth)/layout.tsx
  - .github/skills/spectra-commit/SKILL.md
  - .opencode/commands/spectra-ask.md
  - .opencode/skills/spectra-archive/SKILL.md
  - middleware.ts
  - .github/skills/spectra-debug/SKILL.md
  - PHASE_A_VERIFICATION.md
  - app/auth/callback/route.ts
  - app/layout.tsx
  - app/(guest)/guest/members/page.tsx
  - .opencode/skills/spectra-propose/SKILL.md
  - .cursorrules
  - supabase/migrations/005_guest_portal.sql
  - postcss.config.mjs
  - lib/supabase/client.ts
  - .github/prompts/spectra-ask.prompt.md
  - lib/actions/guests.ts
  - lib/actions/weekly-briefs.ts
  - app/(member)/dashboard/brief/page.tsx
  - public/window.svg
  - components/landing/features.tsx
  - SR_ALIGNMENT_PATCH.md
  - .opencode/commands/spectra-discuss.md
  - app/(admin)/admin/submission/page.tsx
  - GEMINI.md
  - app/(marketing)/layout.tsx
  - lib/actions/presentations.ts
  - components/landing/hero.tsx
  - lib/actions/guest-portal.ts
  - .opencode/commands/spectra-archive.md
  - tsconfig.json
  - app/(member)/dashboard/directory/page.tsx
  - .github/prompts/spectra-discuss.prompt.md
  - .opencode/commands/spectra-commit.md
  - .github/skills/spectra-archive/SKILL.md
  - README.md
  - app/(guest)/layout.tsx
  - app/(admin)/admin/members/page.tsx
  - supabase/migrations/003_admin_backend_patch.sql
  - app/(admin)/admin/guests/page.tsx
  - app/(admin)/admin/keynote/page.tsx
  - app/(auth)/error/page.tsx
  - lib/actions/member-portal.ts
  - .github/skills/spectra-audit/SKILL.md
  - app/(admin)/admin/guests/guest-visit-form.tsx
  - .github/skills/spectra-drift/SKILL.md
  - lib/guest-portal.ts
  - ui-mockup-member-v3.html
  - lib/auth/access-control.ts
  - app/(marketing)/page.tsx
  - package.json
  - app/(guest)/guest/page.tsx
  - app/favicon.ico
  - .github/skills/spectra-discuss/SKILL.md
  - app/(member)/dashboard/report/page.tsx
  - .github/skills/spectra-apply/SKILL.md
  - lib/supabase/types.ts
  - .github/prompts/spectra-archive.prompt.md
  - .github/skills/spectra-propose/SKILL.md
  - lib/actions/awards.ts
  - .opencode/commands/spectra-debug.md
  - app/(admin)/admin/vp-report/vp-report-form.tsx
  - CLAUDE.md
  - lib/actions/keynote.ts
  - components/ui/card.tsx
  - .github/prompts/spectra-audit.prompt.md
  - app/(admin)/admin/vp-report/page.tsx
  - vitest.config.ts
  - .opencode/commands/spectra-drift.md
  - app/(member)/layout.tsx
  - app/(admin)/admin/presentation/page.tsx
  - app/(admin)/admin/guests/create/route.ts
  - .opencode/skills/spectra-commit/SKILL.md
  - components/landing/cta.tsx
  - .opencode/skills/spectra-apply/SKILL.md
  - app/presentation/[week-date]/page.tsx
tests:
  - e2e/admin-member.spec.ts
  - lib/auth/access-control.test.ts
  - lib/access-control.test.ts
  - lib/member-portal-policy.test.ts
  - lib/admin-workflows.test.ts
  - lib/guest-portal.test.ts
-->