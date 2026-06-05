## ADDED Requirements

### Requirement: HTML presentation runtime
The system SHALL render published presentations as HTML slide decks with page-based navigation instead of a long scrolling page.

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
