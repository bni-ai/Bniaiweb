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
