## ADDED Requirements

### Requirement: Event Management

Officers SHALL be able to create, edit, and delete events. Each event SHALL have: title, date, description, registration deadline, and maximum participants.

#### Scenario: Officer creates an event

- **WHEN** an officer creates "亞洲商媒會展前交流會" on 2026-06-26 with max 50 participants
- **THEN** the system SHALL save the event and make it visible to all members

---

### Requirement: Event Registration

Members SHALL be able to register for upcoming events before the registration deadline. The system SHALL enforce the maximum participant limit.

#### Scenario: Member registers for event

- **WHEN** a member clicks "報名" on an event with available spots
- **THEN** the system SHALL create a registration record and update the remaining spots count

#### Scenario: Event is full

- **WHEN** a member attempts to register for an event that has reached max participants
- **THEN** the system SHALL display "已額滿" and disable the registration button

---

### Requirement: Attendance Tracking

Officers SHALL be able to mark attendance for registered members after an event. The system SHALL maintain attendance records for reporting.

#### Scenario: Officer marks attendance

- **WHEN** an officer marks 30 of 50 registered members as attended
- **THEN** the system SHALL save attendance records and display the attendance rate (60%)
