## ADDED Requirements

### Requirement: Self-service registration creates a low-privilege account

The system SHALL allow an unauthenticated visitor to create an account without administrator intervention. A newly created account MUST start in a low-privilege pending state and MUST NOT receive `member` or `admin` access automatically.

#### Scenario: New user completes self-service signup

- **WHEN** a visitor submits a valid signup form
- **THEN** the system SHALL create an authenticated account, mark it as pending approval, and route the user to a low-privilege post-login state instead of `/dashboard` or `/admin`

#### Scenario: Duplicate email is rejected

- **WHEN** a visitor attempts to sign up with an email that already has an account
- **THEN** the system SHALL reject the signup with a readable error message and SHALL NOT create a second account

##### Example: duplicate signup attempt
- **GIVEN** `member@example.com` already has an authenticated account
- **WHEN** a visitor submits signup for `member@example.com`
- **THEN** the system returns a readable duplicate-account error and no new pending account is created

### Requirement: Admin can approve and promote a pending account

The system SHALL let an administrator review pending accounts and promote each approved account to `member` or `admin`.

#### Scenario: Admin approves a pending account as member

- **WHEN** an administrator approves a pending account as `member`
- **THEN** the system SHALL persist the new access level and the user SHALL enter `/dashboard` on the next successful auth refresh or login

#### Scenario: Admin approves a pending account as admin

- **WHEN** an administrator approves a pending account as `admin`
- **THEN** the system SHALL persist the new access level and the user SHALL enter `/admin` on the next successful auth refresh or login
