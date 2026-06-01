## ADDED Requirements

### Requirement: Google OAuth Login

The system SHALL authenticate members using Google OAuth via Supabase Auth. The login page SHALL display a single "使用 Google 帳號登入" button. Upon successful OAuth callback, the system SHALL look up the authenticated email in the `members` table and bind `auth.uid()` to the member record.

#### Scenario: Existing member logs in

- **WHEN** a user completes Google OAuth and their email exists in the `members` table
- **THEN** the system SHALL update `members.auth_uid` with `auth.uid()`, store the member's role in the session, and redirect to `/admin` if `role='admin'` or `/dashboard` if `role='member'`

#### Scenario: Non-member email logs in

- **WHEN** a user completes Google OAuth and their email does NOT exist in the `members` table
- **THEN** the system SHALL render `/error` with a "您尚未加入華AI分會" message, officer contact info (LINE group), and a "返回登入頁" link; no exception SHALL be thrown

### Requirement: Logout

The system SHALL provide a logout action that clears the Supabase session cookie and redirects to `/login`.

#### Scenario: Member logs out

- **WHEN** a member clicks the logout button from any authenticated page
- **THEN** the system SHALL call `supabase.auth.signOut()`, clear the session cookie, and redirect to `/login`

### Requirement: Role Injection into Session JWT

The system SHALL inject `members.role` into the Supabase session JWT as a custom claim `app_role` using a Supabase Auth hook (`custom_access_token_hook`). This allows middleware to read the role from the JWT without a database query on every request.

#### Scenario: JWT contains role after login

- **WHEN** a member completes Google OAuth
- **THEN** the decoded JWT SHALL contain `app_role: 'admin'` or `app_role: 'member'` matching `members.role` for that email
