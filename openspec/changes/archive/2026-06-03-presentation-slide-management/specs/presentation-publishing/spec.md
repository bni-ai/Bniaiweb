## MODIFIED Requirements

### Requirement: Presentation publishing
The system SHALL let officers create, edit, preview, publish, unpublish, and manage a weekly presentation record backed by generated slide-order data. The admin presentation surface MUST expose a status bar, public link, updated time, slide count, thumbnail grid, Preview action, Publish action, and Unpublish action. The system MUST validate that a presentation has at least one valid slide before allowing publication.

#### Scenario: Officer creates a weekly presentation
- **WHEN** an officer chooses to create a presentation for a week that has meeting data
- **THEN** the system MUST create a presentations record with generated slide_order data for that week and show it in the presentations list

##### Example:
- **GIVEN** week `2026-06-01` has briefs, keynote, and guest data
- **WHEN** officer clicks `建立本週簡報`
- **THEN** one `presentations` row is created with non-empty `slide_order`

#### Scenario: Officer sees presentation thumbnail grid
- **WHEN** an officer opens `/admin/presentation` for a week with a generated presentation
- **THEN** the system MUST show presentation status, public URL if available, updated time, slide count, and one thumbnail card per visible slide entry

##### Example:
- **GIVEN** presentation `p-2026-06-01` has slide order `[cover, keynote, member-01]` and status `draft`
- **WHEN** officer opens `/admin/presentation`
- **THEN** the page shows status `草稿`, slide count `3`, and thumbnail labels `首頁`, `演講`, `會員`

#### Scenario: Officer previews presentation
- **WHEN** an officer clicks Preview on a generated presentation
- **THEN** the system MUST open the public slide viewer route for that presentation week

##### Example:
- **GIVEN** presentation `p-2026-06-01` has `week_date=2026-06-01`
- **WHEN** officer clicks `Preview`
- **THEN** browser opens `/presentation/2026-06-01`

#### Scenario: Officer edits slide order and visibility
- **WHEN** an officer reorders slides or toggles a slide visibility flag on the presentation detail page
- **THEN** the system MUST persist the updated slide_order JSON for that presentation

##### Example:
- **GIVEN** presentation `p-2026-06-01` has slide order `[cover, keynote, member-01]`
- **WHEN** officer drags `member-01` before `keynote` and sets `keynote.visible=false`
- **THEN** persisted `slide_order` becomes `[cover, member-01, keynote(false)]`

#### Scenario: Officer publishes a presentation
- **WHEN** an officer publishes a prepared presentation
- **THEN** the system MUST set the presentation status to published and store a published_url value that officers can share

##### Example:
- **GIVEN** presentation `p-2026-06-01` status is `draft`
- **WHEN** officer clicks publish
- **THEN** status updates to `published` and `published_url` is set to `/presentation/2026-06-01`

#### Scenario: Officer unpublishes a presentation
- **WHEN** an officer unpublishes a published presentation
- **THEN** the system MUST set the presentation status to draft and remove the publicly shareable state from the admin status bar

##### Example:
- **GIVEN** presentation `p-2026-06-01` status is `published` and `published_url=/presentation/2026-06-01`
- **WHEN** officer clicks unpublish
- **THEN** status updates to `draft` and the admin status bar no longer displays a public URL

#### Scenario: Officer tries to publish incomplete slide data
- **WHEN** a presentation has no generated slide_order entries
- **THEN** the system MUST block publish and explain that the weekly presentation data is incomplete

##### Example:
- **GIVEN** presentation `p-empty` has `slide_order=[]`
- **WHEN** officer clicks publish
- **THEN** publish is rejected with message indicating incomplete weekly presentation data

#### Scenario: Officer tries to publish invalid slide_order
- **WHEN** a presentation has slide_order that fails schema validation (e.g., unknown type, missing id for data-driven slide)
- **THEN** the system MUST block publish and display a detailed error message listing the invalid entries

##### Example:
- **GIVEN** presentation `p-invalid` has `slide_order=[{ "type": "member" }]` missing the `id` field
- **WHEN** officer clicks publish
- **THEN** publish is rejected with message "slide_order entry member 缺少 id 或 visible"

#### Scenario: Admin deletes a presentation
- **WHEN** an officer clicks delete on a presentation from the admin list
- **THEN** the system MUST show a confirmation dialog, and upon confirmation, delete the presentations record and any associated storage assets

##### Example:
- **GIVEN** presentation `p-2026-06-01` exists with status `draft`
- **WHEN** officer clicks delete and confirms
- **THEN** the record is removed from the database and the admin list no longer shows it
