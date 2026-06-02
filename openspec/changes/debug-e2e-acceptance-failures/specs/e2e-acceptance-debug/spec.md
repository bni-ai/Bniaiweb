## ADDED Requirements

### Requirement: E2E failure remediation
The system SHALL record and remediate acceptance-test failures before claiming SR completion.

#### Scenario: VP validation failure is surfaced
- **WHEN** the VP report E2E enters a negative metric and submits the form
- **THEN** the page MUST show a visible validation message and MUST NOT silently pass or crash

#### Scenario: E2E selector ambiguity is removed
- **WHEN** the member directory E2E verifies the directory page
- **THEN** the assertion MUST target the page heading instead of ambiguous duplicate text

#### Scenario: Full E2E suite is rerun
- **WHEN** debug fixes are applied
- **THEN** `npm run test:e2e` MUST pass before the debug SR task is marked complete
