## Context

Bniaiweb already has the foundation SR defining route groups, Supabase auth, and shared design tokens. This SR adds the first data-heavy member workflows: admin member maintenance plus member self-service pages for profile, GAINS, one-on-one scheduling, top clients, and contacts circle. The implementation must stay single-chapter and respect the schema in `supabase/migrations/001_initial_schema.sql`.

## Goals / Non-Goals

**Goals:**
- Officers can maintain the chapter roster with full member profile CRUD
- Members can update their own profile fields that do not affect chapter governance
- Members can maintain GAINS, top clients, contacts circle, and one-on-one availability from the dashboard
- Members can book one-on-ones with automatically generated Jitsi links

**Non-Goals:**
- No email or push notifications for bookings
- No training-record or event-management workflows
- No media upload pipeline beyond existing URL fields
- No cross-chapter directory or booking support

## Decisions

### D1 — Admin Members List Page

Route: `/admin/members`. Table shows: member_number, photo (avatar), chinese_name, english_name, specialty_title, role, is_active, action buttons (Edit, Toggle active).
Filter by: committee, role, is_active status.
Pagination: 20 per page.
The page SHALL default to the current chapter and exclude soft-deleted records so officers can review the active roster without cross-chapter leakage.

### D2 — Member Profile Form Fields

Full form at `/admin/members/[id]` and `/dashboard/profile`:
- Basic: member_number, chinese_name, english_name, line_name, email (readonly), photo_url
- Specialty: specialty_title, specialty_description
- Referral: general_referral, ideal_referral, dream_referral
- Company: company_name, company_address, industry_experience_years, previous_career
- Organization: position, committee, role (admin-only)
Save via Server Action `updateMember(id, formData)` in `lib/actions/members.ts`.
Admin create mode SHALL require chapter_id, email, member_number, chinese_name, specialty_title, and role before a record can be saved.
Member self-service SHALL reject role, chapter, and active-status edits.

### D3 — GAINS Profile

Route: `/dashboard/gains`. Five text areas for goals, accomplishments, interests, networks, skills. Auto-save on blur after a 500ms debounce window to avoid repeated writes while preserving the latest value. Visual: each field in a colored card matching BNI red theme.
If save fails, the page SHALL show an inline error and preserve unsaved text locally until the member retries.

### D4 — One-on-One Form

Route: `/dashboard/one-on-one`. Member sets availability days/times in `member_availability` table. To book: select member from directory → choose timeslot → system creates `one_on_ones` record + generates `jitsi_room = nanoid(10)`. Meeting link: `https://meet.jit.si/bni-huaai-{jitsi_room}`.
Booking SHALL reject self-booking, overlaps for the same participant at the same `scheduled_at`, and times outside the invitee's stored availability window.
Members SHALL be able to mark bookings as confirmed, completed, or cancelled from the same dashboard.

### D5 — Top Clients (10名客戶)

Route: `/dashboard/top-clients`. Grid of 10 ranked cards (rank 1-10). Each card: industry, company_type, location, notes. Server Action `upsertTopClients(memberId, clients[])`.
The action SHALL upsert by `(member_id, rank)` so each rank remains unique and empty ranks stay available.
The page SHALL always render placeholders for all 10 ranks to make missing client entries visible.

### D6 — Contacts Circle (人脈圈)

Route: `/dashboard/contacts-circle`. Three-tier visual (核心=Tier1, 中層=Tier2, 外圍=Tier3). Add/remove contacts per tier. Server Action `upsertContactsCircle(memberId, contacts[])`.
The view SHALL group cards by tier order 1, 2, 3 and allow deleting a contact without reordering other cards.
Each contact SHALL require name and tier, while relationship, industry, and notes remain optional.

## Implementation Contract

**Behavior:**
- Officers visiting `/admin/members` can filter the roster and open a member detail form
- Officers can create a new member and toggle active status without leaving the admin module
- Members can edit their allowed profile fields on `/dashboard/profile` and see saved values on reload
- Members can edit GAINS fields with auto-save feedback instead of a full-page submit cycle
- Members can define availability, book a valid one-on-one, and reuse the generated Jitsi link through later status changes
- Members can maintain ten ranked top-client slots and three contacts-circle tiers from dedicated dashboard pages

**Interface:**
- `updateMember(id, formData)` in `lib/actions/members.ts`
- `upsertTopClients(memberId, clients[])` in `lib/actions/members.ts`
- `upsertContactsCircle(memberId, contacts[])` in `lib/actions/members.ts`
- `upsertAvailability(memberId, windows[])` in `lib/actions/one-on-ones.ts`
- `createOneOnOneBooking(input)` and `updateOneOnOneStatus(id, status)` in `lib/actions/one-on-ones.ts`

**Failure modes:**
- Missing required admin-create fields: reject save and show inline validation
- Member attempts to edit restricted fields: reject save and preserve allowed profile data
- GAINS save failure: preserve unsaved text and show retry state inline
- Booking conflict or out-of-window time: reject booking without creating `one_on_ones`
- Duplicate top-client rank or invalid contacts-circle tier: reject payload and show the affected card as invalid

**Acceptance criteria:**
1. Admin create, edit, toggle, and filter flows satisfy the member-profile-crud scenarios
2. GAINS auto-save satisfies the gains-profile save and failure scenarios
3. Availability, booking, conflict, and status flows satisfy the one-on-one-form scenarios
4. Ten-rank top-client management satisfies the member-top-clients scenarios
5. Tiered add, edit, and delete operations satisfy the member-contacts-circle scenarios

## Risks / Trade-offs

- **Profile surface area**: The member table has many fields, so shared form sections are preferred over separate duplicated forms to avoid drift between admin and member pages.
- **Booking concurrency**: A server-side overlap check is required because members may book near-simultaneously from different sessions.
- **Self-service restrictions**: Allowing members to edit too many fields could weaken officer governance, so role/chapter/active controls remain admin-only.
- **Top-client completeness**: Rendering all ten ranks increases UI density but makes missing preparation work visible before weekly meetings.
