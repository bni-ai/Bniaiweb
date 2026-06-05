## MODIFIED Requirements

### Requirement: HTML presentation runtime

The system SHALL render published presentations as HTML slide decks with page-based navigation instead of a long scrolling page. Presenter-facing timer state MUST remain separate from slide content mutation, while timer-enabled slides SHALL render a read-only timer overlay in the public viewer.

#### Scenario: Viewer opens a published deck

- **WHEN** a browser opens `/presentation/[week-date]` for a published presentation
- **THEN** the system MUST render one active slide at a time with page label and next/previous navigation

##### Example: active slide state
- **GIVEN** a published presentation has 9 slides
- **WHEN** browser opens `/presentation/2026-06-01`
- **THEN** the viewer shows page label `1 / 9` and only one slide is marked active

#### Scenario: Viewer reflects admin-edited content

- **WHEN** a published presentation slide has saved editor content
- **THEN** the HTML viewer MUST render that edited title, body, background image, and font size instead of only the generated defaults

##### Example: edited cover slide
- **GIVEN** cover slide editor content is `自訂封面標題`
- **WHEN** browser opens the published presentation
- **THEN** the first visible slide shows `自訂封面標題`

#### Scenario: Viewer shows read-only timer overlay on timer-enabled slide

- **WHEN** the active slide enables timer display
- **THEN** the public viewer MUST render the timer overlay without pause / resume / reset controls

##### Example: viewer reads timer-only state
- **GIVEN** the active slide stores `timerEnabled=true` and `timerSeconds=30`
- **WHEN** browser opens that slide in the published viewer
- **THEN** a timer overlay appears in the top-right corner and no control buttons are rendered

#### Scenario: Presenter timer does not mutate slide content

- **WHEN** the presenter starts, pauses, resumes, or resets the meeting timer
- **THEN** the slide content data and published deck snapshot MUST remain unchanged

##### Example: timer changes without deck mutation
- **GIVEN** published deck snapshot `deck-2026-06-01` is loaded in present mode
- **WHEN** the presenter starts a `30` second timer, pauses it, and resets it
- **THEN** `deck-2026-06-01` slide content remains unchanged before and after timer actions
