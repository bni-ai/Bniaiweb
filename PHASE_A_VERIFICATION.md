# Phase A Verification (2026-06-02)

## Scope

- app-foundation
- schema-only alignment (bni-chapter-platform 2.13 / 2.14)
- basic UI skeleton (landing-page + route skeleton)

## Evidence

- Build passed: `npm run build`
- Tests passed: `npm run test`
- Analyze clean:
  - `spectra analyze app-foundation --json`
  - `spectra analyze landing-page --json`
  - `spectra analyze bni-chapter-platform --json`

## SR Task Status

- `openspec/changes/app-foundation/tasks.md`
  - Completed: 1.1~1.3, 2.1~2.3, 3.1~3.9, 4.1~4.2, 5.1~5.5, 6.1~6.2
- `openspec/changes/bni-chapter-platform/tasks.md`
  - Completed (schema-only stage): 2.13, 2.14
- `openspec/changes/landing-page/tasks.md`
  - Completed: all tasks

## OAuth / Auth Hook Verification

- Supabase project linked: `tttavrifxdvdpyjsqgmo`
- Google provider enabled: `external.google = true`
- OAuth authorize endpoint redirects to Google (`HTTP 302`)
- Remote migrations applied: `001_initial_schema.sql`, `002_auth_hook.sql`
- Auth hook smoke passed: temporary Auth user login produced JWT claim `app_role=member`; temporary user was deleted

## Remaining Blocker

- None for Phase A.
