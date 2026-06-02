## ADDED Requirements

### Requirement: Member dashboard

The system SHALL provide an authenticated dashboard home that summarizes the signed-in member profile and this week's brief state.

#### Scenario: Member opens the dashboard home
- **WHEN** an authenticated member navigates to `/dashboard`
- **THEN** the system MUST show the member profile summary card, this week's brief status, and quick-action links for brief entry, directory, and profile updates

#### Scenario: Member has no brief for the current week
- **WHEN** the signed-in member has not created a weekly brief for the current week
- **THEN** the system MUST show a not-started status and keep the quick-action link pointing to `/dashboard/report`（legacy `/dashboard/brief` 與 `/dashboard/weekly` 需可相容導向）

#### Scenario: Member has a saved brief for the current week
- **WHEN** the signed-in member already has a draft or submitted brief for the current week
- **THEN** the system MUST show the matching status badge on the dashboard home

##### Example:
- **GIVEN** member `m-026` has `weekly_briefs` row for `week_date=2026-06-01` with `status='submitted'`
- **WHEN** member `m-026` opens `/dashboard`
- **THEN** dashboard shows status badge `已提交` and quick-action still points to `/dashboard/report`
