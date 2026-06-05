## ADDED Requirements

### Requirement: Desktop presentation editor uses a workspace-first layout

The system SHALL render `/admin/presentations/[id]` as a workspace-first editor on desktop breakpoints instead of constraining it to a narrow content container.

#### Scenario: Desktop editor expands to use available width

- **WHEN** an administrator opens the presentation editor on a desktop viewport
- **THEN** the page SHALL use the available horizontal workspace for the editor instead of leaving a large unused outer gutter on the right side

##### Example: wide desktop viewport
- **GIVEN** the editor is opened at `1600px` viewport width
- **WHEN** the workspace is rendered
- **THEN** the right-side outer blank area is reduced and the extra width is allocated back to the editor workspace

### Requirement: Desktop editor keeps navigator, canvas, and inspector simultaneously usable

The system SHALL provide a desktop layout where the slide navigator, central canvas, and property inspector remain simultaneously visible and usable.

#### Scenario: Three-column desktop editing

- **WHEN** an administrator edits a presentation on a desktop viewport
- **THEN** the slide navigator, canvas stage, and property inspector SHALL remain available in the same workspace without the inspector being compressed into an unreadable narrow panel

##### Example: three-column desktop workspace
- **GIVEN** the editor is opened at `1440px` viewport width
- **WHEN** an administrator selects a slide and opens the inspector
- **THEN** the navigator, canvas, and inspector remain simultaneously visible and usable
