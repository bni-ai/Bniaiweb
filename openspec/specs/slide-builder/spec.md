# slide-builder Specification

## Purpose

TBD - created by archiving change 'presentation-engine'. Update Purpose after archive.

## Requirements

### Requirement: Slide builder
The system SHALL generate deterministic `slide_order` data for one chapter-week using the available weekly meeting records. The generated order MUST include fixed meeting-flow slides for cover, agenda, team, and closing in addition to data-driven slides.

#### Scenario: Builder creates a complete deck
- **WHEN** keynote, weekly brief, guest visit, award, and VP report data all exist for a chapter-week
- **THEN** the system MUST output slide_order entries starting with cover and agenda, followed by keynote, member briefs ordered by member_number, guest visits, awards, vp_report, team, and closing

##### Example:
- **GIVEN** week `2026-06-01` has 1 keynote, 36 briefs, 4 guests, 2 awards, and 1 VP report
- **WHEN** `buildSlideOrder('2026-06-01', 'ch-huaai')` runs
- **THEN** result starts with `cover`, then `agenda`, ends with `closing`, and includes member slides in `member_number` ascending order

#### Scenario: Builder skips missing datasets
- **WHEN** one or more optional weekly datasets are absent for the selected chapter-week
- **THEN** the system MUST omit those data-driven slide entries while still returning a valid deck with cover, agenda, team, and closing slides

##### Example:
- **GIVEN** week `2026-06-08` has no awards and no VP report
- **WHEN** builder runs for that week
- **THEN** output excludes `award` and `vp_report` entries but still includes `cover`, `agenda`, `team`, and `closing`

#### Scenario: Builder marks visible slide entries
- **WHEN** the builder creates keynote, member, guest, award, or vp_report entries
- **THEN** the system MUST set `visible` to true on each generated entry

#### Scenario: Builder creates fixed meeting-flow entries
- **WHEN** the builder creates cover, agenda, team, or closing entries
- **THEN** the system MUST create those entries without `id` and without `visible`

##### Example:
- **GIVEN** builder creates fixed entries for week `2026-06-01`
- **WHEN** slide_order is inspected
- **THEN** `cover`, `agenda`, `team`, and `closing` entries contain only their `type` field

#### Scenario: Builder receives data for multiple chapters
- **WHEN** the backing tables contain rows for more than one chapter in the same week
- **THEN** the system MUST include only rows for the requested chapter_id in the generated slide_order

##### Example:
- **GIVEN** week `2026-06-01` has rows for `ch-huaai` and `ch-other`
- **WHEN** builder runs with `chapter_id='ch-huaai'`
- **THEN** output contains only IDs belonging to `ch-huaai`

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