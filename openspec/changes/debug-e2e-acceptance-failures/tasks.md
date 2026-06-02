## 1. E2E debug remediation

- [x] 1.1 Fix **E2E failure remediation** for VP report validation so negative metrics show a visible UI error and verify the original VP E2E failure point passes.
- [x] 1.2 Fix the member directory E2E selector ambiguity and verify the original member directory failure point passes.
- [x] 1.3 Re-run full `npm run test:e2e` and keep this debug SR open until all E2E checks pass.
- [x] 1.4 Fix Vitest/E2E test separation so `npm run test` excludes Playwright specs while `npm run test:e2e` still runs E2E; verify both commands pass.
- [x] 1.5 Fix guest management E2E persistence/refresh so a newly submitted guest visit appears in `/admin/guests`; verify the original guest E2E failure point passes.
- [x] 1.6 Fix the E2E role-cookie helper so it works with both local and production base URLs; verify by rerunning the locked weekly report failure point and the full E2E suite.
- [x] 1.7 Fix Supabase generated magic-link callback E2E so the redirect URL uses an allow-listed local callback origin; verify member, guest, and unknown callback routing.
- [x] 1.8 Fix dev-server `Unexpected end of JSON input` noise on `/admin/guests` and `/dashboard/report`; verify focused page reloads and full E2E finish without this error.
