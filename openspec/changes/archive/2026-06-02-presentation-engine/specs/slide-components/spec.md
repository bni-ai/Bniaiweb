## ADDED Requirements

### Requirement: Slide components

The system SHALL provide typed slide components for the seven planned presentation segment types and feed them with pre-fetched data props only.

#### Scenario: Cover slide renders chapter context
- **WHEN** the viewer renders a cover slide entry
- **THEN** the system MUST show the chapter name, week date, and meeting time within the shared 16:9 presentation frame

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
- **THEN** each slide displays mapped fields (guest visit badge, award info, VP metrics) within shared 16:9 frame

#### Scenario: Slide content exceeds the frame
- **WHEN** a slide receives long text or many display elements
- **THEN** the system MUST clamp or wrap the content so the slide remains readable within the 16:9 layout
