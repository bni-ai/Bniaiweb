## MODIFIED Requirements

### Requirement: Slide components
The system SHALL provide typed slide template blocks for the planned presentation segment types and feed them with pre-fetched data props only. Each template block and rendered slide MUST fit inside a shared 1920x1080 canvas contract, remain readable when scaled by the runtime, and be reusable by both the visual editor and the public viewer.

#### Scenario: Cover slide renders chapter context
- **WHEN** the viewer renders a cover slide entry
- **THEN** the system MUST show the chapter name, week date, and meeting time within the shared 1920x1080 presentation frame

#### Scenario: Agenda and closing slides render meeting flow
- **WHEN** the viewer renders agenda or closing slide entries
- **THEN** the system MUST show meeting flow or closing context within the shared 1920x1080 presentation frame

#### Scenario: Member and keynote template blocks render weekly content
- **WHEN** the viewer or editor renders member or keynote template blocks with pre-fetched records
- **THEN** the system MUST display the configured profile, brief, topic, outline, and image data without issuing database calls inside the template blocks

##### Example:
- **GIVEN** prefetched member brief and keynote props are passed into template blocks
- **WHEN** `member-profile-card` and `keynote-hero` render
- **THEN** UI shows those prop values and no in-block DB fetch is executed

#### Scenario: Member-authored profile data appears in presentation templates
- **WHEN** a member updates their profile, specialty, company, weekly brief, keynote outline, or presentation image through the member portal
- **AND** an admin regenerates or syncs the presentation for that week
- **THEN** member, keynote, and team template blocks MUST be able to bind to those member-authored fields and display them in the editor preview and public viewer

##### Example:
- **GIVEN** member `余啟銘` updates `specialty_title` to `數位流程顧問` and submits a weekly brief
- **WHEN** the weekly presentation is regenerated and published
- **THEN** the member slide shows `余啟銘`, `數位流程顧問`, and the submitted weekly brief content without manually retyping those fields in the admin presentation editor

#### Scenario: Missing member-authored fields do not blank the slide
- **WHEN** a member-authored field required by a template block is empty
- **THEN** the template block MUST render a safe placeholder or omit only that field while keeping the rest of the slide visible

##### Example:
- **GIVEN** a member has `chinese_name` and `specialty_title` but no `photo_url`
- **WHEN** `member-profile-card` renders in the public viewer
- **THEN** the slide shows the member name and specialty, and the missing photo area uses a placeholder instead of making the slide blank

#### Scenario: Guest, award, team, and VP report template blocks render meeting context
- **WHEN** the viewer or editor renders guest, award, team, or vp_report template blocks with pre-fetched records
- **THEN** the system MUST display their mapped fields inside the same shared visual frame and typography system

##### Example:
- **GIVEN** viewer has prefetched `guest_visits`, `weekly_awards`, and `weekly_vp_reports` for `2026-06-01`
- **WHEN** corresponding template blocks render
- **THEN** each block displays mapped fields within the shared 1920x1080 frame

#### Scenario: Slide content exceeds the frame
- **WHEN** a slide receives long text or many display elements
- **THEN** the system MUST clamp, wrap, or reduce scale using supported typography tokens so the slide remains readable within the 1920x1080 layout

#### Scenario: Runtime receives a serializable slide model
- **WHEN** the server creates a runtime deck
- **THEN** every slide MUST include `id`, `type`, `label`, `notes`, `backgroundAssetId`, and an ordered `blocks[]` payload that can be rendered without extra database calls
