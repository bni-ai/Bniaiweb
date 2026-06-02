## ADDED Requirements

### Requirement: Slide viewer

The system SHALL expose a public presentation route that renders published slide decks in fullscreen without application chrome.

#### Scenario: Viewer opens a published presentation
- **WHEN** a browser requests `/presentation/[week-date]` for a published presentation record
- **THEN** the system MUST render the stored visible slides in order inside the fullscreen presentation frame

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
- **GIVEN** `slide_order` contains `{ \"type\": \"unknown\", \"id\": \"x\" }`
- **WHEN** viewer tries to render the deck
- **THEN** render is rejected and no slide component mounts
