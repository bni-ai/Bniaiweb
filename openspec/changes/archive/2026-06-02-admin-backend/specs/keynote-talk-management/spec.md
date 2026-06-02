## ADDED Requirements

### Requirement: Keynote talk management

The system SHALL let officers create and update one keynote talk record per chapter and week.

#### Scenario: Officer creates a keynote record
- **WHEN** an officer selects a speaker, enters a topic and outline, and saves the keynote for a week
- **THEN** the system MUST create the keynote_talks record for that chapter-week combination and show the saved data on reload

##### Example:
- **GIVEN** week `2026-06-01` has no keynote record
- **WHEN** officer selects speaker `m-012`, topic `AI導入案例`, and clicks save
- **THEN** one `keynote_talks` row is created for that chapter-week

#### Scenario: Officer updates keynote assets
- **WHEN** an officer edits the outline, product image URLs, or status for the same week
- **THEN** the system MUST update the existing keynote record instead of creating a duplicate row

##### Example:
- **GIVEN** keynote `k-2026-06-01` exists
- **WHEN** officer updates `outline` and appends one image URL
- **THEN** row `k-2026-06-01` is updated and no duplicate keynote row is added

#### Scenario: Officer changes the selected week
- **WHEN** an officer navigates to a different week on the keynote page
- **THEN** the system MUST load the keynote data for that week or show an empty draft form if no record exists yet

##### Example:
- **GIVEN** `2026-06-01` has data but `2026-06-08` has none
- **WHEN** officer switches week selector to `2026-06-08`
- **THEN** UI shows empty draft form instead of previous week data
