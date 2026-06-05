## ADDED Requirements

### Requirement: Admin settings workbench
The system SHALL provide an operator-facing settings workbench that groups chapter information, AI provider controls, and weekly meeting settings into distinct management surfaces.

#### Scenario: Admin opens settings workbench
- **WHEN** an authenticated admin opens `/admin/settings`
- **THEN** the system MUST render three management sections for chapter information, AI settings, and weekly settings instead of a single undifferentiated engineering form

#### Scenario: Admin saves chapter information
- **WHEN** an admin updates chapter information fields and saves
- **THEN** the system MUST persist the values and show them again on the next visit to the settings workbench

##### Example: chapter information round-trip
- **GIVEN** chapter name `BNI 華AI` and region `Taipei`
- **WHEN** the admin changes the meeting location to `台北市信義區松仁路 100 號` and saves
- **THEN** the next settings page load shows the same meeting location value

### Requirement: Settings effects are observable
The system SHALL make the operational effect of settings changes observable from the related product surfaces and logs.

#### Scenario: Admin changes weekly deadline or reminder
- **WHEN** an admin updates weekly deadline or reminder settings and saves
- **THEN** the system MUST use the new values for weekly brief deadline displays, reminder flow configuration, or related settings readback

##### Example: weekly deadline readback
- **GIVEN** the weekly settings currently use `deadline=Tuesday 18:00` and `reminder=Tuesday 12:00`
- **WHEN** the admin changes them to `deadline=Wednesday 20:00` and `reminder=Wednesday 10:00` and saves
- **THEN** the next settings read shows Wednesday values and the weekly brief surface reads the updated deadline

#### Scenario: Admin changes active AI provider
- **WHEN** an admin marks a different AI provider as active and saves
- **THEN** the system MUST persist that provider selection and expose it to the member AI baseline on the next read

##### Example: active provider switch
- **GIVEN** `claude` is active and `gemini` is configured
- **WHEN** the admin marks `gemini` as active and saves
- **THEN** the next settings read shows `gemini` as active and the member AI baseline resolves `gemini`

#### Scenario: Admin reviews sync baseline state
- **WHEN** an admin opens the settings workbench after prior sync activity
- **THEN** the system MUST show recent sync log state and offer a manual sync action without exposing raw storage internals

##### Example: sync log visibility
- **GIVEN** a sync log exists for week `2026-06-01` with status `success`
- **WHEN** the admin opens `/admin/settings`
- **THEN** the page shows the recent sync entry and still exposes a manual sync action for another week
