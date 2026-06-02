# frontend-backend-wiring-audit Specification

## Purpose

TBD - created by archiving change 'uiux-v3-alignment'. Update Purpose after archive.

## Requirements

### Requirement: Frontend-backend wiring audit

The system SHALL keep a page-level audit trail that maps each UI section in the v3 admin/member experience to its real backend wiring and acceptance proof.

#### Scenario: A wired page is reviewed
- **WHEN** a page is marked as wired in the UI parity SR
- **THEN** the change artifacts MUST identify the route, the server action or route handler, the data source, and the acceptance test that proves the page is connected end-to-end

##### Example:
- **GIVEN** `/admin/guests` is marked as `wired`
- **WHEN** the page is audited
- **THEN** the SR must reference the route, the guest persistence handler, the `guests` and `guest_visits` tables, and an E2E case proving create-and-refresh behavior

#### Scenario: A partially wired page is reviewed
- **WHEN** a page is marked as partial or missing
- **THEN** the change artifacts MUST state which dependency is incomplete and how the UI must safely represent that state without implying the feature is fully available

##### Example:
- **GIVEN** `/dashboard/one-on-one` is not complete because `member-module` booking work is still open
- **WHEN** the page is audited
- **THEN** the SR must state that dependency explicitly and require a safe placeholder or disabled CTA instead of a broken booking flow


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
### Requirement: UI parity changes must not regress existing flows

The system SHALL treat regressions in verified auth, RBAC, member, guest, admin, or presentation flows as blocking failures for this SR.

#### Scenario: UI parity work changes existing routes
- **WHEN** UI parity updates modify existing member, guest, admin, or presentation routes
- **THEN** the acceptance suite MUST re-run the existing test, build, and E2E checks to confirm that the changes did not break already verified flows

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