## MODIFIED Requirements

### Requirement: Presentation publishing

The system SHALL let officers create, edit, preview, and publish a weekly presentation record through an operator-facing workbench backed by generated slide-order data.

#### Scenario: Officer creates a weekly presentation
- **WHEN** an officer chooses to create a presentation for a week that has meeting data
- **THEN** the system MUST create a presentations record with generated slide_order data for that week and show it in the presentations list

##### Example: create current week deck
- **GIVEN** week `2026-06-01` has briefs, keynote, and guest data
- **WHEN** officer clicks `建立本週簡報`
- **THEN** one `presentations` row is created with non-empty `slide_order`

#### Scenario: Officer opens the presentation workbench
- **WHEN** an officer opens a presentation detail page from the admin portal
- **THEN** the system MUST show a workbench surface with slide ordering context, HTML preview entry, deck status, and publish actions instead of exposing raw JSON as the primary editing surface

##### Example: workbench surface replaces raw JSON
- **GIVEN** presentation `p-2026-06-01` exists in draft state
- **WHEN** the officer opens `/admin/presentations/p-2026-06-01`
- **THEN** the page shows slide ordering context, preview entry, status information, and publish actions without requiring the officer to edit raw JSON

#### Scenario: Officer updates slide order or visibility from the workbench
- **WHEN** an officer reorders slides or toggles a slide visibility flag on the presentation detail page
- **THEN** the system MUST persist the updated slide_order data for that presentation and reflect it in preview output

##### Example: reorder and hide one slide
- **GIVEN** presentation `p-2026-06-01` has slide order `[cover, keynote, member-01]`
- **WHEN** officer moves `member-01` before `keynote` and sets `keynote.visible=false`
- **THEN** the persisted deck order becomes `[cover, member-01, keynote(false)]` and preview uses the new order

#### Scenario: Officer previews a presentation before publish
- **WHEN** an officer clicks a preview action from the presentations list or workbench
- **THEN** the system MUST open the HTML presentation viewer for the selected week using the latest saved deck state

##### Example: preview latest saved deck
- **GIVEN** the officer saved a reordered deck for week `2026-06-01`
- **WHEN** the officer clicks `預覽簡報`
- **THEN** `/presentation/2026-06-01` opens with the latest saved slide order

#### Scenario: Officer publishes a presentation
- **WHEN** an officer publishes a prepared presentation
- **THEN** the system MUST set the presentation status to `published` and store a `published_url` value that officers can share

##### Example: publish generated deck
- **GIVEN** presentation `p-2026-06-01` status is `draft`
- **WHEN** officer clicks publish
- **THEN** status updates to `published` and `published_url` is set to `/presentation/2026-06-01`

#### Scenario: Officer tries to publish incomplete slide data
- **WHEN** a presentation has no generated slide_order entries
- **THEN** the system MUST block publish and explain that the weekly presentation data is incomplete

##### Example: publish blocked on empty deck
- **GIVEN** presentation `p-empty` has `slide_order=[]`
- **WHEN** the officer clicks publish
- **THEN** the publish action is rejected and the workbench explains that the weekly presentation data is incomplete
