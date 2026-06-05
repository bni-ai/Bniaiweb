## ADDED Requirements

### Requirement: Property panel inputs must not overflow container
The system SHALL ensure that all input fields within the presentation editor's property panel fit within the panel boundaries. The panel MUST be wide enough to accommodate file inputs, number grids, and color pickers without horizontal overflow.

#### Scenario: File input fits within panel
- **WHEN** an officer opens the property panel on a desktop screen
- **THEN** the file input for background image upload MUST be fully visible without overflowing the panel edge

##### Example: desktop inspector keeps upload control inside card
- **GIVEN** the officer opens `/admin/presentations/[id]` at `1440px` viewport width
- **WHEN** the right-side inspector renders the background image upload input
- **THEN** the upload control remains fully inside the inspector card without horizontal clipping

#### Scenario: Number grid inputs fit within panel
- **WHEN** an officer views the X/Y/width/height grid in the property panel
- **THEN** all four number inputs MUST be fully visible side-by-side without clipping

##### Example: X Y width height fields remain readable
- **GIVEN** a text layer is selected in the editor inspector
- **WHEN** the officer views the X/Y/寬/高 inputs on a desktop viewport
- **THEN** all four inputs remain readable and do not overflow past the inspector boundary

### Requirement: Duplicate user info must not appear on presentation pages
The system SHALL avoid displaying redundant user information on presentation-related admin pages. If the global sidebar already shows the user's name and role, the page header MUST NOT duplicate this information.

#### Scenario: Presentation editor shows clean header
- **WHEN** an officer opens the presentation editor page
- **THEN** the page MUST display only one instance of user information (either in the sidebar or the header, not both)

##### Example: presentation editor keeps only sidebar identity
- **GIVEN** the left sidebar already shows the signed-in officer identity
- **WHEN** the officer opens `/admin/presentation` or `/admin/presentations/[id]`
- **THEN** the topbar does not render a second name-and-role block for the same person
