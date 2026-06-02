## ADDED Requirements

### Requirement: Member contacts circle

The system SHALL let each member manage contacts in three relationship tiers and keep those contacts grouped by tier.

#### Scenario: Member adds a contact to a tier
- **WHEN** a member submits a contact with a required name and tier
- **THEN** the system MUST create the contact and display it under the matching tier group

##### Example:
- **GIVEN** member `m-021` has no Tier1 contacts
- **WHEN** member adds contact `王大明` to `tier=1`
- **THEN** one row is created and `王大明` appears in Tier1 group

#### Scenario: Member edits contact details
- **WHEN** a member updates relationship, industry, or notes for an existing contact
- **THEN** the system MUST persist the changes and keep the contact attached to the selected tier

##### Example:
- **GIVEN** contact `c-100` tier is `2` and industry is `製造`
- **WHEN** member updates industry to `醫療`
- **THEN** contact `c-100` remains in Tier2 and displays updated industry

#### Scenario: Member removes a contact
- **WHEN** a member deletes a contact from the contacts circle page
- **THEN** the system MUST remove that contact while leaving the remaining tier ordering intact

##### Example:
- **GIVEN** Tier3 has contacts `c-301`, `c-302`
- **WHEN** member deletes `c-301`
- **THEN** `c-301` is removed and `c-302` remains visible in Tier3
