## ADDED Requirements

### Requirement: Slide timer config is stored per slide

The system SHALL let officers configure timer visibility and timer seconds for each slide independently.

#### Scenario: Officer enables timer for one slide

- **WHEN** an officer edits a slide in the presentation workbench
- **THEN** the slide inspector SHALL allow the officer to enable or disable a timer for that slide

##### Example: per-slide timer toggle
- **GIVEN** the officer is editing slide 3
- **WHEN** the officer enables the timer and enters `30`
- **THEN** slide 3 stores `timerEnabled=true` and `timerSeconds=30`

#### Scenario: Slide without timer stays clean

- **WHEN** an officer leaves the timer unchecked for a slide
- **THEN** the slide SHALL not render a timer in present mode or viewer

##### Example: timer disabled
- **GIVEN** slide 4 has `timerEnabled=false`
- **WHEN** the slide is shown in runtime
- **THEN** no timer overlay is rendered

### Requirement: Meeting timer runs as countdown with overtime

The system SHALL turn an enabled slide timer into a countdown that can enter overtime when it reaches zero.

#### Scenario: Countdown starts from configured seconds

- **WHEN** runtime opens a slide with `timerEnabled=true`
- **THEN** the timer SHALL start from that slide's configured seconds

##### Example: thirty-second slide
- **GIVEN** the active slide has `timerSeconds=30`
- **WHEN** the slide becomes active
- **THEN** the timer starts from `00:30`

#### Scenario: Countdown enters overtime

- **WHEN** the timer reaches `00:00`
- **THEN** the system SHALL keep showing overtime instead of auto-advancing the slide

##### Example: no auto-advance
- **GIVEN** the active slide timer reaches `00:00`
- **WHEN** another second passes
- **THEN** the timer shows overtime and the current slide does not change

### Requirement: Present mode controls timer and viewer mirrors it

The system SHALL allow present mode to control the timer while the public viewer remains read-only and mirrors the same session state.

#### Scenario: Present mode controls timer state

- **WHEN** the presenter pauses, resumes, or resets the active slide timer
- **THEN** the timer state SHALL update in present mode

##### Example: reset returns to slide seconds
- **GIVEN** the active slide timer is configured for `30` seconds
- **WHEN** the presenter clicks reset
- **THEN** the timer returns to `00:30`

#### Scenario: Viewer mirrors current session timer

- **WHEN** a viewer page and a present-mode page open the same published deck in the same browser session
- **THEN** the viewer SHALL display the same timer state for the active slide without exposing control buttons

##### Example: viewer mirrors presenter countdown
- **GIVEN** present mode and viewer both open the same week deck
- **WHEN** the presenter lets a `30` second timer run for several seconds
- **THEN** the viewer shows the same countdown state and no pause/reset controls
