## ADDED Requirements

### Requirement: Gmail OAuth Login

The system SHALL authenticate members using Google OAuth via Supabase Auth. The login page SHALL display a single "Sign in with Google" button. Upon successful OAuth callback, the system SHALL look up the authenticated email in the `members` table.

#### Scenario: Existing member logs in

- **WHEN** a user completes Google OAuth and their email exists in the `members` table
- **THEN** the system SHALL bind the Supabase `auth.uid()` to the member record and redirect to `/dashboard`

#### Scenario: Non-member email logs in

- **WHEN** a user completes Google OAuth and their email does NOT exist in the `members` table
- **THEN** the system SHALL display a "您尚未加入華AI分會" error page with officer contact information and a "Return to login" link

---

### Requirement: Role-Based Access Control

The system SHALL enforce three roles: `member`, `officer`, and `president`. The role SHALL be stored in the `members.role` column. Supabase RLS policies SHALL restrict data access based on role.

#### Scenario: Member accesses admin routes

- **WHEN** a user with role `member` attempts to access any `/admin/*` route
- **THEN** the system SHALL redirect to `/dashboard` with no error message

#### Scenario: Officer accesses admin routes

- **WHEN** a user with role `officer` or `president` accesses any `/admin/*` route
- **THEN** the system SHALL render the admin page with full management capabilities

---

### Requirement: Session Management

The system SHALL maintain authenticated sessions using Supabase Auth session tokens stored in HTTP-only cookies. Sessions SHALL expire after 7 days of inactivity.

#### Scenario: Session expiration

- **WHEN** a user's session has been inactive for more than 7 days
- **THEN** the system SHALL redirect to `/login` on the next request
