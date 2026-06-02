## MODIFIED Requirements

### Requirement: Admin v3 navigation parity

The system SHALL align the officer/admin navigation and page hierarchy with `ui-mockup-admin-v3.html`, while ensuring presentation and settings surfaces behave as real workbenches instead of placeholders or engineering-only forms.

#### Scenario: Admin opens the v3 shell
- **WHEN** an authenticated admin opens the admin portal
- **THEN** the system MUST expose the v3 primary navigation semantics for overview, submission, presentation, keynote, guests, members, import, settings, and any unfinished sections as explicit placeholders or limited routes instead of broken links

#### Scenario: Admin opens presentation management
- **WHEN** an admin opens `/admin/presentation` or a specific presentation detail page
- **THEN** the system MUST present deck status, preview entry, editing entry, and publish actions in a v3-aligned management surface instead of a raw JSON editor

#### Scenario: Admin opens settings
- **WHEN** an admin opens `/admin/settings`
- **THEN** the system MUST render a v3-aligned settings workbench with chapter information, AI settings, and weekly settings sections rather than an undifferentiated form

### Requirement: Admin wired pages expose real operational state

The system SHALL ensure that wired admin pages show summary states, counts, actions, and readiness indicators based on real backend data and route handlers.

#### Scenario: Admin opens overview or submission
- **WHEN** an admin opens `/admin` or `/admin/submission`
- **THEN** the system MUST show real submission or chapter status derived from current data instead of static mock values

#### Scenario: Admin opens presentation or guests
- **WHEN** an admin opens `/admin/presentation` or `/admin/guests`
- **THEN** the system MUST expose actions and statuses that map to actual backend flows, including slide or guest readiness state

#### Scenario: Admin reviews the portal on smaller screens
- **WHEN** an admin uses the presentation or settings surfaces on mobile or tablet widths
- **THEN** the system MUST keep primary actions, navigation, and state information accessible without rendering broken layouts or hidden critical controls

##### Example: settings save remains reachable on tablet
- **GIVEN** the viewport width is `768px`
- **WHEN** the admin opens `/admin/settings`
- **THEN** the save control, section navigation, and current status feedback remain visible without overlapping or disappearing

## ADDED Requirements

### Requirement: Admin shell identity parity

The system SHALL show the signed-in admin identity in the admin shell using member profile data when available and session fallback data when profile data is missing.

#### Scenario: Admin shell shows signed-in identity
- **WHEN** an authenticated admin opens `/admin`
- **THEN** the sidebar MUST show an avatar or initial, display name, and admin role or officer metadata near the top of the shell

##### Example: admin identity card
- **GIVEN** admin `fish@fishot.com` has Chinese name `余啟彰`
- **WHEN** the admin opens `/admin`
- **THEN** the sidebar shows `余啟彰` and an admin or officer role label
