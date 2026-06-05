## ADDED Requirements

### Requirement: Unresolved slide entries are surfaced to editors

When building a presentation deck for admin preview or editor views, the system SHALL detect `slide_order` entries that cannot be resolved to runtime slides (for example missing member brief, keynote, or guest visit rows).

The admin UI SHALL display a visible warning list describing each unresolved entry (slide type, identifier when present, and reason). Saving slide order SHALL NOT be blocked solely because of unresolved entries.

#### Scenario: Member slide id missing from database

- **WHEN** `slide_order` contains `{ type: "member", id: "missing-id", visible: true }` but no matching brief exists
- **THEN** the editor or preview page SHALL show a warning for that entry
- **AND** the public published deck SHALL omit that slide from playback without throwing

### Requirement: Single HTML runtime render path for published decks

Published and draft preview presentation pages SHALL render slides through `toRuntimeDeck` and `EditorSlideFrame` (or a successor runtime frame), not through legacy `renderPresentationSlides` template components.

#### Scenario: Published week presentation loads

- **WHEN** a visitor opens `/presentation/{week-date}` for a published deck with editor overrides
- **THEN** the page SHALL render using the runtime deck path that reads `slide_order.editor` data

## ADDED Requirements

### Requirement: Presentation background image upload consistency

The canvas editor file input and server-side `assertImageFile` validation SHALL accept the same image MIME types.

If only JPG and PNG are supported, the editor `accept` attribute SHALL NOT include webp. If webp is supported, storage validation and bucket configuration SHALL allow webp consistently.

#### Scenario: User selects webp in editor

- **WHEN** webp is not supported server-side
- **THEN** the editor SHALL NOT offer webp in `accept`
- **AND** users SHALL NOT receive an unhandled 500 from `saveSlideOrderAction` solely due to MIME mismatch
