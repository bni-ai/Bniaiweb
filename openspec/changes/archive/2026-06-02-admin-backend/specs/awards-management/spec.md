## ADDED Requirements

### Requirement: Awards management

The system SHALL let officers manage multiple award records for the same meeting week.

#### Scenario: Officer adds an award
- **WHEN** an officer selects a recipient, chooses an award type, and saves a description for the selected week
- **THEN** the system MUST create a weekly_awards row and show it in the weekly awards list

##### Example:
- **GIVEN** week `2026-06-01` has no `visitor_award`
- **WHEN** officer selects recipient `m-018`, type `visitor_award`, description `帶來2位來賓`
- **THEN** new `weekly_awards` row appears in that week's award list

#### Scenario: Officer edits an award
- **WHEN** an officer changes the recipient, award type, or description for an existing weekly award
- **THEN** the system MUST persist the updated values and keep the award associated with the same week

##### Example:
- **GIVEN** award `a-001` belongs to `2026-06-01`
- **WHEN** officer changes description from `帶來1位來賓` to `帶來2位來賓`
- **THEN** row `a-001` updates and still belongs to week `2026-06-01`

#### Scenario: Officer deletes a single award
- **WHEN** an officer removes one award from the weekly awards list
- **THEN** the system MUST delete only that weekly_awards row and leave other awards for the week untouched

##### Example:
- **GIVEN** week `2026-06-01` has awards `a-001`, `a-002`
- **WHEN** officer deletes `a-001`
- **THEN** `a-002` remains and only `a-001` is removed
