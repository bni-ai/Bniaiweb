## ADDED Requirements

### Requirement: One-on-One Invitation

Any member SHALL be able to send a one-on-one meeting invitation to another member. The invitation SHALL include a proposed date/time and optional message.

#### Scenario: Member sends invitation

- **WHEN** member #001 invites member #002 for a one-on-one on 2026-06-10 at 14:00
- **THEN** the system SHALL create a `one_on_ones` record with status `pending` and notify the invitee

---

### Requirement: Invitation Response Flow

The invitee SHALL be able to accept or decline a one-on-one invitation. Accepting SHALL change status to `confirmed`. Declining SHALL change status to `declined`.

#### Scenario: Invitee accepts

- **WHEN** member #002 accepts the invitation from member #001
- **THEN** the system SHALL update status to `confirmed` and notify the inviter

---

### Requirement: Completion Tracking

After a confirmed one-on-one occurs, either participant SHALL be able to mark it as completed and add notes about the meeting.

#### Scenario: Member completes one-on-one

- **WHEN** member #001 marks the one-on-one with member #002 as completed with notes
- **THEN** the system SHALL update status to `completed` and save the notes

---

### Requirement: One-on-One Statistics

The system SHALL calculate and display one-on-one statistics per member: total completed this week, this month, and cumulative. The half-year target is 52 one-on-ones (2 per week).

#### Scenario: Member views statistics

- **WHEN** a member opens their one-on-one dashboard
- **THEN** the system SHALL display weekly count, monthly count, cumulative count, and progress toward the 52 target
