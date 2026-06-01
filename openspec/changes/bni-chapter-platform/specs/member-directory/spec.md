## ADDED Requirements

### Requirement: Member Directory Card Grid

The system SHALL display a `/dashboard/directory` page accessible to all authenticated members. The page SHALL render all active members as cards in a responsive grid. Each card SHALL display: head photo (or initials placeholder), member_number badge, chinese_name, specialty_title, and position/committee badge(s).

#### Scenario: Directory loads with all members

- **WHEN** an authenticated member navigates to `/dashboard/directory`
- **THEN** the system SHALL render cards for all 36 active members within 2 seconds

#### Scenario: Search by name

- **WHEN** a user types a name substring in the search input
- **THEN** the system SHALL filter cards to show only members whose chinese_name contains the search string, without page reload

#### Scenario: Filter by position

- **WHEN** a user selects a position value from the position dropdown
- **THEN** the system SHALL show only cards where members.position equals the selected value

---

### Requirement: Self-Card Distinction

The system SHALL distinguish the current user's own card from other members' cards in the directory.

#### Scenario: Viewing own card

- **WHEN** the current user's card appears in the directory grid
- **THEN** the card SHALL display a [查看我的資料] button instead of [預約一對一]
- **AND** clicking [查看我的資料] SHALL open the profile modal with no booking action available

#### Scenario: Viewing another member's card

- **WHEN** the current user views any card that is not their own
- **THEN** the card SHALL display a [預約一對一] button

---

### Requirement: Profile Modal

The system SHALL display a read-only profile modal when a member card is clicked.

#### Scenario: Modal content for any member

- **WHEN** a user clicks any member card or the card's action button
- **THEN** the system SHALL display a modal containing: head photo, chinese_name, member_number, position badge, committee badge, specialty_description (一分鐘介紹), ideal_referral (理想客戶), general_referral (服務或產品), dream_referral (三層引薦)

#### Scenario: Profile modal booking action for other members

- **WHEN** a user opens the profile modal of a member who is NOT the current user
- **THEN** the modal SHALL display a [預約一對一] button at the bottom
- **AND** clicking it SHALL navigate to `/dashboard/one-on-one/new?invitee_id={member_id}`

#### Scenario: Profile modal for self

- **WHEN** a user opens the profile modal of their own card
- **THEN** the modal SHALL NOT display any [預約一對一] or booking button
