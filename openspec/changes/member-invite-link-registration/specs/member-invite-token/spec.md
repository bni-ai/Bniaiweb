## ADDED Requirements

### Requirement: Admin can generate a one-time member invite token

The system SHALL allow an admin to generate a one-time invite token for a specified email address. The token SHALL be stored in the `member_invites` table with `expires_at` set to 7 days from creation and `used_at` set to null. The system SHALL return a full invite URL in the form `/signup?token=<token>` for the admin to copy and forward manually.

#### Scenario: Admin generates invite for a new email

- **WHEN** an admin submits a valid email address via the generate-invite action
- **THEN** the system SHALL insert a row into `member_invites` with a unique 64-character hex token, `expires_at = now() + 7 days`, and `used_at = null`, and SHALL return the full invite URL

#### Scenario: Admin generates invite for an email that already has a pending invite

- **WHEN** an admin submits an email that already has an unused, non-expired invite token
- **THEN** the system SHALL generate a new token and return a new invite URL; the old token SHALL remain valid until it expires or is used

##### Example: duplicate invite generation
- **GIVEN** `member_invites` contains a row for `new@example.com` with `used_at = null` and `expires_at` in the future
- **WHEN** admin generates a new invite for `new@example.com`
- **THEN** a second row is inserted; both tokens are independently valid

### Requirement: Signup page validates invite token before displaying form

The system SHALL validate the `token` query parameter on the `/signup` page before rendering the application form. A page load with no token, an unknown token, an expired token, or an already-used token SHALL display a blocked state explaining that the page is invitation-only. Only a valid (exists, `used_at IS NULL`, `expires_at > now()`) token SHALL reveal the signup form.

#### Scenario: Valid token reveals signup form

- **WHEN** a visitor navigates to `/signup?token=<valid-token>`
- **THEN** the system SHALL display the member application form

#### Scenario: Missing or invalid token blocks form

- **WHEN** a visitor navigates to `/signup` with no token, an unknown token, an expired token, or an already-used token
- **THEN** the system SHALL display a readable blocked-state message and SHALL NOT render the application form

##### Example: token states

| Token state | Expected page content |
|---|---|
| Absent (no query param) | Blocked state: invitation-only message |
| Unknown (not in DB) | Blocked state: invalid link message |
| Expired (`expires_at` in past) | Blocked state: expired link message |
| Already used (`used_at` not null) | Blocked state: already-used link message |
| Valid | Member application form |

### Requirement: Signup route validates token before creating account

The system SHALL re-validate the invite token server-side during the POST to `/auth/signup`. If the token is invalid, expired, or already used at submission time, the system SHALL return a 400 error and SHALL NOT create a new account. Upon successful account creation, the system SHALL set `member_invites.used_at = now()` for that token.

#### Scenario: Valid token allows account creation and marks token used

- **WHEN** a POST to `/auth/signup` includes a valid `inviteToken` and the account is successfully created
- **THEN** the system SHALL set `used_at = now()` on the corresponding `member_invites` row and SHALL NOT allow the same token to be used again

#### Scenario: Invalid token at submission time blocks account creation

- **WHEN** a POST to `/auth/signup` includes a token that is expired, used, or not found
- **THEN** the system SHALL return `400 { error: "邀請連結無效或已過期。" }` and SHALL NOT create any account
