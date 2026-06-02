## MODIFIED Requirements

### Requirement: Frontend-backend wiring audit

The system SHALL keep a page-level audit trail that maps each critical v3 admin/member surface to its real backend wiring, preview/public surface, and acceptance proof.

#### Scenario: A presentation page is reviewed
- **WHEN** `/admin/presentation`, `/admin/presentations/[id]`, or `/presentation/[week-date]` is marked as wired in the SR
- **THEN** the change artifacts MUST identify the route, the presentation action or builder flow, the `presentations` data source, the preview/public viewer surface, and the acceptance test that proves the deck is connected end to end

##### Example: presentation workbench mapping
- **GIVEN** `/admin/presentations/[id]` is marked as wired
- **WHEN** the page is audited
- **THEN** the SR references the workbench route, the presentation save/publish handlers, the persisted `slide_order` contract, the `/presentation/<week>` viewer, and an E2E case for preview or publish

#### Scenario: A settings page is reviewed
- **WHEN** `/admin/settings` is marked as wired in the SR
- **THEN** the change artifacts MUST identify the route, the settings save action, the chapter/settings/provider data sources, and the acceptance proof that saved values affect the related system surface or logs

#### Scenario: A role-switch surface is reviewed
- **WHEN** `/admin`, `/dashboard`, or `/guest` behavior is changed for role visibility or fallback
- **THEN** the change artifacts MUST state the resolved role rule, redirect behavior, fallback state, and the acceptance case proving the intended surface is reachable

#### Scenario: A media or AI surface is reviewed
- **WHEN** profile media upload or AI assistant behavior is changed in the SR
- **THEN** the change artifacts MUST state the storage or provider backend, the visible UI surface, and the acceptance case proving readback or response rendering

##### Example: media and AI audit mapping
- **GIVEN** `/dashboard/profile` media upload and `/dashboard/ai` chat are marked wired
- **WHEN** the SR is audited
- **THEN** the artifacts reference Supabase Storage for media, active AI provider for chat, visible UI surfaces, and E2E readback or response cases

#### Scenario: A one-on-one Jitsi surface is reviewed
- **WHEN** one-on-one booking or video entry behavior is changed in the SR
- **THEN** the change artifacts MUST state the booking data source, Jitsi room contract, visible member workflow, and the acceptance case proving the station-internal video entry is reachable

##### Example: Jitsi audit mapping
- **GIVEN** `/dashboard/one-on-one` and `/dashboard/one-on-one/b-001/video` are marked wired
- **WHEN** the SR is audited
- **THEN** the artifacts reference `one_on_ones`, `jitsi_room`, the booking workflow, and the E2E video entry case
