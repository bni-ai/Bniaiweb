## ADDED Requirements

### Requirement: Presentation editor stores per-slide timer config

The system SHALL let officers configure timer visibility and timer seconds as part of each slide's editor data in the presentation workbench.

#### Scenario: Officer edits timer config in workbench

- **WHEN** an officer opens `/admin/presentations/[id]` and selects a slide
- **THEN** the inspector MUST provide a timer toggle and integer seconds input for that slide

##### Example: save 45-second timer
- **GIVEN** the officer selects the keynote slide in the workbench
- **WHEN** the officer enables timer and enters `45`, then saves the presentation
- **THEN** reloading the workbench shows the same slide with `timerEnabled=true` and `timerSeconds=45`
