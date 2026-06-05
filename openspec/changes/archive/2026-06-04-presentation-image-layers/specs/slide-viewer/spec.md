## MODIFIED Requirements

### Requirement: Slide viewer
The system SHALL expose a public presentation route that renders published slide decks in fullscreen without application chrome. The viewer MUST render one active slide at a time inside a fixed 1920x1080 canvas. The viewer MUST render image elements with their stored position, size, border radius, shadow, and object-fit settings. The viewer MUST also render inline image blocks within text layers.

#### Scenario: Viewer renders a slide with image elements
- **WHEN** the viewer renders a slide containing an image element at x=720, y=360 with width=480, height=360
- **THEN** the image MUST appear at that exact position and size on the canvas

#### Scenario: Viewer renders inline images in text layers
- **WHEN** the viewer renders a text layer containing "Hello\n![product](url)\nWorld"
- **THEN** the viewer MUST display "Hello", followed by the image as a block-level element, followed by "World"

#### Scenario: Viewer handles broken image URLs
- **WHEN** an image element references a URL that returns 404
- **THEN** the viewer MUST display a gray placeholder with "圖片無法載入" text instead of a broken image icon
