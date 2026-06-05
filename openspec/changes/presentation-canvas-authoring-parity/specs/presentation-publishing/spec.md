## MODIFIED Requirements

### Requirement: Presentation publishing
The system SHALL let officers create, edit, preview, publish, unpublish, and manage a weekly presentation record backed by generated slide-order data plus a versioned layout document. The admin presentation surface MUST expose status, public link, updated time, slide count, preview, publish, unpublish, and a route into the visual authoring workspace.

#### Scenario: Officer creates a weekly presentation
- **WHEN** an officer chooses to create a presentation for a week that has meeting data
- **THEN** the system MUST create a presentations record with generated slide_order data for that week and initialize a default layout document for that presentation

##### Example:
- **GIVEN** week `2026-06-01` has briefs, keynote, and guest data
- **WHEN** officer clicks `建立本週簡報`
- **THEN** one `presentations` row is created with non-empty `slide_order` and an initial layout document

#### Scenario: Officer sees presentation thumbnail grid
- **WHEN** an officer opens `/admin/presentation` for a week with a generated presentation
- **THEN** the system MUST show presentation status, public URL if available, updated time, slide count, and one thumbnail card per visible slide entry

##### Example:
- **GIVEN** presentation `p-2026-06-01` has slide order `[cover, keynote, member-01]` and status `draft`
- **WHEN** officer opens `/admin/presentation`
- **THEN** the page shows status `草稿`, slide count `3`, and thumbnail labels `首頁`, `演講`, `會員`

#### Scenario: Officer previews draft presentation layout
- **WHEN** an officer clicks Preview on a draft presentation
- **THEN** the system MUST open a viewer route that renders the latest saved draft layout for that presentation week

##### Example:
- **GIVEN** presentation `p-2026-06-01` has saved draft title `六月例會簡報`
- **WHEN** officer clicks `Preview`
- **THEN** browser opens the draft preview and shows `六月例會簡報`

#### Scenario: Officer edits slide order and layout
- **WHEN** an officer reorders slides, toggles slide visibility, or updates slide block layout from the authoring workspace
- **THEN** the system MUST persist the updated order and layout document for that presentation

##### Example:
- **GIVEN** presentation `p-2026-06-01` has slide order `[cover, keynote, member-01]`
- **WHEN** officer moves `member-01` before `keynote` and resizes block `member-photo`
- **THEN** persisted data reflects the new order and the saved block frame

#### Scenario: Officer publishes a presentation
- **WHEN** an officer publishes a prepared presentation
- **THEN** the system MUST validate the draft layout, create or update the published layout snapshot, set status to published, and store a published_url value that officers can share

##### Example:
- **GIVEN** presentation `p-2026-06-01` status is `draft`
- **WHEN** officer clicks publish
- **THEN** status updates to `published`, `published_url` is set to `/presentation/2026-06-01`, and the published snapshot matches the latest saved draft layout

#### Scenario: Officer unpublishes a presentation
- **WHEN** an officer unpublishes a published presentation
- **THEN** the system MUST set the presentation status to draft and remove the publicly shareable state from the admin status bar without deleting the saved draft layout

##### Example:
- **GIVEN** presentation `p-2026-06-01` status is `published` and `published_url=/presentation/2026-06-01`
- **WHEN** officer clicks unpublish
- **THEN** status updates to `draft`, the admin status bar no longer displays a public URL, and draft layout data remains editable

#### Scenario: Officer tries to publish incomplete or invalid layout data
- **WHEN** a presentation has no generated slides, no layout document, or an invalid layout document
- **THEN** the system MUST block publish and explain that the presentation data is incomplete or invalid

##### Example:
- **GIVEN** presentation `p-empty` has `slide_order=[]`
- **WHEN** officer clicks publish
- **THEN** publish is rejected with a message indicating incomplete weekly presentation data
