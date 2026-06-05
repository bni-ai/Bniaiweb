## MODIFIED Requirements

### Requirement: Canvas editor supports slide-level CRUD controls
The system SHALL expose slide-level controls in the canvas editor's slide navigator panel. The canvas editor MUST support inserting image elements onto the canvas, in addition to text layers. Each slide thumbnail MUST display duplicate and delete buttons. The panel MUST include an "add blank slide" button at the bottom.

#### Scenario: Canvas editor toolbar shows image insert button
- **WHEN** an officer opens the presentation editor
- **THEN** the toolbar MUST show "新增文字框" and "插入圖片" buttons

#### Scenario: Slide navigator shows CRUD buttons
- **WHEN** an officer opens the presentation editor
- **THEN** each slide thumbnail in the navigator MUST show a duplicate button and a delete button (disabled for fixed slides)

### Requirement: Canvas editor preserves editor patches across CRUD operations
The system SHALL ensure that duplicate, add, and delete operations do not corrupt or lose existing editor patches for unaffected slides. This includes preserving both textLayers and imageLayers.

#### Scenario: Image layers are preserved when duplicating a slide
- **GIVEN** a presentation with a slide containing an image layer
- **WHEN** an officer duplicates that slide
- **THEN** the new slide MUST retain the image layer with the same imageUrl, position, and size
