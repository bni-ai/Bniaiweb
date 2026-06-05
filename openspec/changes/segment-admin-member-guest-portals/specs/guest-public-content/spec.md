## ADDED Requirements

### Requirement: Guest introduction content separation
The system SHALL distinguish public guest introduction content from authenticated guest follow-up content.

#### Scenario: Anonymous visitor opens guest introduction
- **WHEN** an unauthenticated visitor opens the guest area
- **THEN** the page MUST show public chapter introduction, BNI basics, preparation guidance, and clear CTA links for guest registration or guest login without exposing personal invitation context

##### Example: anonymous guest page
- **GIVEN** no authenticated session exists
- **WHEN** the visitor opens `/guest`
- **THEN** the page shows public chapter introduction and preparation guidance, and does not show inviter name, visit week, or feedback status

#### Scenario: Logged-in guest opens guest introduction
- **WHEN** an authenticated guest opens the guest area
- **THEN** the page MUST combine public introduction content with the guest's personal visit context and next actions

##### Example: authenticated guest page
- **GIVEN** guest `guest@example.com` is invited by `王小明` for week `2026-06-08`
- **WHEN** the guest opens `/guest`
- **THEN** the page shows public introduction content plus inviter `王小明`, week `2026-06-08`, feedback entry, and connection request entry

### Requirement: Guest-facing Traditional Chinese content
The system SHALL keep guest-facing portal labels and actions in Traditional Chinese while preserving only brand or technical names that are intentionally untranslated.

#### Scenario: Guest portal renders actions
- **WHEN** a guest opens introduction, feedback, or connection pages
- **THEN** visible headings, buttons, status labels, and form labels MUST use Traditional Chinese copy

##### Example: guest action copy
- **GIVEN** a guest opens feedback and connection pages
- **WHEN** the page renders headings and buttons
- **THEN** visible action text uses labels such as `會後回饋`, `送出回饋`, `請聯繫人協助引介`, and `已確認`
