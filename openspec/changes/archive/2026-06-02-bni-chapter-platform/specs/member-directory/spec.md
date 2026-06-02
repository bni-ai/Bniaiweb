## ADDED Requirements

### Requirement: Member Directory Card Grid

The system SHALL display a `/dashboard/directory` page accessible to all authenticated members. The page SHALL render all active members as cards in a responsive grid. Each card SHALL display: head photo (or initials placeholder), member_number badge, chinese_name, specialty_title, and position/committee badge(s).

#### Scenario: Directory loads with all members

- **WHEN** an authenticated member navigates to `/dashboard/directory`
- **THEN** the system SHALL render cards for all 36 active members within 2 seconds

#### Scenario: Search by name

- **WHEN** a user types a name substring in the search input
- **THEN** the system SHALL filter cards to show only members whose chinese_name contains the search string, without page reload

##### Example: 搜尋姓名子字串

- **GIVEN** members 包含「吳文凱」、「馬驊」
- **WHEN** user 輸入 `文凱`
- **THEN** directory 僅顯示「吳文凱」

#### Scenario: Filter by position

- **WHEN** a user selects a position value from the position dropdown
- **THEN** the system SHALL show only cards where members.position equals the selected value

##### Example: 篩選副主席

- **GIVEN** position dropdown 選項含 `副主席`
- **WHEN** user 選擇 `副主席`
- **THEN** directory 僅顯示 `members.position='副主席'` 的卡片

---

### Requirement: Self-Card Distinction

The system SHALL distinguish the current user's own card from other members' cards in the directory.

#### Scenario: Viewing own card

- **WHEN** the current user's card appears in the directory grid
- **THEN** the card SHALL display a [查看我的資料] button instead of [預約一對一]
- **AND** clicking [查看我的資料] SHALL open the profile modal with no booking action available

##### Example: 本人卡片按鈕

- **GIVEN** current user `member_id=002`
- **WHEN** grid 渲染 `member_id=002` 的卡片
- **THEN**卡片操作按鈕為 [查看我的資料]

#### Scenario: Viewing another member's card

- **WHEN** the current user views any card that is not their own
- **THEN** the card SHALL display a [預約一對一] button

##### Example: 他人卡片按鈕

- **GIVEN** current user `member_id=002`，目標卡片 `member_id=010`
- **WHEN** card 渲染完成
- **THEN**卡片操作按鈕為 [預約一對一]

---

### Requirement: Profile Modal

The system SHALL display a read-only profile modal when a member card is clicked.

#### Scenario: Modal content for any member

- **WHEN** a user clicks any member card or the card's action button
- **THEN** the system SHALL display a modal containing: head photo, chinese_name, member_number, position badge, committee badge, specialty_description (一分鐘介紹), ideal_referral (理想客戶), general_referral (服務或產品), dream_referral (三層引薦)

##### Example: Modal 欄位完整性

- **GIVEN** 目標會員有 `member_number=001`、`position=主席`、`committee=無`
- **WHEN** user 點擊該卡片
- **THEN** modal 內可見 member_number、職掌 badge、委員會 badge 與三層引薦欄位

#### Scenario: Profile modal booking action for other members

- **WHEN** a user opens the profile modal of a member who is NOT the current user
- **THEN** the modal SHALL display a [預約一對一] button at the bottom
- **AND** clicking it SHALL navigate to `/dashboard/one-on-one/new?invitee_id={member_id}`

#### Scenario: Profile modal for self

- **WHEN** a user opens the profile modal of their own card
- **THEN** the modal SHALL NOT display any [預約一對一] or booking button

##### Example: 本人 modal 無預約按鈕

- **GIVEN** current user `member_id=002`
- **WHEN**開啟 `member_id=002` 的 modal
- **THEN**頁尾不顯示 [預約一對一]
