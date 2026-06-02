## ADDED Requirements

### Requirement: Guest management

The system SHALL let officers manage guest identities and guest visit records for each meeting week while distinguishing new and returning guests.

#### Scenario: Officer adds a first-time guest visit
- **WHEN** an officer creates a guest and records their first visit for a selected week
- **THEN** the system MUST create the guest identity, create a guest_visits record with visit_number 1, and label the guest as new

#### Scenario: Officer records a returning guest visit
- **WHEN** an officer creates or edits a guest visit for someone who has visited before
- **THEN** the system MUST reuse the guest identity, increment or preserve the visit_number, and label the visit as returning

##### Example:
- **GIVEN** guest `g-020` has prior visits with max `visit_number=2`
- **WHEN** officer schedules the same guest for `2026-06-08`
- **THEN** new `guest_visits` row uses `visit_number=3` and badge shows returning

#### Scenario: Officer switches between week tabs
- **WHEN** an officer changes between the 本週來賓 and 下週來賓 tabs
- **THEN** the system MUST filter guest visit cards by the matching week_date and preserve each guest visit classification badge

##### Example:
- **GIVEN** `2026-06-01` has 5 guests and `2026-06-08` has 3 guests
- **WHEN** officer switches tab from 本週 to 下週
- **THEN** card list changes from 5 to 3 rows and each row keeps new/returning badge

#### Scenario: Officer updates guest details
- **WHEN** an officer edits guest profile or visit details such as specialty, referrer, self_intro, or feedback
- **THEN** the system MUST persist the changes and refresh the guest card preview for the selected week

##### Example:
- **GIVEN** visit `gv-300` has `self_intro='初次來訪'`
- **WHEN** officer updates it to `對AI合作有興趣`
- **THEN** `gv-300.self_intro` is updated and guest card preview shows the new text
