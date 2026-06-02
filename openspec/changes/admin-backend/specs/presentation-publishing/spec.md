## ADDED Requirements

### Requirement: Presentation publishing

The system SHALL let officers create, edit, and publish a weekly presentation record backed by generated slide-order data.

#### Scenario: Officer creates a weekly presentation
- **WHEN** an officer chooses to create a presentation for a week that has meeting data
- **THEN** the system MUST create a presentations record with generated slide_order data for that week and show it in the presentations list

##### Example:
- **GIVEN** week `2026-06-01` has briefs, keynote, and guest data
- **WHEN** officer clicks `建立本週簡報`
- **THEN** one `presentations` row is created with non-empty `slide_order`

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

#### Scenario: Officer tries to publish incomplete slide data
- **WHEN** a presentation has no generated slide_order entries
- **THEN** the system MUST block publish and explain that the weekly presentation data is incomplete

##### Example:
- **GIVEN** presentation `p-empty` has `slide_order=[]`
- **WHEN** officer clicks publish
- **THEN** publish is rejected with message indicating incomplete weekly presentation data
