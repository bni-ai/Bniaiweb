## Context

Bniaiweb needs an officer-focused backend that replaces weekly spreadsheet coordination and manual PowerPoint preparation. This SR centralizes the recurring chapter operations that happen before each meeting, including brief review, guest tracking, keynote preparation, VP metrics, award preparation, and assembling a publishable presentation record.

## Goals / Non-Goals

**Goals:**
- Let officers review and edit weekly member briefs for a selected week
- Let officers manage guests and repeat visits across weekly meeting dates
- Let officers maintain keynote, VP report, awards, and presentation records from dedicated admin routes
- Prepare presentation records from structured data so a later viewer SR can render them directly

**Non-Goals:**
- No email reminder or broadcast workflows
- No bulk import, PDF export, or spreadsheet sync
- No public presentation viewer in this SR
- No automation that bypasses officer review before publication

## Decisions

### D1 — Weekly Brief Management

Route: `/admin/submission?week=YYYY-MM-DD`（對齊 `ui-mockup-admin-v3` 的 `page-submission`）。Table showing all members with columns: member name, specialty, submission status (badge: 草稿/已提交/未提交), have/want summary. Week date selector at top. Officer can inline-approve or open edit modal. Count badge shows `X/36 已提交`.
Backward-compat: `/admin/weekly-briefs` SHALL redirect to `/admin/submission`.
The page SHALL include every active member in the chapter for the selected week, even when no `weekly_briefs` row exists yet.

### D2 — Guest Management

Route: `/admin/guests`. Two-tab view: `本週來賓` and `下週來賓` (filtered by `week_date`). Guest card shows: name, specialty, referrer, visit_number (new/returning badge), self_intro preview. `新增來賓` button opens modal. New guest = `visit_number=1` (badge: 新來賓🟢), returning guest = `visit_number>1` (badge: 舊來賓🔵). Guest records stored in `guests` + `guest_visits` tables.
The create flow SHALL upsert a guest identity first, then attach or update the visit row for the selected week.

### D3 — Keynote Talk Management

Route: `/admin/keynote?week=YYYY-MM-DD`. Form to edit `keynote_talks` record: speaker (select from members), topic, outline (textarea), product images (URL array). Status toggle: draft/submitted.
The route SHALL maintain a single keynote record per chapter and week, replacing the previous save when the officer edits the same week.

### D4 — VP Report

Route: `/admin/vp-report?week=YYYY-MM-DD`. Single form per week: total_referrals, total_one_on_ones, total_visitors, member_attendance, referral_value_twd (TWD), notes. Upsert on save.
Numeric fields SHALL reject negative values and preserve officer input when validation fails.

### D5 — Awards

Route: `/admin/awards?week=YYYY-MM-DD`. List of awards for the week. Add award: select recipient, award_type (頂尖推薦人/訪客獎/BNI 幣/聚光燈/其他), description. Multiple awards per week allowed.
The awards list SHALL support create, edit, and delete without affecting other awards for the same week.

### D6 — Presentation Publishing

Route: `/admin/presentation`. List of presentations by week. `建立本週簡報` button creates a new `presentations` record with auto-generated `slide_order` JSONB based on all data for that week. Edit page at `/admin/presentations/[id]`: drag-reorder slides, toggle visibility per slide, edit linked data, publish button sets `status='published'`.
Backward-compat: `/admin/presentations` SHALL redirect to `/admin/presentation`.
Presentation publishing SHALL save the published route or share URL into `published_url` so officers can distribute a stable link after publishing.

## Implementation Contract

**Behavior:**
- Officers can pick a week and immediately see chapter brief coverage, including members who have not submitted
- Officers can create or update guests and guest visits while clearly distinguishing first-time and returning visitors
- Officers can maintain exactly one keynote and one VP report record per chapter-week combination
- Officers can add multiple awards per week and remove one award without clearing the full list
- Officers can generate a presentation record, change slide order, toggle visibility, and mark it published

**Interface:**
- `lib/actions/weekly-briefs.ts` handles weekly brief listing, officer edits, and approval state updates
- `lib/actions/guests.ts` handles guest identity upsert plus weekly visit CRUD
- `lib/actions/keynote.ts` handles keynote upsert for the selected week
- `lib/actions/presentations.ts` handles presentation creation, slide-order updates, visibility toggles, and publish actions
- `app/(admin)/admin/*` routes render officer-only interfaces scoped to the current chapter

**Failure modes:**
- Missing brief row for a member: render the member with `未提交` status instead of omitting them
- Duplicate guest creation for the same person: reuse the guest identity and attach a visit row for the selected week
- Negative VP numbers: reject save and highlight the invalid field
- Publishing without slide data: block publish and explain which week data is missing
- Deleting one award: remove only the targeted award row

**Acceptance criteria:**
1. Weekly view covers submitted, draft, and missing brief states for all active members
2. Guest flows correctly mark first-time versus returning visits by `visit_number`
3. Keynote and VP report flows upsert one record per chapter-week
4. Awards CRUD supports multiple weekly awards without cross-row side effects
5. Presentation creation produces a `presentations` record with editable `slide_order` and a publishable URL

## Risks / Trade-offs

- **Officer surface area**: Combining six operational workflows in one SR is broad, but they are all part of the same weekly officer cadence and share admin routing.
- **Presentation coupling**: This SR prepares `slide_order` before the presentation viewer exists, so the contract must remain stable for the later SR.
- **Guest identity quality**: Manual entry may create near-duplicate guests, so the backend should favor reuse by email or name when possible.
- **Missing submissions**: Counting members with no brief rows requires a join against active members rather than relying only on `weekly_briefs`.
