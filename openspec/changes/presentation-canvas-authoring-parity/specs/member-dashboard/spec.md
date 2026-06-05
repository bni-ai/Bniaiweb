## MODIFIED Requirements

### Requirement: Member dashboard
The system SHALL provide an authenticated dashboard home that summarizes the signed-in member profile and this week's brief state. The member dashboard SHALL also allow member-authored profile, weekly brief, keynote, and presentation media data to be used as presentation template sources. Member-authored data MUST be queryable by the presentation builder without requiring the admin to retype the same content in the presentation editor.

#### Scenario: Member profile fields feed presentation templates
- **WHEN** a member updates their name, specialty, company, profile summary, or profile image through the member dashboard
- **THEN** the presentation builder MUST be able to use those fields in member and team template blocks

##### Example:
- **GIVEN** member `余啟銘` sets specialty to `數位流程顧問`
- **WHEN** an admin regenerates the weekly presentation
- **THEN** the member slide can display `余啟銘` and `數位流程顧問` from member-authored data

#### Scenario: Member weekly brief feeds presentation templates
- **WHEN** a member submits a weekly brief for the presentation week
- **THEN** the presentation builder MUST be able to bind that brief into member template blocks

##### Example:
- **GIVEN** member `余啟銘` submits `本週可協助整理簡報內容`
- **WHEN** the `2026-10-31` presentation is regenerated and published
- **THEN** the public presentation shows that weekly brief on the member slide without manual admin re-entry

#### Scenario: Missing member data stays visible
- **WHEN** a member has not filled one optional presentation field
- **THEN** the presentation template MUST keep the slide visible and only show a safe placeholder or omit that missing field

##### Example:
- **GIVEN** member `余啟銘` has no profile image
- **WHEN** the member slide renders
- **THEN** the slide still shows name, specialty, and weekly brief text instead of becoming blank
