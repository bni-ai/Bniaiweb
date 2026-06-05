## MODIFIED Requirements

### Requirement: Google OAuth Login

The system SHALL authenticate members using Google OAuth via Supabase Auth. The login page SHALL present Google as the primary OAuth entry, SHALL preserve magic link as a fallback entry, and SHALL surface provider failures as user-readable errors rather than uncaught browser exceptions.

Upon successful OAuth callback, the system SHALL look up the authenticated email in the `members` table and bind `auth.uid()` to the member record. The callback response SHALL persist both the Supabase auth session cookie and the resolved application role so that a page refresh keeps the user signed in.

#### Scenario: Existing member logs in

- **WHEN** a user completes Google OAuth and their email exists in the `members` table
- **THEN** the system SHALL update `members.auth_uid` with `auth.uid()`, persist the Supabase auth session and resolved role, and redirect to `/admin` if `role='admin'` or `/dashboard` if `role='member'`

#### Scenario: Invited guest logs in

- **WHEN** a user completes Google OAuth and their email does NOT exist in `members.email` but exists in `guests.email`
- **THEN** the system SHALL persist the Supabase auth session, assign role `guest`, and redirect to `/guest`

#### Scenario: Provider initialization is misconfigured

- **WHEN** the deployment is missing `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **THEN** the application SHALL fail before the login interaction path is used, and users SHALL NOT encounter an uncaught runtime exception only after clicking Google

#### Scenario: Non-member email logs in

- **WHEN** a user completes Google OAuth and their email does NOT exist in `members.email` or `guests.email`
- **THEN** the system SHALL render `/error` with a role-not-found message and SHALL NOT leave a stale role cookie behind

## ADDED Requirements

### Requirement: Email password login

The system SHALL provide direct email/password login comparable to the `supastarter-nextjs` user-facing flow. The login page SHALL allow a member or invited guest to submit an email and password without waiting for a magic-link email.

Successful email/password login SHALL persist the Supabase auth session and resolved application role so that a page refresh keeps the user signed in.

#### Scenario: Existing member logs in with email and password

- **WHEN** a user submits a valid email/password pair and their email exists in the `members` table
- **THEN** the system SHALL persist the Supabase auth session, resolve the member role, and redirect to `/admin` if `role='admin'` or `/dashboard` if `role='member'`

#### Scenario: Invited guest logs in with email and password

- **WHEN** a user submits a valid email/password pair and their email exists in `guests.email` but not `members.email`
- **THEN** the system SHALL persist the Supabase auth session, assign role `guest`, and redirect to `/guest`

#### Scenario: Invalid email/password is submitted

- **WHEN** a user submits an invalid email/password pair
- **THEN** the login page SHALL display a readable authentication error and SHALL NOT create a partial session or stale role cookie

##### Example: wrong password keeps user on login page

- **GIVEN** a user exists for `member@example.com`
- **WHEN** the user submits `member@example.com` with an incorrect password
- **THEN** the page shows an authentication error message and no authenticated session is created

### Requirement: Optional GitHub OAuth entry

The login page SHALL display GitHub OAuth only when `NEXT_PUBLIC_AUTH_GITHUB_ENABLED=true`. When GitHub OAuth is disabled, unavailable, or returns an upstream error, the page SHALL show a readable message instead of starting a broken auth flow.

#### Scenario: GitHub disabled in public env

- **WHEN** `NEXT_PUBLIC_AUTH_GITHUB_ENABLED` is absent or not equal to `true`
- **THEN** the login page SHALL either hide the GitHub button or keep it non-interactive with a clear disabled message

#### Scenario: GitHub OAuth returns provider error

- **WHEN** Supabase returns an error for GitHub OAuth sign-in
- **THEN** the page SHALL render the provider error as inline feedback and SHALL reset the loading state

##### Example: provider failure returns readable copy

- **GIVEN** GitHub OAuth is enabled in the UI
- **WHEN** Supabase returns the provider error `OAuth provider is not configured`
- **THEN** the page shows that error as inline feedback and the GitHub button returns to idle state

## MODIFIED Requirements

### Requirement: Logout

The system SHALL provide a logout action that clears both the Supabase session cookie and the `sb-role` cookie, then redirects to `/login`.

#### Scenario: Member logs out

- **WHEN** a member clicks the logout button from any authenticated page
- **THEN** the system SHALL call `supabase.auth.signOut()`, clear the Supabase session cookie, clear `sb-role`, and redirect to `/login`

#### Scenario: Logout follows a stale role cookie state

- **WHEN** a logout request is made while only `sb-role` remains or the upstream Supabase sign-out call fails
- **THEN** the response SHALL still remove `sb-role` and SHALL NOT leave the browser able to pass protected-route checks as the previous user
