# slide-components Specification

## Purpose

TBD - created by archiving change 'presentation-engine'. Update Purpose after archive.

## Requirements

### Requirement: Slide components
The system SHALL provide typed slide components for the planned presentation segment types and feed them with pre-fetched data props only. Each slide component MUST render inside a fixed 1920x1080 canvas contract and MUST remain readable when scaled by the runtime.

#### Scenario: Cover slide renders chapter context
- **WHEN** the viewer renders a cover slide entry
- **THEN** the system MUST show the chapter name, week date, and meeting time within the shared 1920x1080 presentation frame

#### Scenario: Agenda and closing slides render meeting flow
- **WHEN** the viewer renders agenda or closing slide entries
- **THEN** the system MUST show meeting flow or closing context within the shared 1920x1080 presentation frame

#### Scenario: Member and keynote slides render weekly content
- **WHEN** the viewer renders member or keynote slide entries with pre-fetched records
- **THEN** the system MUST display the configured profile, brief, topic, outline, and image data without issuing database calls inside the slide components

##### Example:
- **GIVEN** prefetched member brief and keynote props are passed into slide components
- **WHEN** `MemberSlide` and `KeynoteSlide` render
- **THEN** UI shows those prop values and no in-component DB fetch is executed

#### Scenario: Guest, award, team, and VP report slides render meeting context
- **WHEN** the viewer renders guest, award, team, or vp_report slide entries with pre-fetched records
- **THEN** the system MUST display their mapped fields inside the same shared visual frame and typography system

##### Example:
- **GIVEN** viewer has prefetched `guest_visits`, `weekly_awards`, and `weekly_vp_reports` for `2026-06-01`
- **WHEN** corresponding slide components render
- **THEN** each slide displays mapped fields (guest visit badge, award info, VP metrics) within shared 1920x1080 frame

#### Scenario: Slide content exceeds the frame
- **WHEN** a slide receives long text or many display elements
- **THEN** the system MUST clamp or wrap the content so the slide remains readable within the 1920x1080 layout

#### Scenario: Runtime receives a serializable slide model
- **WHEN** the server creates a runtime deck
- **THEN** every slide MUST include `id`, `type`, `label`, `title`, `subtitle`, `summary`, `notes`, and `payload`

<!-- @trace
source: presentation-slide-engine-redesign
updated: 2026-06-03
code:
  - .opencode/skills/spectra-apply/SKILL.md
  - .opencode/commands/spectra-ingest.md
  - .opencode/skills/spectra-audit/SKILL.md
  - .opencode/commands/spectra-debug.md
  - .opencode/skills/spectra-drift/SKILL.md
  - .opencode/commands/spectra-ask.md
  - .opencode/commands/spectra-apply.md
  - .opencode/skills/spectra-ask/SKILL.md
  - .opencode/skills/spectra-debug/SKILL.md
  - .opencode/skills/spectra-discuss/SKILL.md
  - .opencode/commands/spectra-audit.md
  - .opencode/commands/spectra-discuss.md
  - .opencode/skills/spectra-ingest/SKILL.md
  - .opencode/skills/spectra-propose/SKILL.md
  - .cursorrules
  - .opencode/commands/spectra-archive.md
  - .opencode/commands/spectra-drift.md
  - .opencode/skills/spectra-archive/SKILL.md
  - .opencode/skills/spectra-commit/SKILL.md
  - .opencode/commands/spectra-commit.md
  - .opencode/commands/spectra-propose.md
-->