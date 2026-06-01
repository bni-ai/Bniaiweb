## ADDED Requirements

### Requirement: Weekly Submission Progress Dashboard

The admin dashboard SHALL display real-time submission progress for the current week: total members, submitted count, not-submitted count, and submission rate as a percentage with visual indicator.

#### Scenario: Officer views dashboard

- **WHEN** an officer opens the admin dashboard and 28 of 35 members have submitted
- **THEN** the system SHALL display "已填寫: 28 / 未填寫: 7 / 填寫率: 80%" with a progress visualization

---

### Requirement: Member Management

The admin dashboard SHALL provide a member list with search, filter by role, and inline editing capabilities. Officers SHALL be able to add new members, edit existing profiles, and deactivate members.

#### Scenario: Officer searches for a member

- **WHEN** an officer types "AI" in the search box
- **THEN** the system SHALL filter the member list to show only members whose name or specialty contains "AI"

---

### Requirement: Presentation Management

Officers SHALL be able to manage presentations: generate from current week data, preview the full slide deck, reorder slides, publish to public URL, and unpublish.

#### Scenario: Officer publishes presentation

- **WHEN** an officer clicks "發布" on a generated presentation
- **THEN** the system SHALL make the presentation publicly accessible at `/presentation/[week-date]` within 5 seconds

---

### Requirement: Bulk Reminder

Officers SHALL be able to send a reminder to all members who have not yet submitted their weekly brief with a single click. The reminder content SHALL be pre-generated.

#### Scenario: Officer sends bulk reminder

- **WHEN** an officer clicks "一鍵提醒未填會員" with 7 unsubmitted members
- **THEN** the system SHALL queue reminder notifications for all 7 members

---

### Requirement: System Settings

Officers SHALL be able to configure: weekly submission deadline, reminder time, AI provider settings, and chapter information (name, region, meeting time).

#### Scenario: Officer changes submission deadline

- **WHEN** an officer changes the deadline from Friday 23:59 to Friday 18:00
- **THEN** all subsequent deadline checks SHALL use the new time
