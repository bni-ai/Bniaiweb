## MODIFIED Requirements

### Requirement: Google OAuth Login

The system SHALL authenticate users using Supabase Auth across Google OAuth, password login, magic link, and optional GitHub OAuth. The login page SHALL expose the enabled auth entry points, plus signup and password-recovery entry points for password-based accounts. Upon successful auth callback, the system SHALL resolve the authenticated account into `admin`, `member`, low-privilege pending, or unknown access before redirecting.

#### Scenario: Existing member logs in

- **WHEN** a user completes Google OAuth and their email belongs to an approved member account
- **THEN** the system SHALL update `members.auth_uid` with `auth.uid()` when needed, store the resolved role in the session, and redirect to `/admin` if `role='admin'` or `/dashboard` if `role='member'`

#### Scenario: Pending low-privilege account logs in

- **WHEN** a user completes Google OAuth or another enabled login flow and their account exists but is still pending approval
- **THEN** the system SHALL keep the account in a low-privilege state and redirect the user to the pending/guest entry experience instead of `/dashboard`, `/admin`, or the marketing home page

#### Scenario: Unknown email logs in

- **WHEN** a user completes an auth flow and their account cannot be resolved to an approved member, invited guest, or pending low-privilege account
- **THEN** the system SHALL render `/error` with a readable access message and SHALL NOT throw an uncaught exception

### Requirement: Logout

The system SHALL provide a logout action that clears the Supabase session cookie and redirects to `/login`.

#### Scenario: Authenticated user logs out

- **WHEN** an authenticated user clicks the logout button from any authenticated page
- **THEN** the system SHALL call `supabase.auth.signOut()`, clear the session cookie, and redirect to `/login`

