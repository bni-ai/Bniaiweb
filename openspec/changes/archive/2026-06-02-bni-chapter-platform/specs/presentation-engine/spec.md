## ADDED Requirements

### Requirement: Presentation Auto-Generation

The system SHALL generate an HTML presentation from submitted weekly briefs, keynote talks, and guest data for a given week. The generation SHALL be triggered by an officer clicking "Generate Presentation" in the admin dashboard.

#### Scenario: Officer generates weekly presentation

- **WHEN** an officer clicks "Generate Presentation" for week 2026-06-07
- **THEN** the system SHALL compile all submitted briefs, keynote data, and guest data into an ordered slide deck and save it to the `presentations` table

---

### Requirement: Slide Type Components

The system SHALL support seven slide types: CoverSlide (chapter info), MemberCard (member weekly brief), KeynoteSlide (8-min talk), GuestSlide (guest intro), TeamSlide (leadership roster), AwardSlide (recognition), VPReportSlide (chapter metrics). Each type SHALL render as a self-contained 1920x1080 canvas.

#### Scenario: Presentation renders all slide types

- **WHEN** a presentation contains at least one slide of each type
- **THEN** each slide SHALL render correctly at 1920x1080 resolution with proper typography and BNI brand colors

---

### Requirement: Slide Order Management

Officers SHALL be able to reorder slides via drag-and-drop in the admin interface. The order SHALL be persisted in `presentations.slide_order` as a JSONB array of `{ type, id }` objects.

#### Scenario: Officer reorders slides

- **WHEN** an officer drags member card #5 to position #3
- **THEN** the system SHALL update the slide_order array and the presentation SHALL reflect the new order

---

### Requirement: Public Presentation URL

Published presentations SHALL be accessible at `/presentation/[week-date]` without authentication. The page SHALL support keyboard navigation (left/right arrows), fullscreen mode, and touch swipe.

#### Scenario: External viewer accesses presentation

- **WHEN** anyone opens `/presentation/2026-06-07` in a browser
- **THEN** the system SHALL render the full slide deck with navigation controls without requiring login

---

### Requirement: PDF Export

Officers SHALL be able to export a published presentation as a PDF file. The PDF SHALL contain one slide per page at 1920x1080 resolution.

#### Scenario: Officer exports PDF

- **WHEN** an officer clicks "匯出 PDF" on a published presentation
- **THEN** the system SHALL generate and download a PDF file containing all slides

---

### Requirement: Data-Driven Slide Editing

The system SHALL use a data-driven approach for slide content. Officers SHALL NOT need to write HTML or code to edit slide content. Each slide type maps to a source table with structured form fields:

| Slide Type | Source Table | Editable Fields |
|---|---|---|
| MemberCard | `weekly_briefs` | have_this_week, want_this_week |
| KeynoteSlide | `keynote_talks` | topic, outline, product_images |
| GuestSlide | `guests` | name, specialty, self_intro |
| AwardSlide | `weekly_awards` | recipient, award_type, description |
| VPReportSlide | `weekly_vp_reports` | all metric fields |

#### Scenario: Officer edits a 短講 slide

- **WHEN** an officer clicks "編輯" on the 短講 slide in the presentation builder
- **THEN** the system SHALL open a form with: topic (text), outline (textarea), product_images (image upload gallery)
- **AND WHEN** the officer saves
- **THEN** the slide SHALL render the updated data immediately on next view

#### Scenario: Officer edits a 會員 slide

- **WHEN** an officer clicks "編輯" on a 會員 slide
- **THEN** the system SHALL open a form showing that member's weekly brief fields (have_this_week, want_this_week)
- **AND** allow overriding those values for this presentation only OR updating the underlying weekly_brief record

---

### Requirement: Award and VP Report Slides

The system SHALL support `weekly_awards` and `weekly_vp_reports` tables as data sources for AwardSlide and VPReportSlide types. Officers SHALL fill in award recipients and VP metrics via admin forms. The presentation engine SHALL read these tables to render the corresponding slides.

#### Scenario: Award and VP slides render from weekly data

- **WHEN** week `2026-06-07` has 3 award records and 1 vp report record
- **THEN** the generated slide deck SHALL include AwardSlide entries for each award and one VPReportSlide with the stored metrics

---

### Requirement: Guest Slide - New vs Returning Guest

The system SHALL distinguish between new guests (`visit_number = 1`) and returning guests (`visit_number > 1`) when rendering GuestSlide.

- **New guest** slide SHALL display a "首次來訪" badge
- **Returning guest** slide SHALL display the visit count ("第 N 次來訪")

The slide source data is `guest_visits` (joined with `guests`), NOT the `guests` table directly.

| Slide Field | Source |
|---|---|
| name | `guests.name` |
| company | `guests.company` |
| specialty | `guests.specialty` |
| self_intro | `guest_visits.self_intro` |
| visit_number | `guest_visits.visit_number` (auto-calculated) |
| referrer | `guests.referrer_id` → member name |

#### Scenario: New guest badge rendering

- **WHEN** `guest_visits.visit_number = 1` for a guest in the current week
- **THEN** the GuestSlide SHALL show the "首次來訪" badge and SHALL NOT show "第 N 次來訪"

#### Scenario: Returning guest count rendering

- **WHEN** `guest_visits.visit_number = 3` for a guest in the current week
- **THEN** the GuestSlide SHALL show "第 3 次來訪"

### Requirement: Guest Scheduling (This Week / Next Week)

Officers SHALL be able to schedule guests for the current week or upcoming weeks via `guest_visits.week_date`.

- The presentation builder SHALL filter `guest_visits` by `week_date = current_meeting_date`
- The admin guest list SHALL show guests grouped by week: 本週來賓 / 下週來賓 / 未來
- Status transitions: `invited` → `confirmed` → `attended` / `no_show` / `joined_member`

#### Scenario: Guest list grouped by week

- **WHEN** one guest has `week_date=2026-06-07` and another has `week_date=2026-06-14`
- **THEN** admin guest list SHALL place them under 本週來賓 and 下週來賓 respectively

### Requirement: Guest History

All past `guest_visits` records SHALL be preserved and queryable. Officers SHALL be able to:
- View a guest's full visit history (all `guest_visits` for a given `guest_id`)
- Re-invite a previous guest (create a new `guest_visits` row with incremented `visit_number`)
- See if a guest has previously become a member (`status = 'joined_member'`)

#### Scenario: Officer views full guest visit history

- **WHEN** officer opens guest `g-001` history with existing visits #1 and #2
- **THEN** the system SHALL show both historical rows with status and week_date

#### Scenario: Re-invite increments visit number

- **WHEN** officer re-invites a guest whose latest `visit_number` is 2
- **THEN** the system SHALL create a new `guest_visits` row with `visit_number = 3`
