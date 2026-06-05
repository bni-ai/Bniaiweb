## MODIFIED Requirements

### Requirement: Presentation present mode

The system SHALL expose a speaker-facing present mode route for published presentations. Present mode MUST use the same published deck data as the public viewer and MUST show current slide, next slide preview, speaker notes, and the active slide timer controller when that slide enables timer display.

#### Scenario: Speaker opens present mode

- **WHEN** a browser requests `/presentation/2026-06-01/present` for a published presentation
- **THEN** the system MUST render present mode without admin or member application chrome

#### Scenario: Present mode shows current and next slide

- **WHEN** present mode opens a deck with at least two slides
- **THEN** the system MUST show the current slide, next slide preview, and page label

##### Example: present mode preview
- **GIVEN** runtime deck slides are `[cover, keynote, team]`
- **WHEN** present mode first loads
- **THEN** current slide is `cover`, next preview is `keynote`, and page label is `1 / 3`

#### Scenario: Present mode reaches final slide

- **WHEN** present mode reaches the final slide
- **THEN** the system MUST show an end-of-deck next preview state instead of duplicating the current slide

##### Example:
- **GIVEN** runtime deck slides are `[cover, keynote, team]`
- **WHEN** present mode active slide is `team`
- **THEN** next preview displays `簡報結束`

#### Scenario: Present mode shows timer controls only for timer-enabled slides

- **WHEN** the active slide enables timer display
- **THEN** present mode MUST show the timer countdown plus pause / resume / reset controls

##### Example: timer-enabled active slide
- **GIVEN** the active slide stores `timerEnabled=true` and `timerSeconds=30`
- **WHEN** present mode loads that slide
- **THEN** the timer shows `00:30` and exposes control buttons

#### Scenario: Present mode hides timer controls for slides without timer

- **WHEN** the active slide does not enable timer display
- **THEN** present mode MUST not show an inactive placeholder timer

##### Example: timer-disabled slide
- **GIVEN** the active slide stores `timerEnabled=false`
- **WHEN** present mode renders that slide
- **THEN** no timer controls are shown

#### Scenario: Present mode displays speaker notes fallback

- **WHEN** a slide has no stored speaker notes field
- **THEN** the system MUST display notes derived from the slide type and summary

##### Example:
- **GIVEN** a keynote slide has title `AI 實戰短講` and no stored speaker notes field
- **WHEN** present mode displays that keynote slide
- **THEN** notes include `演講` and `AI 實戰短講`
