## ADDED Requirements

### Requirement: One-on-one form

The system SHALL let members manage availability and create one-on-one bookings that generate a Jitsi meeting room for valid timeslots.

#### Scenario: Member sets availability
- **WHEN** a member saves one or more availability windows with day_of_week, start_time, and end_time
- **THEN** the system MUST store the windows for that member and show them in the one-on-one dashboard

##### Example:
- **GIVEN** member `m-010`
- **WHEN** member saves `day_of_week=3`, `start_time=10:00`, `end_time=11:00`
- **THEN** one row is stored in `member_availability` and appears in availability UI after refresh

#### Scenario: Member books an available timeslot
- **WHEN** a member selects another active member and chooses a timeslot within the invitee availability window
- **THEN** the system MUST create a pending one_on_ones record with inviter_id, invitee_id, scheduled_at, and a generated jitsi_room value

##### Example:
- **GIVEN** inviter `m-010` and invitee `m-026` with available slot `2026-06-04 10:00`
- **WHEN** inviter confirms booking for that slot
- **THEN** `one_on_ones` row is created with `status='pending'` and `jitsi_room` not null

#### Scenario: Booking conflict is rejected
- **WHEN** a member tries to book themselves, chooses a slot outside availability, or creates an overlapping booking for either participant
- **THEN** the system MUST reject the booking and show a validation error without creating a one_on_ones record

##### Example:
- **GIVEN** invitee `m-026` already has confirmed booking at `2026-06-04 10:00`
- **WHEN** another member tries to book `m-026` at the same time
- **THEN** API returns conflict error and no new `one_on_ones` row is inserted

#### Scenario: Member updates booking status
- **WHEN** a participant marks a booking as confirmed, completed, or cancelled
- **THEN** the system MUST persist the new status and continue showing the same Jitsi meeting link for that booking

##### Example:
- **GIVEN** booking `oo-1001` has `status='pending'` and `jitsi_room='abc123xyz'`
- **WHEN** invitee accepts and status changes to `confirmed`
- **THEN** row `oo-1001` stores `status='confirmed'` and keeps the same `jitsi_room`
