## ADDED Requirements

### Requirement: Member top clients

The system SHALL let each member maintain up to ten ranked top-client entries with exactly one slot per rank.

#### Scenario: Member fills an empty client rank
- **WHEN** a member saves a top-client entry for an unused rank between 1 and 10
- **THEN** the system MUST create or update the record for that rank and show the saved values on the ranked card

#### Scenario: Member updates an existing client rank
- **WHEN** a member edits industry, company_type, location, or notes for an existing rank
- **THEN** the system MUST keep the same rank and show the updated content after refresh

##### Example:
- **GIVEN** rank `3` already exists with `industry='醫療'`
- **WHEN** member edits rank `3` to `industry='AI服務'`
- **THEN** row rank remains `3` and page reload shows `industry='AI服務'`

#### Scenario: Page shows all ten ranks
- **WHEN** a member opens the top-clients page with fewer than ten saved records
- **THEN** the system MUST render placeholders for every missing rank from 1 through 10
