## Why

Members need a self-service portal to submit their weekly brief, check their own profile, and browse the member directory. Currently submission happens via LINE messages.

## What Changes

A member-facing dashboard allowing weekly brief submission, profile self-management link, and member directory browsing. Weekly brief page follows canonical route `/dashboard/report`（compat aliases: `/dashboard/brief`, `/dashboard/weekly`）to align with UI v3 naming.

## Non-Goals

- No real-time chat or messaging between members
- No mobile push notifications
- No member-to-member referral tracking (tracked by officers)

## Capabilities

### New Capabilities

- `member-dashboard`: Authenticated member home page
- `weekly-brief-submission`: Submit and edit weekly have and want brief
- `member-directory`: Browse all active members with search

### Modified Capabilities

(none)

## Impact

- Affected specs: member-dashboard, weekly-brief-submission, member-directory
- Affected code:
  - New: app/(member)/dashboard/page.tsx
  - New: app/(member)/dashboard/report/page.tsx
  - New: app/(member)/dashboard/directory/page.tsx
  - New: lib/actions/weekly-briefs.ts
