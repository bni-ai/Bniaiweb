# member-v3-ui-parity Specification

## Purpose

TBD - created by archiving change 'uiux-v3-alignment'. Update Purpose after archive.

## Requirements

### Requirement: Member v3 navigation parity

The system SHALL align the authenticated member navigation and page hierarchy with `ui-mockup-member-v3.html`, while keeping unfinished capabilities in a clearly limited state.

#### Scenario: Member opens the v3 shell
- **WHEN** an authenticated member opens the member portal
- **THEN** the system MUST expose the v3 primary navigation semantics for dashboard, report, profile, directory, and any unfinished sections as explicit limited or coming-soon entries instead of broken links

#### Scenario: Member opens an unfinished v3 section
- **WHEN** a member selects a v3 mockup section whose underlying module is not complete yet
- **THEN** the system MUST render a safe placeholder or restricted state explaining that the capability is still in progress

##### Example:
- **GIVEN** member v3 navigation includes `活動` and `AI 助手`
- **WHEN** the underlying `events` or `ai` module is not implemented yet
- **THEN** clicking the entry opens a non-404 placeholder page that clearly states the feature is still in progress


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
### Requirement: Member v3 wired pages expose real status

The system SHALL ensure that member pages already backed by real data show states, summaries, and calls to action consistent with the v3 mockup structure.

#### Scenario: Member opens dashboard or weekly brief
- **WHEN** a member opens `/dashboard` or `/dashboard/report`
- **THEN** the system MUST show current-week summary or deadline/status information derived from real data instead of static mock values

#### Scenario: Member opens directory details
- **WHEN** a member opens the directory page and selects another member
- **THEN** the system MUST show a profile detail view or modal that reflects real member data and does not expose unfinished one-on-one actions as available when the module is not complete

##### Example:
- **GIVEN** `/dashboard/directory` shows member `王小明`
- **WHEN** the signed-in member opens `王小明` detail view while one-on-one booking is not complete
- **THEN** the view shows real profile data and any one-on-one CTA is disabled or marked as in progress instead of linking to a broken route

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