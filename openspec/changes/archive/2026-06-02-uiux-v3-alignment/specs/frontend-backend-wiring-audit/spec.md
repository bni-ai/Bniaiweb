## ADDED Requirements

### Requirement: Frontend-backend wiring audit

The system SHALL keep a page-level audit trail that maps each UI section in the v3 admin/member experience to its real backend wiring and acceptance proof.

#### Scenario: A wired page is reviewed
- **WHEN** a page is marked as wired in the UI parity SR
- **THEN** the change artifacts MUST identify the route, the server action or route handler, the data source, and the acceptance test that proves the page is connected end-to-end

##### Example:
- **GIVEN** `/admin/guests` is marked as `wired`
- **WHEN** the page is audited
- **THEN** the SR must reference the route, the guest persistence handler, the `guests` and `guest_visits` tables, and an E2E case proving create-and-refresh behavior

#### Scenario: A partially wired page is reviewed
- **WHEN** a page is marked as partial or missing
- **THEN** the change artifacts MUST state which dependency is incomplete and how the UI must safely represent that state without implying the feature is fully available

##### Example:
- **GIVEN** `/dashboard/one-on-one` is not complete because `member-module` booking work is still open
- **WHEN** the page is audited
- **THEN** the SR must state that dependency explicitly and require a safe placeholder or disabled CTA instead of a broken booking flow

### Requirement: UI parity changes must not regress existing flows

The system SHALL treat regressions in verified auth, RBAC, member, guest, admin, or presentation flows as blocking failures for this SR.

#### Scenario: UI parity work changes existing routes
- **WHEN** UI parity updates modify existing member, guest, admin, or presentation routes
- **THEN** the acceptance suite MUST re-run the existing test, build, and E2E checks to confirm that the changes did not break already verified flows
