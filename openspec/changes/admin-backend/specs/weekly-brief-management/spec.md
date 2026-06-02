## ADDED Requirements

### Requirement: Weekly brief management

The system SHALL let officers review weekly brief coverage for every active chapter member and update submitted content for the selected week.

#### Scenario: Officer views weekly submission coverage
- **WHEN** an officer opens the weekly briefs page for a specific week
- **THEN** the system MUST show every active chapter member with submitted, draft, or missing status plus the current submission count badge

##### Example:
- **GIVEN** chapter has 36 active members and 18 submitted briefs for `2026-06-01`
- **WHEN** officer opens `/admin/submission?week=2026-06-01`
- **THEN** table shows 36 rows and badge `18/36 已提交`

#### Scenario: Officer edits a submitted or draft brief
- **WHEN** an officer updates the have_this_week or want_this_week content for a member in the selected week
- **THEN** the system MUST persist the edited content and refresh the row summary for that member

##### Example:
- **GIVEN** member `m-026` has submitted brief for `2026-06-01`
- **WHEN** officer edits `want_this_week` and saves
- **THEN** same weekly row is updated and list summary reflects the new text

#### Scenario: Officer approves a brief from the list
- **WHEN** an officer approves a member brief from the weekly list or modal
- **THEN** the system MUST persist the approved state for that week and keep the member in the same weekly report view

##### Example:
- **GIVEN** brief `wb-026` is `submitted` but not approved
- **WHEN** officer clicks approve in list
- **THEN** `wb-026` becomes approved and page remains on week `2026-06-01`
