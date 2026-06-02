## ADDED Requirements

### Requirement: Member directory

The system SHALL let members browse active members from their own chapter and search the list by name or specialty.

#### Scenario: Member opens the directory
- **WHEN** an authenticated member navigates to `/dashboard/directory`
- **THEN** the system MUST show active-member cards for the current chapter with photo, chinese_name, specialty_title, and company_name

#### Scenario: Member searches by name or specialty
- **WHEN** a member enters a search term matching a Chinese name, English name, or specialty field
- **THEN** the system MUST filter the directory list to matching active members in the current chapter

##### Example:
- **GIVEN** active members include `吳文凱 (AI落地顧問)` and `王小明 (保險規劃)`
- **WHEN** member enters keyword `AI`
- **THEN** directory list keeps `吳文凱` and hides `王小明`

#### Scenario: Member opens profile details
- **WHEN** a member selects a directory card
- **THEN** the system MUST show a profile modal with specialty description, referral targets, and LINE name but no direct contact action

##### Example:
- **GIVEN** card `吳文凱` is visible in `/dashboard/directory`
- **WHEN** user clicks the card
- **THEN** modal shows `specialty_description`, `referral_targets`, and `line_name`, and no direct call/chat button is rendered

#### Scenario: Member gets no search results
- **WHEN** a search term matches no active member records
- **THEN** the system MUST show a no-results state while preserving the entered search term

##### Example:
- **GIVEN** current chapter has no member with keyword `稅務`
- **WHEN** user searches `稅務`
- **THEN** page shows empty-state message and keeps `稅務` in the search input
