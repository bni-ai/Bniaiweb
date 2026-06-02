## ADDED Requirements

### Requirement: Authenticated guest dashboard
The system SHALL route authenticated invited guests to a guest dashboard that shows personalized invitation context and preparation guidance.

#### Scenario: Invited guest logs in
- **WHEN** an authenticated user email does not match `members.email` but matches `guests.email`
- **THEN** the system MUST route the user to `/guest` and show their guest dashboard instead of `/error`

##### Example: guest email routing
- **GIVEN** `guests.email=guest@example.com` and no member exists for `guest@example.com`
- **WHEN** that email completes authentication
- **THEN** callback sets guest access and redirects to `/guest`

#### Scenario: Guest sees inviter and visit information
- **WHEN** a logged-in guest has a guest visit with an inviter member
- **THEN** the dashboard MUST show inviter name, selected visit week, guest status, and visit number badge

##### Example: inviter and visit badge
- **GIVEN** guest `g-001` is invited by member `王小明` for week `2026-06-08` with `visit_number=2`
- **WHEN** that guest opens `/guest` after login
- **THEN** the dashboard shows inviter `王小明`, week `2026-06-08`, and returning guest badge

#### Scenario: Guest sees fifteen-second preparation guidance
- **WHEN** a logged-in guest opens the preparation page
- **THEN** the system MUST show prompts for name, company, specialty, target referral, and one clear ask suitable for a fifteen-second introduction

##### Example: fifteen-second prompt fields
- **GIVEN** guest `g-001` opens `/guest/prepare`
- **WHEN** preparation guidance is rendered
- **THEN** the page shows fields for `姓名`, `公司`, `專業`, `希望被引薦的對象`, and `一句明確需求`

### Requirement: Guest limited member directory
The system SHALL allow authenticated guests to view a limited member directory while excluding member-only actions.

#### Scenario: Guest opens limited member directory
- **WHEN** a guest opens `/guest/members`
- **THEN** the system MUST show public member fields such as name, company, and specialty and MUST NOT show one-on-one booking, member editing, or admin actions
