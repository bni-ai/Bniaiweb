## ADDED Requirements

### Requirement: Slide builder

The system SHALL generate deterministic `slide_order` data for one chapter-week using the available weekly meeting records.

#### Scenario: Builder creates a complete deck
- **WHEN** keynote, weekly brief, guest visit, award, and VP report data all exist for a chapter-week
- **THEN** the system MUST output slide_order entries starting with cover, followed by keynote, member briefs ordered by member_number, guest visits, awards, vp_report, and ending with team

##### Example:
- **GIVEN** week `2026-06-01` has 1 keynote, 36 briefs, 4 guests, 2 awards, and 1 VP report
- **WHEN** `buildSlideOrder('2026-06-01', 'ch-huaai')` runs
- **THEN** result starts with `cover`, ends with `team`, and includes member slides in `member_number` ascending order

#### Scenario: Builder skips missing datasets
- **WHEN** one or more optional weekly datasets are absent for the selected chapter-week
- **THEN** the system MUST omit those slide entries while still returning a valid deck with cover and team slides

##### Example:
- **GIVEN** week `2026-06-08` has no awards and no VP report
- **WHEN** builder runs for that week
- **THEN** output excludes `award` and `vp_report` entries but still includes `cover` and `team`

#### Scenario: Builder marks visible slide entries
- **WHEN** the builder creates keynote, member, guest, award, or vp_report entries
- **THEN** the system MUST set `visible` to true on each generated entry

#### Scenario: Builder receives data for multiple chapters
- **WHEN** the backing tables contain rows for more than one chapter in the same week
- **THEN** the system MUST include only rows for the requested chapter_id in the generated slide_order

##### Example:
- **GIVEN** week `2026-06-01` has rows for `ch-huaai` and `ch-other`
- **WHEN** builder runs with `chapter_id='ch-huaai'`
- **THEN** output contains only IDs belonging to `ch-huaai`
