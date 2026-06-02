## ADDED Requirements

### Requirement: Admin v3 navigation parity

The system SHALL align the officer/admin navigation and page hierarchy with `ui-mockup-admin-v3.html`, while preventing unfinished sections from appearing as broken or misleading functionality.

#### Scenario: Admin opens the v3 shell
- **WHEN** an authenticated admin opens the admin portal
- **THEN** the system MUST expose the v3 primary navigation semantics for overview, submission, presentation, keynote, guests, members, and any unfinished sections as explicit placeholders or limited routes instead of broken links

#### Scenario: Admin opens unfinished import or settings
- **WHEN** an admin opens a mockup section whose underlying functionality is not yet complete
- **THEN** the system MUST render a safe placeholder or restricted state explaining the current implementation boundary

##### Example:
- **GIVEN** the admin v3 sidebar includes `資料匯入` and `系統設定`
- **WHEN** `/admin/import` or `/admin/settings` is not fully implemented yet
- **THEN** the route still opens successfully and explains the current boundary instead of returning 404 or an empty page

### Requirement: Admin wired pages expose real operational state

The system SHALL ensure that wired admin pages show summary states, counts, and actions based on real backend data and route handlers.

#### Scenario: Admin opens overview or submission
- **WHEN** an admin opens `/admin` or `/admin/submission`
- **THEN** the system MUST show real submission or chapter status derived from current data instead of static mock values

#### Scenario: Admin opens presentation or guests
- **WHEN** an admin opens `/admin/presentation` or `/admin/guests`
- **THEN** the system MUST expose actions and statuses that map to actual backend flows, including slide or guest readiness state
