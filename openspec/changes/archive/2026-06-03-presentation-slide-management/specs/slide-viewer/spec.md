## MODIFIED Requirements

### Requirement: Slide viewer
The system SHALL expose a public presentation route that renders published slide decks in fullscreen without application chrome. The viewer MUST render one active slide at a time inside a fixed 1920x1080 canvas and provide keyboard and button navigation. The viewer MUST resolve data-driven slide content from the database at render time, merging live data with stored layout overrides.

#### Scenario: Viewer opens a published presentation
- **WHEN** a browser requests `/presentation/[week-date]` for a published presentation record
- **THEN** the system MUST render the stored visible slides in order inside the fullscreen presentation frame

#### Scenario: Viewer renders a single active slide
- **WHEN** a browser opens `/presentation/2026-06-01` for a deck with three visible slides
- **THEN** the viewer MUST show slide `1 / 3` and MUST NOT render all three slides as a vertical long page

##### Example: active slide state
- **GIVEN** runtime deck slides are `[cover, keynote, team]`
- **WHEN** the viewer first loads
- **THEN** active index is `0`, displayed page label is `1 / 3`, and only the cover slide is active

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

#### Scenario: Viewer encounters malformed slide entries
- **WHEN** the stored slide_order contains an unknown type or invalid entry shape
- **THEN** the system MUST block rendering and reject the malformed presentation data before any slide component is rendered

##### Example:
- **GIVEN** `slide_order` contains `{ "type": "unknown", "id": "x" }`
- **WHEN** viewer tries to render the deck
- **THEN** render is rejected and no slide component mounts

#### Scenario: Viewer renders member slide with live data
- **WHEN** the viewer renders a member slide
- **THEN** the system MUST query the members and weekly_briefs tables for the latest data and merge it with the stored editor patch

##### Example:
- **GIVEN** a member updated their specialty_title after the presentation was last saved
- **WHEN** the viewer renders that member slide
- **THEN** the slide displays the updated specialty_title

#### Scenario: Viewer handles missing data source
- **WHEN** a data-driven slide references a deleted record
- **THEN** the viewer MUST render a placeholder message and MUST NOT crash or show blank content

##### Example:
- **GIVEN** a member slide references a member_id that no longer exists
- **WHEN** the viewer renders that slide
- **THEN** the slide shows "會員資料暫時無法取得" instead of crashing
