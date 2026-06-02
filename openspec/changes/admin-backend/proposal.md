## Why

Officers currently spend hours weekly reconciling member submissions in Google Sheets, manually building PowerPoint slides, and tracking guest visits. A unified admin backend automates data collection and presentation generation.

## What Changes

Officers get a full admin backend covering: weekly brief submission tracking, guest management with new and returning classification, keynote talk entry, VP report entry, awards management, and one-click presentation publishing. Canonical UI routes follow `/admin/submission` and `/admin/presentation` (legacy aliases retained for compatibility).

## Non-Goals

- No automated email reminders to members (LINE group handles reminders)
- No bulk import from Google Sheets (manual entry in Phase 1)
- No PDF export (screen share via Zoom only)

## Capabilities

### New Capabilities

- `weekly-brief-management`: View and manage weekly brief submissions
- `guest-management`: Guest and guest visit CRUD
- `keynote-talk-management`: Keynote talk record management
- `vp-report-management`: Weekly VP report entry
- `awards-management`: Weekly awards CRUD
- `presentation-publishing`: Build and publish weekly presentation

### Modified Capabilities

(none)

## Impact

- Affected specs: weekly-brief-management, guest-management, keynote-talk-management, vp-report-management, awards-management, presentation-publishing
- Affected code:
  - New: app/(admin)/admin/submission/page.tsx
  - New: app/(admin)/admin/guests/page.tsx
  - New: app/(admin)/admin/keynote/page.tsx
  - New: app/(admin)/admin/vp-report/page.tsx
  - New: app/(admin)/admin/awards/page.tsx
  - New: app/(admin)/admin/presentation/page.tsx
  - New: app/(admin)/admin/presentations/[id]/page.tsx
  - New: lib/actions/weekly-briefs.ts
  - New: lib/actions/guests.ts
  - New: lib/actions/keynote.ts
  - New: lib/actions/presentations.ts
