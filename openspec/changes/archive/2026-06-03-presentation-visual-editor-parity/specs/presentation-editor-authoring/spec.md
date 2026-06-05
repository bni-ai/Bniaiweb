## ADDED Requirements

### Requirement: Presentation editor authoring
The system SHALL let administrators edit the visible content of each presentation slide from the admin workbench without editing raw JSON manually.

#### Scenario: Admin edits slide content
- **WHEN** an administrator opens a presentation workbench
- **THEN** the page MUST provide fields for slide title, body, font size, ordering, visibility, and background image upload

##### Example: editing a cover slide
- **GIVEN** presentation `p-2026-06-01` exists
- **WHEN** admin opens `/admin/presentations/p-2026-06-01`
- **THEN** the cover slide row shows editable title, body, font size, order, visibility, and background image controls

#### Scenario: Admin saves edited content
- **WHEN** an administrator saves the edited slide content
- **THEN** the system MUST persist the edited values inside the presentation data source used by publishing and viewing

##### Example: save title and body
- **GIVEN** cover slide title is `BNI 華 AI 分會`
- **WHEN** admin changes it to `自訂封面標題` and saves
- **THEN** reopening the workbench shows `自訂封面標題`
