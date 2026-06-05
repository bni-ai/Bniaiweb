## ADDED Requirements

### Requirement: Self-service registration creates a low-privilege account

The system SHALL allow an unauthenticated visitor to create an account only when they present a valid invite token via the `token` query parameter. A newly created account MUST start in a low-privilege pending state and MUST NOT receive `member` or `admin` access automatically. Visitors without a valid token SHALL NOT be able to submit the signup form.

#### Scenario: New user completes self-service signup with valid invite token

- **WHEN** a visitor holding a valid invite token submits a valid signup form
- **THEN** the system SHALL create an authenticated account, mark it as pending approval, mark the invite token as used, and route the user to a low-privilege post-login state instead of `/dashboard` or `/admin`

#### Scenario: Visitor without token cannot access signup form

- **WHEN** a visitor navigates to `/signup` without a token or with an invalid token
- **THEN** the system SHALL display a blocked-state message and SHALL NOT render the signup form

#### Scenario: Duplicate email is rejected

- **WHEN** a visitor attempts to sign up with an email that already has an account
- **THEN** the system SHALL reject the signup with a readable error message and SHALL NOT create a second account

##### Example: duplicate signup attempt
- **GIVEN** `member@example.com` already has an authenticated account
- **WHEN** a visitor submits signup for `member@example.com`
- **THEN** the system returns a readable duplicate-account error and no new pending account is created

### Requirement: Member self-service registration is invitation-only

The system SHALL reserve self-service member registration for invited users only. Visitors without a valid invite token MUST be redirected to guest-facing entry points instead of seeing a member signup form.

#### Scenario: Visitor opens member signup without invite

- **WHEN** a visitor opens `/signup` without a valid token
- **THEN** the system SHALL explain that member registration is invitation-only and SHALL provide a guest-facing alternative such as `/guest/register`
