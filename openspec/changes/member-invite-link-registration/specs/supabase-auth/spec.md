## ADDED Requirements

### Requirement: Signup route enforces invite token before account creation

The signup route (`/auth/signup`) SHALL validate the `inviteToken` field in the request body before creating any Supabase Auth account. If the token is absent, unknown, expired, or already used, the route SHALL return `400 { error: "邀請連結無效或已過期。" }` and SHALL NOT create an account. If the token is valid, the route SHALL proceed with account creation and then mark the token as used.

#### Scenario: Signup with valid token creates account

- **WHEN** a POST to `/auth/signup` includes a valid `inviteToken` and all required fields
- **THEN** the system SHALL create the Supabase Auth account, persist the `pending_member` record, and set `member_invites.used_at = now()`

#### Scenario: Signup without token returns 400

- **WHEN** a POST to `/auth/signup` is made without an `inviteToken` field
- **THEN** the system SHALL return `400 { error: "邀請連結無效或已過期。" }` and SHALL NOT create any account

##### Example: token validation matrix at submission

| inviteToken value | Expected response |
|---|---|
| Absent / empty | 400 invalid token error |
| Not found in DB | 400 invalid token error |
| `used_at` is not null | 400 invalid token error |
| `expires_at` in the past | 400 invalid token error |
| Valid (exists, unused, not expired) | 201 account created, token marked used |

### Requirement: Guest public signup uses a dedicated route

The system SHALL separate public guest signup from member invite signup. Public guest registration MUST use `/guest/register` for the page and `/auth/guest-signup` for submission, while `/signup` and `/auth/signup` remain reserved for invited member registration.

#### Scenario: Guest opens public registration page

- **WHEN** an unauthenticated visitor navigates to `/guest/register`
- **THEN** the system SHALL show the guest registration form without requiring an invite token

#### Scenario: Guest submits public registration

- **WHEN** an unauthenticated visitor submits a valid guest registration to `/auth/guest-signup`
- **THEN** the system SHALL create the guest account, set the guest role cookie, and return a redirect to `/guest`

### Requirement: Social login is reserved for approved member identities

The system SHALL allow Google or GitHub login only when the resolved identity is an approved member or administrator. If OAuth resolves to `guest` or `pending_member`, the system MUST clear auth cookies and reject the session.

#### Scenario: Member completes Google login

- **WHEN** a Google or GitHub callback resolves to a `member` or `admin` identity
- **THEN** the system SHALL keep the authenticated session and redirect to the member or admin destination

#### Scenario: Guest tries Google login

- **WHEN** a Google or GitHub callback resolves to a `guest` or `pending_member` identity
- **THEN** the system SHALL clear auth cookies, redirect to an error state, and instruct the user to use email/password or magic link instead
