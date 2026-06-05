## ADDED Requirements

### Requirement: Search box must be functional
The system SHALL make the top navigation search box functional. When a user enters a keyword and submits, the system MUST navigate to the appropriate search results or admin page.

#### Scenario: Search by keyword
- **WHEN** a user types a keyword into the search box and presses Enter
- **THEN** the system MUST navigate to a relevant admin page or show search results

##### Example: presentation keyword routes to presentation hub
- **GIVEN** an officer is on an admin page with the topbar search form
- **WHEN** the officer enters `簡報` and presses Enter
- **THEN** the browser navigates to `/admin/presentation`

#### Scenario: Empty search shows placeholder
- **WHEN** a user clicks the search box but does not enter any text
- **THEN** the search box MUST remain focused and ready for input without throwing errors

##### Example: empty submit falls back without crash
- **GIVEN** the search input is visible in the topbar
- **WHEN** the officer focuses it and submits without entering text
- **THEN** the browser falls back to `/admin` without throwing a runtime error
