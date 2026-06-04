## ADDED Requirements

### Requirement: Users can request a password reset

The system SHALL provide a forgot-password flow for password-based accounts.

#### Scenario: Existing account requests reset instructions

- **WHEN** a user submits a known account email through the forgot-password page
- **THEN** the system SHALL issue reset instructions through the configured recovery channel and SHALL show a readable confirmation state

##### Example: known email requests reset
- **GIVEN** `member@example.com` is an existing password-based account
- **WHEN** the user submits `member@example.com` from the forgot-password page
- **THEN** the system confirms that reset instructions were issued

#### Scenario: Unknown or invalid reset request is handled safely

- **WHEN** a reset request cannot be fulfilled because the email or token is invalid
- **THEN** the system SHALL show a readable recovery error state and SHALL NOT throw a raw exception to the browser

##### Example: invalid recovery token
- **GIVEN** a reset link contains token `expired-token`
- **WHEN** the user opens the reset-password surface
- **THEN** the system shows a readable invalid-or-expired-token message instead of a raw exception

### Requirement: Users can set a new password from a valid recovery session

The system SHALL allow a user with a valid recovery session or token to set a new password and return to the login flow.

#### Scenario: User completes password reset

- **WHEN** a user opens the reset-password surface with a valid recovery token and submits a new password
- **THEN** the system SHALL update the password and SHALL route the user back to a successful login entry point

##### Example: successful password update
- **GIVEN** `member@example.com` has a valid recovery session
- **WHEN** the user submits a new password from the reset-password form
- **THEN** the password is updated and the user is routed back to `/login` with a successful recovery state
