## MODIFIED Requirements

### Requirement: Slide viewer
The system SHALL expose a public presentation route that renders a published presentation layout snapshot in fullscreen without application chrome. The viewer MUST render one active slide at a time inside a fixed 1920x1080 canvas, MUST use the stored published layout snapshot as its rendering source, and MUST provide keyboard and button navigation.

#### Scenario: Viewer opens a published presentation
- **WHEN** a browser requests `/presentation/[week-date]` for a published presentation record
- **THEN** the system MUST render the stored visible slides from the published layout snapshot in order inside the fullscreen presentation frame

#### Scenario: Viewer renders a single active slide
- **WHEN** a browser opens `/presentation/2026-06-01` for a deck with three visible slides
- **THEN** the viewer MUST show slide `1 / 3` and MUST NOT render all three slides as a vertical long page

##### Example: active slide state
- **GIVEN** runtime deck slides are `[cover, keynote, team]`
- **WHEN** the viewer first loads
- **THEN** active index is `0`, displayed page label is `1 / 3`, and only the cover slide is active

#### Scenario: Viewer never renders a blank active slide
- **WHEN** a browser opens a published presentation
- **THEN** the active slide MUST contain visible text, a visible image, a visible background, or a visible placeholder inside the 1920x1080 frame
- **AND** the viewer MUST NOT show only the page chrome over an empty dark background

##### Example:
- **GIVEN** the published cover slide has no uploaded background asset
- **WHEN** browser opens `/presentation/2026-10-31`
- **THEN** the first slide still shows chapter name and week date inside the slide frame

#### Scenario: Viewer renders authored blocks from the published snapshot
- **WHEN** the active slide contains text, image, shape, or template blocks in the published layout snapshot
- **THEN** the viewer MUST render those blocks with their saved frames, z-index, and style tokens

##### Example: cover title and background
- **GIVEN** the published cover slide contains block `cover-title` and background asset `weekly-cover`
- **WHEN** browser opens the presentation
- **THEN** the first slide shows `cover-title` content over `weekly-cover` using the saved layout

#### Scenario: Viewer supports keyboard navigation
- **WHEN** a viewer presses ArrowRight or Space
- **THEN** the viewer MUST advance to the next slide until the final slide

##### Example:
- **GIVEN** active page label is `1 / 3`
- **WHEN** the viewer presses ArrowRight
- **THEN** active page label becomes `2 / 3`

#### Scenario: Viewer supports previous navigation
- **WHEN** a viewer presses ArrowLeft
- **THEN** the viewer MUST move to the previous slide until the first slide

##### Example:
- **GIVEN** active page label is `2 / 3`
- **WHEN** the viewer presses ArrowLeft
- **THEN** active page label becomes `1 / 3`

#### Scenario: Viewer requests fullscreen
- **WHEN** a viewer clicks the fullscreen control
- **THEN** the viewer MUST request fullscreen on the presentation runtime root without blocking slide navigation if fullscreen is unavailable

##### Example:
- **GIVEN** fullscreen API is unavailable in the browser
- **WHEN** the viewer clicks `全螢幕`
- **THEN** the viewer remains on the active slide and navigation controls remain usable

#### Scenario: Viewer encounters a missing asset
- **WHEN** a slide block references an asset that cannot be resolved
- **THEN** the viewer MUST render a non-breaking placeholder state for that block and MUST keep the rest of the slide deck navigable

##### Example:
- **GIVEN** block `guest-logo` points to a deleted asset
- **WHEN** the viewer renders that slide
- **THEN** the block shows a placeholder instead of crashing the whole viewer

#### Scenario: Viewer requests a missing presentation
- **WHEN** a browser requests a week-date route that has no published presentation
- **THEN** the system MUST return a not-found response instead of rendering an empty deck

##### Example:
- **GIVEN** no published row exists for week `2026-07-01`
- **WHEN** browser opens `/presentation/2026-07-01`
- **THEN** server returns not-found page

#### Scenario: Viewer requests an unpublished presentation
- **WHEN** a browser requests a week-date route whose presentation status is not published
- **THEN** the system MUST return a not-found response instead of exposing the draft deck

##### Example:
- **GIVEN** presentation for `2026-06-15` exists with `status='draft'`
- **WHEN** browser opens `/presentation/2026-06-15`
- **THEN** viewer is blocked with not-found response

#### Scenario: Viewer encounters malformed layout data
- **WHEN** the stored published layout snapshot contains an unknown block kind, invalid frame, or invalid slide shape
- **THEN** the system MUST block rendering and reject the malformed presentation data before any slide component is rendered

##### Example:
- **GIVEN** a slide contains block `{ \"kind\": \"unknown-widget\", \"id\": \"x\" }`
- **WHEN** viewer tries to render the deck
- **THEN** render is rejected and no published slide mounts
