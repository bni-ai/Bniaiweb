## ADDED Requirements

### Requirement: Canvas presentation authoring
The system SHALL provide a visual authoring workspace for each presentation that edits slides on a fixed 1920x1080 stage instead of editing raw JSON or only fixed form fields.

#### Scenario: Admin opens the canvas editor
- **WHEN** an administrator opens `/admin/presentations/[id]`
- **THEN** the system MUST show a slide navigator plus a fixed 1920x1080 editing stage for the active slide

##### Example: open the workbench
- **GIVEN** presentation `p-2026-10-31` exists
- **WHEN** admin opens `/admin/presentations/p-2026-10-31`
- **THEN** the page shows the active slide on a 1920x1080 stage and does not reduce the experience to only title/body textareas

#### Scenario: Admin selects and edits a text block
- **WHEN** an administrator selects a text block on the stage
- **THEN** the system MUST expose editable properties for content, font size, font weight, color, alignment, and visibility for that block

##### Example: edit a cover title
- **GIVEN** the cover slide contains block `cover-title`
- **WHEN** admin changes the block text to `BNI 華 AI 分會 週會簡報`
- **THEN** the active slide preview updates that text on the stage before save

#### Scenario: Admin drags and resizes a block
- **WHEN** an administrator drags or resizes a block on the stage
- **THEN** the system MUST update the block frame using stage-relative coordinates and persist the new frame after save

##### Example: move the keynote image
- **GIVEN** keynote slide block `speaker-image` starts at `{x:1200,y:180,width:520,height:620}`
- **WHEN** admin moves it to `{x:1280,y:180,width:420,height:560}` and saves
- **THEN** reopening the slide shows the same saved frame

#### Scenario: Admin reorders slides from the authoring workspace
- **WHEN** an administrator changes slide order from the slide navigator
- **THEN** the system MUST persist the new presentation order without losing each slide layout document

##### Example: move guest slide before keynote
- **GIVEN** slide order is `[cover, agenda, keynote, guest, closing]`
- **WHEN** admin moves `guest` before `keynote`
- **THEN** persisted order becomes `[cover, agenda, guest, keynote, closing]` and both slide layouts remain intact
