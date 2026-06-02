## ADDED Requirements

### Requirement: GAINS profile

The system SHALL allow an authenticated member to update the five GAINS fields for their own profile without exposing edit access to other members.

#### Scenario: Member saves goals and accomplishments
- **WHEN** a member edits gains_goals or gains_accomplishments and the auto-save interaction completes
- **THEN** the system MUST persist the latest text and show the saved state on the GAINS page

##### Example:
- **GIVEN** member `m-003` with empty GAINS goals
- **WHEN** member enters `本季目標：每週2次一對一` and auto-save succeeds
- **THEN** `members.gains_goals` stores that text and reload shows the same value

#### Scenario: Member saves interests, networks, and skills
- **WHEN** a member edits gains_interests, gains_networks, or gains_skills and leaves the field
- **THEN** the system MUST save the latest values for that member and reload them on the next visit

##### Example:
- **GIVEN** `gains_skills` currently `簡報`
- **WHEN** member changes it to `簡報、數據分析` and blurs the field
- **THEN** row updates and next visit shows `簡報、數據分析`

#### Scenario: Auto-save failure preserves input
- **WHEN** the GAINS save request fails
- **THEN** the system MUST keep the unsaved text visible, show an inline error, and allow the member to retry without losing content

##### Example:
- **GIVEN** network timeout occurs during save
- **WHEN** member typed `gains_interests='AI社群交流'`
- **THEN** input still shows `AI社群交流`, inline error appears, and retry action is available
