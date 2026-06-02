## ADDED Requirements

### Requirement: VP report management

The system SHALL let officers enter and maintain one weekly VP report with validated numeric metrics.

#### Scenario: Officer saves a VP report
- **WHEN** an officer enters valid totals for referrals, one-on-ones, visitors, attendance, referral value, and notes
- **THEN** the system MUST create or update the weekly_vp_reports row for the selected chapter-week and show the saved values on reload

##### Example:
- **GIVEN** week `2026-06-01` has no VP report
- **WHEN** officer saves `total_referrals=18`, `total_one_on_ones=24`, `referral_value_twd=520000`
- **THEN** one `weekly_vp_reports` row is created for that week and values match after reload

#### Scenario: Officer edits an existing VP report
- **WHEN** an officer changes one or more metrics for a week that already has a VP report
- **THEN** the system MUST update the existing row instead of creating a duplicate report

##### Example:
- **GIVEN** week `2026-06-01` already has report `vp-001`
- **WHEN** officer changes `total_visitors` from `6` to `7`
- **THEN** row `vp-001` is updated and row count for that week remains `1`

#### Scenario: Officer submits invalid negative metrics
- **WHEN** an officer attempts to save a negative count or negative TWD amount
- **THEN** the system MUST reject the save, keep the entered values visible, and show field-level validation feedback

##### Example:
- **GIVEN** officer enters `total_referrals=-1`
- **WHEN** officer clicks save
- **THEN** API rejects request and UI shows validation error on `total_referrals` field without persisting data
