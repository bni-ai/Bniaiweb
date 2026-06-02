## ADDED Requirements

### Requirement: Member profile CRUD

The system SHALL allow chapter administrators to create, view, update, activate, and deactivate member records for their own chapter while preserving all member schema fields.

#### Scenario: Admin creates a member record
- **WHEN** an administrator submits the required member profile fields for a new record
- **THEN** the system MUST create the member in the current chapter with the submitted schema fields and show the record in the admin members list

##### Example:
- **GIVEN** admin is in chapter `ch-huaai`
- **WHEN** admin submits member_number `037`, name `陳小安`, and required profile fields
- **THEN** new row is created with `chapter_id='ch-huaai'` and appears in `/admin/members`

#### Scenario: Admin edits a member record
- **WHEN** an administrator updates profile, specialty, referral, company, or organization fields on an existing member
- **THEN** the system MUST persist the changes and show the updated values on both the admin detail page and the member self-service profile page

##### Example:
- **GIVEN** member `m-037` has `specialty_title='保險'`
- **WHEN** admin updates it to `企業風險規劃`
- **THEN** save succeeds and both admin detail and member profile display `企業風險規劃`

#### Scenario: Admin toggles active status
- **WHEN** an administrator changes a member from active to inactive or inactive to active
- **THEN** the system MUST persist the flag and refresh the admin members list with the new status badge

##### Example:
- **GIVEN** member `m-037` has `is_active=true`
- **WHEN** admin toggles to inactive
- **THEN** `is_active=false` is persisted and list badge changes to inactive

#### Scenario: Admin filters the members list
- **WHEN** an administrator filters the members list by committee, role, or active status
- **THEN** the system MUST show only members that match the selected filters and current chapter

##### Example:
- **GIVEN** filters are `committee='教育協調'` and `is_active=true`
- **WHEN** admin applies filters
- **THEN** list only shows active members in that committee under current chapter
