## Problem

The first Playwright acceptance run exposed failures that block treating admin/member SR work as user-verifiable. VP report negative validation does not surface an inline error, and one member directory E2E assertion uses an ambiguous text selector.

## Root Cause

VP report currently throws from a server action, which does not render a stable field-level message back into the form. The member directory E2E selector matches both navigation and page heading text.

## Proposed Solution

- Add a client-visible VP report form state so negative metrics render a stable validation message before or after submit.
- Narrow the member directory E2E assertion to the page heading role.
- Re-run the exact failing Playwright cases, then re-run the full E2E suite.

## Non-Goals

- Do not broaden this debug SR into unrelated UI redesign.
- Do not mark admin/member SR verification complete until full E2E passes.

## Success Criteria

- `npm run test:e2e` passes locally.
- VP report negative value failure is visible in the UI.
- The original failed test points are rerun after fixes.

## Impact

- Affected code:
  - Modified: app/(admin)/admin/vp-report/page.tsx
  - New: app/(admin)/admin/vp-report/vp-report-form.tsx
  - Modified: lib/actions/vp-report.ts
  - Modified: e2e/admin-member.spec.ts
