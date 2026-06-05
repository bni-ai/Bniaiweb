## MODIFIED Requirements

### Requirement: Presentation publishing

The system SHALL let officers create, edit, preview, publish, unpublish, and manage a weekly presentation record backed by generated slide-order data plus fixed-field editor content.

#### Scenario: Officer edits slide content before publish
- **WHEN** an officer edits title, body, font size, or background image from the presentation detail page
- **THEN** the system MUST persist those editor values alongside the presentation data that publish and viewer routes consume

##### Example: cover slide customization
- **GIVEN** presentation `p-2026-06-01` exists as draft
- **WHEN** officer changes the cover title to `自訂封面標題` and saves
- **THEN** the saved draft retains `自訂封面標題` before and after publishing
