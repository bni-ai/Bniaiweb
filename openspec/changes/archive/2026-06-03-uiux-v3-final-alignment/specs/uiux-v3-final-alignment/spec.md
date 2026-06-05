## ADDED Requirements

### Requirement: Member and Admin V3 Layout Parity

The system SHALL align the member and admin interfaces to the approved v3 mockups after the functional baseline is complete. Layout parity includes navigation order, card grouping, CTA placement, status visibility, and empty-state handling.

#### Scenario: Member dashboard matches approved structure

- **WHEN** a member opens `/dashboard`
- **THEN** the page SHALL present the same information hierarchy as the approved member v3 mockup without breaking existing actions

#### Scenario: Admin dashboard matches approved structure

- **WHEN** an admin opens `/admin`
- **THEN** the page SHALL present the same information hierarchy as the approved admin v3 mockup without breaking existing actions

### Requirement: Open Design Guided UI Review

The system SHALL use Open Design artifacts as a visual review reference during the UI alignment phase so that implementation choices are checked against a shared design source instead of ad-hoc interpretation.

#### Scenario: UI adjustment references shared design context

- **WHEN** a shell, card, form, or list layout is changed
- **THEN** the implementer SHALL verify it against the v3 mockup and Open Design context before marking the task complete

### Requirement: UI Changes Preserve Functional Acceptance

The system SHALL preserve all accepted functional flows while UI alignment is in progress.

#### Scenario: UI refactor does not break accepted flows

- **WHEN** the UI alignment change is implemented
- **THEN** `npm run test`, `npm run build`, and `npm run test:e2e` SHALL remain green
