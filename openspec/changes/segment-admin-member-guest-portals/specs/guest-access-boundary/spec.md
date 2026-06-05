## ADDED Requirements

### Requirement: Guest portal introduction boundary
The system SHALL let guests request introductions through an assigned contact person without exposing private member or administrator data.

#### Scenario: Guest views connection options
- **WHEN** a guest opens the connection request page
- **THEN** the system MUST show contact-person-guided request options and MUST NOT show full member private contact details

##### Example: guided connection request
- **GIVEN** guest `guest@example.com` is assigned to contact person `王小明`
- **WHEN** the guest opens `/guest/connections`
- **THEN** the page shows a request form through `王小明` and does not show private member phone numbers, direct email addresses, or admin-only notes

#### Scenario: Guest attempts member route through portal switch
- **WHEN** a guest attempts to open member-only routes from a portal switch or direct URL
- **THEN** access control MUST redirect the guest back to the guest portal

##### Example: guest direct route protection
- **GIVEN** user `guest@example.com` has guest-only access
- **WHEN** the user opens `/dashboard/report`
- **THEN** access control redirects to `/guest`

#### Scenario: Admin or member overlaps guest identity
- **WHEN** an email exists in member records and guest records
- **THEN** the system MUST preserve the existing member or administrator precedence and MUST NOT downgrade the user to guest-only access

##### Example: member precedence
- **GIVEN** email `same@example.com` exists in both `members.email` and `guests.email`
- **WHEN** `same@example.com` completes authentication
- **THEN** the system follows the member or administrator route and does not assign guest-only access

#### Scenario: Guest navigation excludes member and admin actions

- **WHEN** a guest views the guest navigation or homepage actions
- **THEN** the system MUST NOT render links or buttons for weekly brief, one-on-one booking management, AI assistant, member management, or system settings

##### Example: guest nav exclusions
- **GIVEN** user `guest@example.com` has guest-only access
- **WHEN** the user opens `/guest`
- **THEN** the navigation and homepage actions omit `每週簡報`, `一對一預約`, `AI 助手`, `會員管理`, and `系統設定`
