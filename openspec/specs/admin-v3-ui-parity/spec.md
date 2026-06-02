# admin-v3-ui-parity Specification

## Purpose

TBD - created by archiving change 'uiux-v3-alignment'. Update Purpose after archive.

## Requirements

### Requirement: Admin v3 navigation parity

The system SHALL align the officer/admin navigation and page hierarchy with `ui-mockup-admin-v3.html`, while preventing unfinished sections from appearing as broken or misleading functionality.

#### Scenario: Admin opens the v3 shell
- **WHEN** an authenticated admin opens the admin portal
- **THEN** the system MUST expose the v3 primary navigation semantics for overview, submission, presentation, keynote, guests, members, and any unfinished sections as explicit placeholders or limited routes instead of broken links

#### Scenario: Admin opens unfinished import or settings
- **WHEN** an admin opens a mockup section whose underlying functionality is not yet complete
- **THEN** the system MUST render a safe placeholder or restricted state explaining the current implementation boundary

##### Example:
- **GIVEN** the admin v3 sidebar includes `資料匯入` and `系統設定`
- **WHEN** `/admin/import` or `/admin/settings` is not fully implemented yet
- **THEN** the route still opens successfully and explains the current boundary instead of returning 404 or an empty page


<!-- @trace
source: uiux-v3-alignment
updated: 2026-06-02
code:
  - lib/one-on-one.ts
  - lib/auth/session-role.ts
  - app/(admin)/admin/page.tsx
  - .opencode/skills/spectra-audit/SKILL.md
  - app/(member)/dashboard/profile/page.tsx
  - .opencode/commands/spectra-apply.md
  - app/(admin)/admin/members/member-form.tsx
  - .opencode/skills/spectra-commit/SKILL.md
  - .opencode/skills/spectra-apply/SKILL.md
  - app/(member)/dashboard/page.tsx
  - app/(member)/dashboard/top-clients/page.tsx
  - app/(member)/dashboard/one-on-one/page.tsx
  - app/(admin)/admin/submission/page.tsx
  - lib/actions/members.ts
  - lib/actions/admin-common.ts
  - app/(admin)/admin/members/new/page.tsx
  - .opencode/commands/spectra-debug.md
  - .opencode/commands/spectra-discuss.md
  - app/(member)/dashboard/contacts-circle/page.tsx
  - lib/supabase/types.ts
  - .opencode/commands/spectra-archive.md
  - .opencode/commands/spectra-ingest.md
  - .opencode/commands/spectra-propose.md
  - app/(admin)/admin/guests/page.tsx
  - app/(admin)/admin/keynote/page.tsx
  - .opencode/commands/spectra-drift.md
  - app/(admin)/admin/settings/page.tsx
  - .opencode/skills/spectra-drift/SKILL.md
  - lib/member-form.ts
  - app/(admin)/layout.tsx
  - app/(member)/dashboard/events/page.tsx
  - .opencode/commands/spectra-ask.md
  - app/(member)/layout.tsx
  - app/(admin)/admin/members/[id]/page.tsx
  - .cursorrules
  - middleware.ts
  - app/(admin)/admin/presentation/page.tsx
  - .opencode/skills/spectra-archive/SKILL.md
  - app/(member)/dashboard/report/page.tsx
  - app/(member)/dashboard/directory/page.tsx
  - app/(member)/dashboard/ai/page.tsx
  - app/(admin)/admin/import/page.tsx
  - app/(admin)/admin/members/page.tsx
  - lib/actions/one-on-ones.ts
  - .opencode/skills/spectra-ask/SKILL.md
  - .opencode/skills/spectra-debug/SKILL.md
  - .opencode/skills/spectra-ingest/SKILL.md
  - tmp-admin-switch-check.png
  - .opencode/skills/spectra-discuss/SKILL.md
  - .opencode/skills/spectra-propose/SKILL.md
  - lib/actions/member-portal.ts
  - app/(member)/dashboard/training/page.tsx
  - app/(member)/dashboard/gains/page.tsx
  - supabase/migrations/006_member_module.sql
  - .opencode/commands/spectra-commit.md
  - .opencode/commands/spectra-audit.md
tests:
  - lib/one-on-one.test.ts
  - e2e/admin-member.spec.ts
  - lib/members.test.ts
-->

---
### Requirement: Admin wired pages expose real operational state

The system SHALL ensure that wired admin pages show summary states, counts, and actions based on real backend data and route handlers.

#### Scenario: Admin opens overview or submission
- **WHEN** an admin opens `/admin` or `/admin/submission`
- **THEN** the system MUST show real submission or chapter status derived from current data instead of static mock values

#### Scenario: Admin opens presentation or guests
- **WHEN** an admin opens `/admin/presentation` or `/admin/guests`
- **THEN** the system MUST expose actions and statuses that map to actual backend flows, including slide or guest readiness state

<!-- @trace
source: uiux-v3-alignment
updated: 2026-06-02
code:
  - lib/one-on-one.ts
  - lib/auth/session-role.ts
  - app/(admin)/admin/page.tsx
  - .opencode/skills/spectra-audit/SKILL.md
  - app/(member)/dashboard/profile/page.tsx
  - .opencode/commands/spectra-apply.md
  - app/(admin)/admin/members/member-form.tsx
  - .opencode/skills/spectra-commit/SKILL.md
  - .opencode/skills/spectra-apply/SKILL.md
  - app/(member)/dashboard/page.tsx
  - app/(member)/dashboard/top-clients/page.tsx
  - app/(member)/dashboard/one-on-one/page.tsx
  - app/(admin)/admin/submission/page.tsx
  - lib/actions/members.ts
  - lib/actions/admin-common.ts
  - app/(admin)/admin/members/new/page.tsx
  - .opencode/commands/spectra-debug.md
  - .opencode/commands/spectra-discuss.md
  - app/(member)/dashboard/contacts-circle/page.tsx
  - lib/supabase/types.ts
  - .opencode/commands/spectra-archive.md
  - .opencode/commands/spectra-ingest.md
  - .opencode/commands/spectra-propose.md
  - app/(admin)/admin/guests/page.tsx
  - app/(admin)/admin/keynote/page.tsx
  - .opencode/commands/spectra-drift.md
  - app/(admin)/admin/settings/page.tsx
  - .opencode/skills/spectra-drift/SKILL.md
  - lib/member-form.ts
  - app/(admin)/layout.tsx
  - app/(member)/dashboard/events/page.tsx
  - .opencode/commands/spectra-ask.md
  - app/(member)/layout.tsx
  - app/(admin)/admin/members/[id]/page.tsx
  - .cursorrules
  - middleware.ts
  - app/(admin)/admin/presentation/page.tsx
  - .opencode/skills/spectra-archive/SKILL.md
  - app/(member)/dashboard/report/page.tsx
  - app/(member)/dashboard/directory/page.tsx
  - app/(member)/dashboard/ai/page.tsx
  - app/(admin)/admin/import/page.tsx
  - app/(admin)/admin/members/page.tsx
  - lib/actions/one-on-ones.ts
  - .opencode/skills/spectra-ask/SKILL.md
  - .opencode/skills/spectra-debug/SKILL.md
  - .opencode/skills/spectra-ingest/SKILL.md
  - tmp-admin-switch-check.png
  - .opencode/skills/spectra-discuss/SKILL.md
  - .opencode/skills/spectra-propose/SKILL.md
  - lib/actions/member-portal.ts
  - app/(member)/dashboard/training/page.tsx
  - app/(member)/dashboard/gains/page.tsx
  - supabase/migrations/006_member_module.sql
  - .opencode/commands/spectra-commit.md
  - .opencode/commands/spectra-audit.md
tests:
  - lib/one-on-one.test.ts
  - e2e/admin-member.spec.ts
  - lib/members.test.ts
-->