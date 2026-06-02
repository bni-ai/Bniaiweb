## 1. Member dashboard shell

- [x] [P] Implement member dashboard per **d1 — dashboard home** in design.md so signed-in members can see their profile summary, current-week status, and quick actions immediately after login; verify by exercising the member-dashboard open, no-brief, and saved-brief scenarios on `/dashboard`.

## 2. Weekly participation

- [x] [P] Implement weekly brief submission per **d2 — weekly brief submission** in design.md so members can open an empty weekly form, save drafts, submit a brief, and reopen the same row until the week locks; verify by exercising the weekly-brief-submission empty, draft, submit, and edit scenarios on `/dashboard/report`.
- [x] [P] Enforce locked-week read-only behavior for weekly brief submission per **d2 — weekly brief submission** in design.md so members can still inspect stored brief content when an admin lock applies; verify by exercising the weekly-brief-submission locked-week scenario and confirming rejected writes preserve visible content.
- [x] Add compatibility redirects `/dashboard/brief` and `/dashboard/weekly` -> `/dashboard/report`; verify old links from previous SR docs and bookmarks land on the same weekly brief page with no data loss.

## 3. Directory browsing

- [x] Implement member directory per **d3 — member directory** in design.md so members can search active chapter peers by name or specialty and open a read-only profile modal; verify by exercising the member-directory open, search, profile-modal, and no-results scenarios on `/dashboard/directory`.
