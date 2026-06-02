## ADDED Requirements

### Requirement: Guest role access boundary
The system SHALL treat invited guests as a distinct limited role that is separate from anonymous users, members, and admins.

#### Scenario: Guest tries to open admin
- **WHEN** a user with guest access opens `/admin` or any `/admin/*` route
- **THEN** middleware MUST redirect the user to `/guest`

#### Scenario: Guest tries to open member dashboard
- **WHEN** a user with guest access opens `/dashboard` or any member-only route
- **THEN** middleware MUST redirect the user to `/guest`

#### Scenario: Member email overlaps guest email
- **WHEN** an authenticated email exists in both `members.email` and `guests.email`
- **THEN** the system MUST apply member or admin access before guest access

##### Example: member precedence
- **GIVEN** `members.email=same@example.com` and `guests.email=same@example.com`
- **WHEN** `same@example.com` completes authentication
- **THEN** callback follows the member role path and does not assign guest-only access

### Requirement: Unknown authenticated users remain blocked
The system SHALL continue to block authenticated users whose email is neither a member email nor an invited guest email.

#### Scenario: Unknown user logs in
- **WHEN** an authenticated email does not exist in `members.email` or `guests.email`
- **THEN** the system MUST route the user to an error page explaining that the email is not a member or invited guest
