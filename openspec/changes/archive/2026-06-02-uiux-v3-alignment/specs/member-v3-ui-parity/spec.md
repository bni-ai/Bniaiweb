## ADDED Requirements

### Requirement: Member v3 navigation parity

The system SHALL align the authenticated member navigation and page hierarchy with `ui-mockup-member-v3.html`, while keeping unfinished capabilities in a clearly limited state.

#### Scenario: Member opens the v3 shell
- **WHEN** an authenticated member opens the member portal
- **THEN** the system MUST expose the v3 primary navigation semantics for dashboard, report, profile, directory, and any unfinished sections as explicit limited or coming-soon entries instead of broken links

#### Scenario: Member opens an unfinished v3 section
- **WHEN** a member selects a v3 mockup section whose underlying module is not complete yet
- **THEN** the system MUST render a safe placeholder or restricted state explaining that the capability is still in progress

##### Example:
- **GIVEN** member v3 navigation includes `活動` and `AI 助手`
- **WHEN** the underlying `events` or `ai` module is not implemented yet
- **THEN** clicking the entry opens a non-404 placeholder page that clearly states the feature is still in progress

### Requirement: Member v3 wired pages expose real status

The system SHALL ensure that member pages already backed by real data show states, summaries, and calls to action consistent with the v3 mockup structure.

#### Scenario: Member opens dashboard or weekly brief
- **WHEN** a member opens `/dashboard` or `/dashboard/report`
- **THEN** the system MUST show current-week summary or deadline/status information derived from real data instead of static mock values

#### Scenario: Member opens directory details
- **WHEN** a member opens the directory page and selects another member
- **THEN** the system MUST show a profile detail view or modal that reflects real member data and does not expose unfinished one-on-one actions as available when the module is not complete

##### Example:
- **GIVEN** `/dashboard/directory` shows member `王小明`
- **WHEN** the signed-in member opens `王小明` detail view while one-on-one booking is not complete
- **THEN** the view shows real profile data and any one-on-one CTA is disabled or marked as in progress instead of linking to a broken route
