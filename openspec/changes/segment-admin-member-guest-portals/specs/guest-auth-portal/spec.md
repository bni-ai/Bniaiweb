## ADDED Requirements

### Requirement: Authenticated guest portal content
The system SHALL provide logged-in guests with a dedicated portal that combines chapter introduction, visit context, feedback, and guided next actions.

#### Scenario: Guest sees chapter introduction after login
- **WHEN** an authenticated guest opens the guest portal home
- **THEN** the page MUST show the chapter introduction, BNI introduction, inviter or contact person, visit week, and current guest visit status

##### Example: personalized guest home
- **GIVEN** guest `guest@example.com` is invited by `王小明` for week `2026-06-08` with status `confirmed`
- **WHEN** the guest opens `/guest`
- **THEN** the page shows chapter introduction, BNI introduction, inviter `王小明`, week `2026-06-08`, and status `已確認`

#### Scenario: Guest sees post-visit feedback entry
- **WHEN** an authenticated guest opens the guest portal after a visit is scheduled or completed
- **THEN** the portal MUST expose a feedback form entry that can collect post-visit feedback in a future implementation

##### Example: feedback entry
- **GIVEN** guest `guest@example.com` has a visit for week `2026-06-08`
- **WHEN** the guest opens `/guest`
- **THEN** the page shows a `會後回饋` entry that routes to the guest feedback workflow

#### Scenario: Guest feedback is designed for Supabase-backed storage
- **WHEN** the guest feedback workflow is implemented
- **THEN** the system MUST treat Supabase as the source of truth for submitted feedback instead of relying on an external form service as the primary store

##### Example: feedback storage direction
- **GIVEN** guest `guest@example.com` submits post-visit feedback
- **WHEN** the submission is accepted
- **THEN** the saved record is written to Supabase-backed guest data, such as `guest_visits.feedback` or a future dedicated feedback table

#### Scenario: Guest sees connection request entry
- **WHEN** an authenticated guest wants to connect with other members
- **THEN** the portal MUST provide an entry for requesting an introduction through the inviter or assigned contact person

##### Example: connection request entry
- **GIVEN** guest `guest@example.com` is assigned to contact person `王小明`
- **WHEN** the guest opens the guest portal next actions
- **THEN** the page shows a connection request entry that names `王小明` as the introduction window

### Requirement: Guest portal supports public signup and login handoff

The system SHALL provide a public guest-facing entry that helps an anonymous visitor either register a guest account or return to login.

#### Scenario: Anonymous visitor opens guest portal

- **WHEN** no authenticated session exists and the visitor opens `/guest`
- **THEN** the page MUST show public chapter introduction plus clear CTAs for guest registration and guest login

#### Scenario: Anonymous visitor opens guest registration

- **WHEN** no authenticated session exists and the visitor opens `/guest/register`
- **THEN** the page MUST show a public guest registration form and MUST NOT require a member invite token

### Requirement: Guest portal hides member-only workflows
The system SHALL prevent guest users from seeing member-only workflows inside the guest portal.

#### Scenario: Guest navigates guest portal
- **WHEN** a guest opens the guest portal navigation
- **THEN** the navigation MUST NOT show member weekly brief, one-on-one booking management, member AI assistant, or administrator management routes

##### Example: guest navigation exclusions
- **GIVEN** user `guest@example.com` has guest-only access
- **WHEN** the user opens the guest navigation
- **THEN** the navigation does not include `每週簡報`, `一對一預約`, `AI 助手`, `會員管理`, or `系統設定`
