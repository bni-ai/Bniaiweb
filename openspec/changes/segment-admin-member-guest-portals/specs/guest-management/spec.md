## ADDED Requirements

### Requirement: Guest contact ownership
The system SHALL let officers identify the inviter or assigned contact person responsible for a guest's follow-up and member introductions.

#### Scenario: Officer reviews guest follow-up owner
- **WHEN** an officer opens a guest visit record
- **THEN** the system MUST show the inviter or assigned contact person responsible for follow-up

##### Example: owner visible on visit card
- **GIVEN** guest visit `gv-001` is assigned to contact person `王小明`
- **WHEN** an officer opens `/admin/guests`
- **THEN** the guest card shows `王小明` as the follow-up owner

#### Scenario: Officer updates guest contact owner
- **WHEN** an officer changes the contact person for a guest visit
- **THEN** the guest portal MUST use the updated contact person as the introduction window

##### Example: owner update reflected in portal
- **GIVEN** guest visit `gv-001` is assigned to `王小明`
- **WHEN** an officer changes the contact person to `陳美玲`
- **THEN** the authenticated guest portal shows `陳美玲` as the introduction window

### Requirement: Guest introduction request tracking
The system SHALL support tracking that a guest wants an introduction to other members through the guest's contact person.

#### Scenario: Guest requests an introduction
- **WHEN** a guest submits interest in contacting another member or member category
- **THEN** the system MUST record enough information for the contact person to follow up outside the guest portal

##### Example: introduction request payload
- **GIVEN** guest `guest@example.com` is assigned to contact person `王小明`
- **WHEN** the guest requests an introduction to `AI 顧問`
- **THEN** the follow-up record includes guest email `guest@example.com`, contact person `王小明`, and target interest `AI 顧問`

#### Scenario: Officer can review implementation gaps against agreed workflow
- **WHEN** officers prepare the next apply round for guest segmentation
- **THEN** the change artifacts MUST make clear that guest feedback page, guest connection page, and follow-up tracking are still pending implementation rather than already delivered

##### Example: gap visibility
- **GIVEN** the change is reviewed before implementation resumes
- **WHEN** an officer checks the SR artifacts
- **THEN** the artifacts explicitly state that guest feedback submission, connection request workflow, and three-portal switch UI are pending work
