## ADDED Requirements

### Requirement: Weekly brief submission

The system SHALL let a member create, edit, draft, and submit one weekly brief for the current chapter-week while the week remains unlocked.

#### Scenario: Member opens an empty weekly brief form
- **WHEN** a member visits the weekly brief page for a week with no existing row
- **THEN** the system MUST initialize the form with the current Monday week_date and empty have_this_week and want_this_week fields

##### Example:
- **GIVEN** member `m-018` has no `weekly_briefs` row for `week_date=2026-06-01`
- **WHEN** member opens `/dashboard/report`
- **THEN** form shows `week_date=2026-06-01` with empty `have_this_week` and `want_this_week`

#### Scenario: Member saves a draft brief
- **WHEN** a member enters have_this_week and want_this_week content and chooses `儲存草稿`
- **THEN** the system MUST save or update the brief with status `draft` and keep the content available on the next visit

#### Scenario: Member submits a weekly brief
- **WHEN** a member chooses `提交` on a valid weekly brief
- **THEN** the system MUST save the content with status `submitted` and set submitted_at for that week

#### Scenario: Member edits an existing weekly brief
- **WHEN** a member revisits a week that already has a draft or submitted brief while the week is still unlocked
- **THEN** the system MUST prefill the existing content and allow updates to the same weekly_briefs row

##### Example:
- **GIVEN** row `weekly_briefs.id=wb-001` exists for `member_id=m-018`, `week_date=2026-06-01`, `status='draft'`
- **WHEN** member edits `want_this_week` and clicks save
- **THEN** system updates `wb-001` instead of creating a new row

#### Scenario: Member tries to edit a locked week
- **WHEN** a member opens or submits the form for a week locked by admin policy
- **THEN** the system MUST show the saved content in read-only mode and reject new writes

##### Example:
- **GIVEN** admin marked `week_date=2026-05-25` as locked and member already has a submitted brief
- **WHEN** member opens `/dashboard/report?week=2026-05-25` and attempts to modify content
- **THEN** UI is read-only and PATCH/POST write attempts return rejection
