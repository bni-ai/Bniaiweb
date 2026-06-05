## MODIFIED Requirements

### Requirement: Authenticated guest dashboard
The system SHALL route low-privilege authenticated users to a guest-oriented dashboard state that explains why they do not yet have member access. Invited guests and self-registered pending accounts SHALL use a shared low-privilege shell implementation only if the system still preserves distinct status messaging.

#### Scenario: Invited guest logs in
- **WHEN** an authenticated user email does not match an approved member account but matches `guests.email`
- **THEN** the system MUST route the user to `/guest` and show their guest dashboard instead of `/error`

##### Example: guest email routing
- **GIVEN** `guests.email=guest@example.com` and no approved member exists for `guest@example.com`
- **WHEN** that email completes authentication
- **THEN** callback sets guest access and redirects to `/guest`

#### Scenario: Pending self-registered account logs in
- **WHEN** an authenticated account exists for the user but the account is still waiting for admin approval
- **THEN** the system MUST route the user to the low-privilege guest/pending entry state and show that approval is still pending

##### Example: pending account routing
- **GIVEN** account `newmember@example.com` exists in auth and is marked `pending`
- **WHEN** that user completes password login
- **THEN** callback redirects to `/guest` and the surface explains that member approval is still pending

#### Scenario: Guest sees inviter and visit information
- **WHEN** a logged-in invited guest has a guest visit with an inviter member
- **THEN** the dashboard MUST show inviter name, selected visit week, guest status, and visit number badge

##### Example: inviter and visit badge
- **GIVEN** guest `g-001` is invited by member `王小明` for week `2026-06-08` with `visit_number=2`
- **WHEN** that guest opens `/guest` after login
- **THEN** the dashboard shows inviter `王小明`, week `2026-06-08`, and returning guest badge

#### Scenario: Guest sees fifteen-second preparation guidance
- **WHEN** a logged-in invited guest opens the preparation page
- **THEN** the system MUST show prompts for `姓名`, `公司`, `專業`, `希望被引薦的對象`, and `一句明確需求`
