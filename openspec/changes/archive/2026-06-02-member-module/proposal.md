## Why

Members need a structured profile system to manage their BNI data — from basic contact info to GAINS analysis and one-on-one availability. Currently all data lives in Google Sheets with no structured format.

## What Changes

Admin can manage all member records via a full CRUD interface. Members can self-update their profile, GAINS fields, availability, top clients, and contacts circle. One-on-one requests are booked with Jitsi video call links auto-generated.

## Non-Goals

- No email notifications for 1-on-1 booking (LINE group handles this)
- No member training records (separate SR)
- No mobile camera capture optimization workflow（一般檔案上傳仍可支援）

## Capabilities

### New Capabilities

- `member-profile-crud`: Admin CRUD for member records
- `gains-profile`: GAINS self-service editing
- `one-on-one-form`: 一對一表單 availability and booking
- `member-top-clients`: Top 10 client configuration
- `member-contacts-circle`: 人脈圈 tier management

### Modified Capabilities

(none)

## Impact

- Affected specs: member-profile-crud, gains-profile, one-on-one-form, member-top-clients, member-contacts-circle
- Affected code:
  - New: app/(admin)/admin/members/page.tsx
  - New: app/(admin)/admin/members/[id]/page.tsx
  - New: app/(member)/dashboard/profile/page.tsx
  - New: app/(member)/dashboard/gains/page.tsx
  - New: app/(member)/dashboard/one-on-one/page.tsx
  - New: app/(member)/dashboard/top-clients/page.tsx
  - New: app/(member)/dashboard/contacts-circle/page.tsx
  - New: lib/actions/members.ts
  - New: lib/actions/one-on-ones.ts
