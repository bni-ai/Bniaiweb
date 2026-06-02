## ADDED Requirements

### Requirement: Presentation present mode
The system SHALL expose a speaker-facing present mode route for published presentations. Present mode MUST use the same published deck data as the public viewer and MUST show current slide, next slide preview, timer, and speaker notes fallback.

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

#### Scenario: Present mode displays timer
- **WHEN** present mode loads
- **THEN** the system MUST display an elapsed timer that starts at `00:00`

#### Scenario: Present mode displays speaker notes fallback
- **WHEN** a slide has no stored speaker notes field
- **THEN** the system MUST display notes derived from the slide type and summary

##### Example:
- **GIVEN** a keynote slide has title `AI 實戰短講` and no stored speaker notes field
- **WHEN** present mode displays that keynote slide
- **THEN** notes include `演講` and `AI 實戰短講`
