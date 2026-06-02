## 1. Guest identity and access boundary

- [x] 1.1 Implement **D1 — guest identity remains separate from members** and **Guest role access boundary** so authenticated emails in `guests.email` receive `sb-role=guest` only after member lookup fails; verify with callback smoke tests for member, guest, and unknown email paths.
- [x] 1.2 Implement **D5 — guest access boundary is enforced in callback and middleware** so guest users can access `/guest/*` but are redirected away from `/admin/*` and `/dashboard/*`; verify with middleware access-control tests and manual route checks.
- [x] 1.3 Implement **Unknown authenticated users remain blocked** so emails absent from both `members` and `guests` land on an explanatory error page; verify with a callback smoke test using an unlisted email.

## 2. Public guest content

- [x] 2.1 Implement **D2 — public and authenticated guest states share one portal shell** and **Public guest information hub** so `/guest` renders BNI introduction, chapter introduction, guest guidance, and login call to action without authentication; verify with `npm run build` and a public `/guest` smoke check.
- [x] 2.2 Implement **D3 — guest content uses structured records but not full CMS** and **Guest content supports articles and videos** so published public article/video records appear on `/guest/content`; verify visibility filtering with a focused test and manual public content smoke check.

## 3. Authenticated guest portal

- [x] 3.1 Implement **Authenticated guest dashboard** so a logged-in guest sees inviter, visit week, visit status, and visit number badge; verify with seeded guest data and a `/guest` authenticated smoke check.
- [x] 3.2 Implement **Guest sees fifteen-second preparation guidance** so `/guest/prepare` shows concrete prompts for name, company, specialty, target referral, and clear ask; verify by content review against the spec example.
- [x] 3.3 Implement **D4 — guest member directory is intentionally limited** and **Guest limited member directory** so `/guest/members` shows only approved public member fields and no one-on-one/admin/member-edit actions; verify with DOM/content smoke checks.

## 4. Admin readiness and verification

- [x] 4.1 Update admin guest management to show whether each guest has an email and is login-ready, without treating guests as members; verify `/admin/guests` displays readiness status for guests with and without email.
- [x] 4.2 Run full verification for `guest-portal`: `npm run test`, `npm run build`, and `spectra analyze guest-portal`; mark complete only when all checks pass.
