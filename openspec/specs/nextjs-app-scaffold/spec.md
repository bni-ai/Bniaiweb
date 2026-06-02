# nextjs-app-scaffold Specification

## Purpose

TBD - created by archiving change 'app-foundation'. Update Purpose after archive.

## Requirements

### Requirement: Route Group Structure

The application SHALL use Next.js 15 App Router with four route groups: `(auth)` for unauthenticated pages, `(member)` for authenticated member pages, `(admin)` for admin-only pages, and `presentation` (ungrouped) for public slide viewing.

#### Scenario: Auth layout applied to login

- **WHEN** a request matches `/login` or `/error`
- **THEN** the system SHALL render the page using the `(auth)` group layout: centered card, no sidebar, no top navigation

#### Scenario: Member layout applied to dashboard

- **WHEN** a request matches `/dashboard`
- **THEN** the system SHALL render the page using the `(member)` group layout with a top navigation bar

#### Scenario: Admin layout applied to admin routes

- **WHEN** a request matches `/admin` or any path under `/admin/`
- **THEN** the system SHALL render the page using the `(admin)` group layout with a left sidebar matching `ui-mockup-admin-v3.html`

#### Scenario: Presentation route is layout-free

- **WHEN** a request matches `/presentation/[week-date]`
- **THEN** the system SHALL render the page fullscreen with no navigation chrome and no authentication requirement


<!-- @trace
source: app-foundation
updated: 2026-06-02
code:
  - supabase/migrations/005_guest_portal.sql
  - eslint.config.mjs
  - .github/prompts/spectra-ingest.prompt.md
  - .github/skills/spectra-ask/SKILL.md
  - app/(admin)/admin/submission/page.tsx
  - supabase/migrations/003_admin_backend_patch.sql
  - .github/skills/spectra-debug/SKILL.md
  - app/(admin)/admin/guests/guest-visit-form.tsx
  - lib/actions/member-portal.ts
  - app/(guest)/guest/prepare/page.tsx
  - components/ui/card.tsx
  - app/(admin)/admin/keynote/page.tsx
  - lib/actions/keynote.ts
  - ui-mockup-member-v3.html
  - app/(marketing)/page.tsx
  - .github/prompts/spectra-drift.prompt.md
  - .opencode/skills/spectra-discuss/SKILL.md
  - supabase/migrations/004_chapter_week_locks.sql
  - app/(auth)/layout.tsx
  - app/(admin)/admin/weekly-briefs/page.tsx
  - app/(member)/dashboard/report/page.tsx
  - app/(member)/dashboard/directory/page.tsx
  - app/(member)/layout.tsx
  - lib/actions/presentations.ts
  - app/(admin)/admin/members/page.tsx
  - app/(admin)/admin/awards/page.tsx
  - public/vercel.svg
  - app/globals.css
  - app/auth/email-link/route.ts
  - lib/actions/vp-report.ts
  - .opencode/commands/spectra-debug.md
  - app/presentation/[week-date]/page.tsx
  - .github/skills/spectra-archive/SKILL.md
  - .opencode/skills/spectra-archive/SKILL.md
  - .opencode/skills/spectra-drift/SKILL.md
  - .opencode/skills/spectra-ingest/SKILL.md
  - SR_EXECUTION_OBJECTIVE.md
  - middleware.ts
  - components/landing/stats.tsx
  - components/landing/cta.tsx
  - .opencode/skills/spectra-apply/SKILL.md
  - app/favicon.ico
  - .cursorrules
  - lib/access-control.ts
  - app/layout.tsx
  - .github/prompts/spectra-debug.prompt.md
  - .github/skills/spectra-propose/SKILL.md
  - .github/skills/spectra-apply/SKILL.md
  - AGENTS.md
  - vitest.config.ts
  - .github/skills/spectra-ingest/SKILL.md
  - app/(guest)/guest/page.tsx
  - .spectra.yaml
  - app/(member)/dashboard/page.tsx
  - .github/skills/spectra-audit/SKILL.md
  - app/(member)/dashboard/weekly/page.tsx
  - app/(admin)/admin/guests/create/route.ts
  - public/next.svg
  - tsconfig.json
  - components/landing/hero.tsx
  - app/auth/callback/route.ts
  - GEMINI.md
  - README.md
  - app/(admin)/admin/vp-report/page.tsx
  - app/(admin)/layout.tsx
  - .opencode/skills/spectra-debug/SKILL.md
  - lib/guest-portal.ts
  - lib/supabase/types.ts
  - lib/member-portal-policy.ts
  - app/(auth)/login/page.tsx
  - .github/prompts/spectra-propose.prompt.md
  - .opencode/skills/spectra-audit/SKILL.md
  - postcss.config.mjs
  - .opencode/commands/spectra-ingest.md
  - .github/skills/spectra-drift/SKILL.md
  - playwright.config.ts
  - .github/prompts/spectra-ask.prompt.md
  - components/ui/button.tsx
  - app/(admin)/admin/guests/page.tsx
  - lib/supabase/client.ts
  - public/window.svg
  - supabase/config.toml
  - app/(admin)/admin/page.tsx
  - app/(auth)/error/page.tsx
  - lib/auth/access-control.ts
  - .github/skills/spectra-commit/SKILL.md
  - .opencode/skills/spectra-ask/SKILL.md
  - PHASE_A_VERIFICATION.md
  - package.json
  - SR_ALIGNMENT_PATCH.md
  - lib/supabase/server.ts
  - .github/prompts/spectra-archive.prompt.md
  - lib/actions/auth.ts
  - .opencode/commands/spectra-archive.md
  - app/(admin)/admin/vp-report/vp-report-form.tsx
  - app/(admin)/admin/presentations/[id]/page.tsx
  - lib/admin-workflows.ts
  - components/landing/features.tsx
  - app/(guest)/layout.tsx
  - .opencode/commands/spectra-commit.md
  - next.config.ts
  - .opencode/commands/spectra-apply.md
  - app/(admin)/admin/presentation/page.tsx
  - .github/prompts/spectra-audit.prompt.md
  - .github/skills/spectra-discuss/SKILL.md
  - .opencode/commands/spectra-propose.md
  - .github/prompts/spectra-apply.prompt.md
  - .github/prompts/spectra-commit.prompt.md
  - lib/actions/admin-common.ts
  - .opencode/skills/spectra-propose/SKILL.md
  - app/(admin)/admin/presentations/page.tsx
  - app/(guest)/guest/members/page.tsx
  - app/(member)/dashboard/brief/page.tsx
  - .opencode/commands/spectra-ask.md
  - .opencode/commands/spectra-drift.md
  - .opencode/commands/spectra-discuss.md
  - app/(guest)/guest/content/page.tsx
  - CLAUDE.md
  - lib/actions/guests.ts
  - lib/actions/weekly-briefs.ts
  - .opencode/commands/spectra-audit.md
  - public/globe.svg
  - .github/prompts/spectra-discuss.prompt.md
  - public/file.svg
  - lib/actions/guest-portal.ts
  - .opencode/skills/spectra-commit/SKILL.md
  - supabase/migrations/002_auth_hook.sql
  - lib/actions/awards.ts
  - app/(marketing)/layout.tsx
tests:
  - lib/access-control.test.ts
  - e2e/admin-member.spec.ts
  - lib/admin-workflows.test.ts
  - lib/member-portal-policy.test.ts
  - lib/auth/access-control.test.ts
  - lib/guest-portal.test.ts
-->

---
### Requirement: Tailwind Design Tokens

The application SHALL define CSS custom properties in `app/globals.css` that establish the design system used across all components and all subsequent feature SRs.

Tokens: `--primary: #dc2626`, `--primary-fg: #ffffff`, `--surface: #ffffff`, `--surface-2: #f9fafb`, `--border: #e5e7eb`, `--text-1: #111827`, `--text-2: #6b7280`, `--radius-card: 8px`, `--radius-input: 6px`, `--radius-badge: 4px`. Font: Noto Sans TC loaded via `next/font/google` and applied to `<body>`.

#### Scenario: Tokens apply to all pages

- **WHEN** any page renders
- **THEN** elements referencing `var(--primary)` SHALL resolve to `#dc2626` and Noto Sans TC SHALL be the document default font


<!-- @trace
source: app-foundation
updated: 2026-06-02
code:
  - supabase/migrations/005_guest_portal.sql
  - eslint.config.mjs
  - .github/prompts/spectra-ingest.prompt.md
  - .github/skills/spectra-ask/SKILL.md
  - app/(admin)/admin/submission/page.tsx
  - supabase/migrations/003_admin_backend_patch.sql
  - .github/skills/spectra-debug/SKILL.md
  - app/(admin)/admin/guests/guest-visit-form.tsx
  - lib/actions/member-portal.ts
  - app/(guest)/guest/prepare/page.tsx
  - components/ui/card.tsx
  - app/(admin)/admin/keynote/page.tsx
  - lib/actions/keynote.ts
  - ui-mockup-member-v3.html
  - app/(marketing)/page.tsx
  - .github/prompts/spectra-drift.prompt.md
  - .opencode/skills/spectra-discuss/SKILL.md
  - supabase/migrations/004_chapter_week_locks.sql
  - app/(auth)/layout.tsx
  - app/(admin)/admin/weekly-briefs/page.tsx
  - app/(member)/dashboard/report/page.tsx
  - app/(member)/dashboard/directory/page.tsx
  - app/(member)/layout.tsx
  - lib/actions/presentations.ts
  - app/(admin)/admin/members/page.tsx
  - app/(admin)/admin/awards/page.tsx
  - public/vercel.svg
  - app/globals.css
  - app/auth/email-link/route.ts
  - lib/actions/vp-report.ts
  - .opencode/commands/spectra-debug.md
  - app/presentation/[week-date]/page.tsx
  - .github/skills/spectra-archive/SKILL.md
  - .opencode/skills/spectra-archive/SKILL.md
  - .opencode/skills/spectra-drift/SKILL.md
  - .opencode/skills/spectra-ingest/SKILL.md
  - SR_EXECUTION_OBJECTIVE.md
  - middleware.ts
  - components/landing/stats.tsx
  - components/landing/cta.tsx
  - .opencode/skills/spectra-apply/SKILL.md
  - app/favicon.ico
  - .cursorrules
  - lib/access-control.ts
  - app/layout.tsx
  - .github/prompts/spectra-debug.prompt.md
  - .github/skills/spectra-propose/SKILL.md
  - .github/skills/spectra-apply/SKILL.md
  - AGENTS.md
  - vitest.config.ts
  - .github/skills/spectra-ingest/SKILL.md
  - app/(guest)/guest/page.tsx
  - .spectra.yaml
  - app/(member)/dashboard/page.tsx
  - .github/skills/spectra-audit/SKILL.md
  - app/(member)/dashboard/weekly/page.tsx
  - app/(admin)/admin/guests/create/route.ts
  - public/next.svg
  - tsconfig.json
  - components/landing/hero.tsx
  - app/auth/callback/route.ts
  - GEMINI.md
  - README.md
  - app/(admin)/admin/vp-report/page.tsx
  - app/(admin)/layout.tsx
  - .opencode/skills/spectra-debug/SKILL.md
  - lib/guest-portal.ts
  - lib/supabase/types.ts
  - lib/member-portal-policy.ts
  - app/(auth)/login/page.tsx
  - .github/prompts/spectra-propose.prompt.md
  - .opencode/skills/spectra-audit/SKILL.md
  - postcss.config.mjs
  - .opencode/commands/spectra-ingest.md
  - .github/skills/spectra-drift/SKILL.md
  - playwright.config.ts
  - .github/prompts/spectra-ask.prompt.md
  - components/ui/button.tsx
  - app/(admin)/admin/guests/page.tsx
  - lib/supabase/client.ts
  - public/window.svg
  - supabase/config.toml
  - app/(admin)/admin/page.tsx
  - app/(auth)/error/page.tsx
  - lib/auth/access-control.ts
  - .github/skills/spectra-commit/SKILL.md
  - .opencode/skills/spectra-ask/SKILL.md
  - PHASE_A_VERIFICATION.md
  - package.json
  - SR_ALIGNMENT_PATCH.md
  - lib/supabase/server.ts
  - .github/prompts/spectra-archive.prompt.md
  - lib/actions/auth.ts
  - .opencode/commands/spectra-archive.md
  - app/(admin)/admin/vp-report/vp-report-form.tsx
  - app/(admin)/admin/presentations/[id]/page.tsx
  - lib/admin-workflows.ts
  - components/landing/features.tsx
  - app/(guest)/layout.tsx
  - .opencode/commands/spectra-commit.md
  - next.config.ts
  - .opencode/commands/spectra-apply.md
  - app/(admin)/admin/presentation/page.tsx
  - .github/prompts/spectra-audit.prompt.md
  - .github/skills/spectra-discuss/SKILL.md
  - .opencode/commands/spectra-propose.md
  - .github/prompts/spectra-apply.prompt.md
  - .github/prompts/spectra-commit.prompt.md
  - lib/actions/admin-common.ts
  - .opencode/skills/spectra-propose/SKILL.md
  - app/(admin)/admin/presentations/page.tsx
  - app/(guest)/guest/members/page.tsx
  - app/(member)/dashboard/brief/page.tsx
  - .opencode/commands/spectra-ask.md
  - .opencode/commands/spectra-drift.md
  - .opencode/commands/spectra-discuss.md
  - app/(guest)/guest/content/page.tsx
  - CLAUDE.md
  - lib/actions/guests.ts
  - lib/actions/weekly-briefs.ts
  - .opencode/commands/spectra-audit.md
  - public/globe.svg
  - .github/prompts/spectra-discuss.prompt.md
  - public/file.svg
  - lib/actions/guest-portal.ts
  - .opencode/skills/spectra-commit/SKILL.md
  - supabase/migrations/002_auth_hook.sql
  - lib/actions/awards.ts
  - app/(marketing)/layout.tsx
tests:
  - lib/access-control.test.ts
  - e2e/admin-member.spec.ts
  - lib/admin-workflows.test.ts
  - lib/member-portal-policy.test.ts
  - lib/auth/access-control.test.ts
  - lib/guest-portal.test.ts
-->

---
### Requirement: Shared UI Primitives

The application SHALL provide `components/ui/button.tsx` and `components/ui/card.tsx` as typed React components usable in all feature SRs without modification.

`Button` SHALL accept a `variant` prop with values `primary` (red fill, white text), `secondary` (white fill, border), `ghost` (no border, transparent). `Card` SHALL render a white container with `var(--radius-card)` corner radius and `1px solid var(--border)` border.

#### Scenario: Button variant renders correctly

- **WHEN** `<Button variant="primary">` is rendered
- **THEN** the button SHALL have background `#dc2626` and white text

#### Scenario: Button variant secondary renders correctly

- **WHEN** `<Button variant="secondary">` is rendered
- **THEN** the button SHALL have white background, `var(--border)` border, and `var(--text-1)` text color

<!-- @trace
source: app-foundation
updated: 2026-06-02
code:
  - supabase/migrations/005_guest_portal.sql
  - eslint.config.mjs
  - .github/prompts/spectra-ingest.prompt.md
  - .github/skills/spectra-ask/SKILL.md
  - app/(admin)/admin/submission/page.tsx
  - supabase/migrations/003_admin_backend_patch.sql
  - .github/skills/spectra-debug/SKILL.md
  - app/(admin)/admin/guests/guest-visit-form.tsx
  - lib/actions/member-portal.ts
  - app/(guest)/guest/prepare/page.tsx
  - components/ui/card.tsx
  - app/(admin)/admin/keynote/page.tsx
  - lib/actions/keynote.ts
  - ui-mockup-member-v3.html
  - app/(marketing)/page.tsx
  - .github/prompts/spectra-drift.prompt.md
  - .opencode/skills/spectra-discuss/SKILL.md
  - supabase/migrations/004_chapter_week_locks.sql
  - app/(auth)/layout.tsx
  - app/(admin)/admin/weekly-briefs/page.tsx
  - app/(member)/dashboard/report/page.tsx
  - app/(member)/dashboard/directory/page.tsx
  - app/(member)/layout.tsx
  - lib/actions/presentations.ts
  - app/(admin)/admin/members/page.tsx
  - app/(admin)/admin/awards/page.tsx
  - public/vercel.svg
  - app/globals.css
  - app/auth/email-link/route.ts
  - lib/actions/vp-report.ts
  - .opencode/commands/spectra-debug.md
  - app/presentation/[week-date]/page.tsx
  - .github/skills/spectra-archive/SKILL.md
  - .opencode/skills/spectra-archive/SKILL.md
  - .opencode/skills/spectra-drift/SKILL.md
  - .opencode/skills/spectra-ingest/SKILL.md
  - SR_EXECUTION_OBJECTIVE.md
  - middleware.ts
  - components/landing/stats.tsx
  - components/landing/cta.tsx
  - .opencode/skills/spectra-apply/SKILL.md
  - app/favicon.ico
  - .cursorrules
  - lib/access-control.ts
  - app/layout.tsx
  - .github/prompts/spectra-debug.prompt.md
  - .github/skills/spectra-propose/SKILL.md
  - .github/skills/spectra-apply/SKILL.md
  - AGENTS.md
  - vitest.config.ts
  - .github/skills/spectra-ingest/SKILL.md
  - app/(guest)/guest/page.tsx
  - .spectra.yaml
  - app/(member)/dashboard/page.tsx
  - .github/skills/spectra-audit/SKILL.md
  - app/(member)/dashboard/weekly/page.tsx
  - app/(admin)/admin/guests/create/route.ts
  - public/next.svg
  - tsconfig.json
  - components/landing/hero.tsx
  - app/auth/callback/route.ts
  - GEMINI.md
  - README.md
  - app/(admin)/admin/vp-report/page.tsx
  - app/(admin)/layout.tsx
  - .opencode/skills/spectra-debug/SKILL.md
  - lib/guest-portal.ts
  - lib/supabase/types.ts
  - lib/member-portal-policy.ts
  - app/(auth)/login/page.tsx
  - .github/prompts/spectra-propose.prompt.md
  - .opencode/skills/spectra-audit/SKILL.md
  - postcss.config.mjs
  - .opencode/commands/spectra-ingest.md
  - .github/skills/spectra-drift/SKILL.md
  - playwright.config.ts
  - .github/prompts/spectra-ask.prompt.md
  - components/ui/button.tsx
  - app/(admin)/admin/guests/page.tsx
  - lib/supabase/client.ts
  - public/window.svg
  - supabase/config.toml
  - app/(admin)/admin/page.tsx
  - app/(auth)/error/page.tsx
  - lib/auth/access-control.ts
  - .github/skills/spectra-commit/SKILL.md
  - .opencode/skills/spectra-ask/SKILL.md
  - PHASE_A_VERIFICATION.md
  - package.json
  - SR_ALIGNMENT_PATCH.md
  - lib/supabase/server.ts
  - .github/prompts/spectra-archive.prompt.md
  - lib/actions/auth.ts
  - .opencode/commands/spectra-archive.md
  - app/(admin)/admin/vp-report/vp-report-form.tsx
  - app/(admin)/admin/presentations/[id]/page.tsx
  - lib/admin-workflows.ts
  - components/landing/features.tsx
  - app/(guest)/layout.tsx
  - .opencode/commands/spectra-commit.md
  - next.config.ts
  - .opencode/commands/spectra-apply.md
  - app/(admin)/admin/presentation/page.tsx
  - .github/prompts/spectra-audit.prompt.md
  - .github/skills/spectra-discuss/SKILL.md
  - .opencode/commands/spectra-propose.md
  - .github/prompts/spectra-apply.prompt.md
  - .github/prompts/spectra-commit.prompt.md
  - lib/actions/admin-common.ts
  - .opencode/skills/spectra-propose/SKILL.md
  - app/(admin)/admin/presentations/page.tsx
  - app/(guest)/guest/members/page.tsx
  - app/(member)/dashboard/brief/page.tsx
  - .opencode/commands/spectra-ask.md
  - .opencode/commands/spectra-drift.md
  - .opencode/commands/spectra-discuss.md
  - app/(guest)/guest/content/page.tsx
  - CLAUDE.md
  - lib/actions/guests.ts
  - lib/actions/weekly-briefs.ts
  - .opencode/commands/spectra-audit.md
  - public/globe.svg
  - .github/prompts/spectra-discuss.prompt.md
  - public/file.svg
  - lib/actions/guest-portal.ts
  - .opencode/skills/spectra-commit/SKILL.md
  - supabase/migrations/002_auth_hook.sql
  - lib/actions/awards.ts
  - app/(marketing)/layout.tsx
tests:
  - lib/access-control.test.ts
  - e2e/admin-member.spec.ts
  - lib/admin-workflows.test.ts
  - lib/member-portal-policy.test.ts
  - lib/auth/access-control.test.ts
  - lib/guest-portal.test.ts
-->