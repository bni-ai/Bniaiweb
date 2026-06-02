## ADDED Requirements

### Requirement: Weekly Brief Submission Form

The system SHALL provide a form for members to submit their weekly brief containing two fields: "本週我有" (have_this_week) and "本週我要" (want_this_week). Both fields SHALL be free-text textareas.

#### Scenario: Member submits weekly brief

- **WHEN** a member fills in both fields and clicks "送出"
- **THEN** the system SHALL save the brief with status `submitted` and record the submission timestamp

---

### Requirement: Draft Auto-Save

The system SHALL automatically save form content as a draft every 30 seconds while the member is editing. The draft SHALL persist across browser sessions.

#### Scenario: Member closes browser mid-edit

- **WHEN** a member has typed content but not submitted, then returns later
- **THEN** the system SHALL restore the draft content in the form fields

##### Example: 關閉後重開仍有草稿

- **GIVEN** member 已輸入 120 字 `have_this_week` 並停留超過 30 秒
- **WHEN**關閉瀏覽器後 10 分鐘重新登入
- **THEN**草稿內容自動回填到兩個 textarea

---

### Requirement: Submission Status Tracking

The system SHALL track each member's submission status for the current week: `not_started`, `draft`, or `submitted`. Officers SHALL be able to view all members' submission statuses.

#### Scenario: Officer checks submission progress

- **WHEN** an officer opens the admin dashboard
- **THEN** the system SHALL display the count and list of members in each status category

##### Example: 進度統計顯示

- **GIVEN** 本週狀態為 submitted=20、draft=8、not_started=8
- **WHEN** officer 進入 `/admin`
- **THEN** dashboard 顯示三類別統計與對應會員名單

---

### Requirement: Deadline Enforcement

The system SHALL enforce a configurable weekly submission deadline (default: Friday 23:59). After the deadline, the form SHALL still accept submissions but SHALL mark them as "late".

#### Scenario: Member submits after deadline

- **WHEN** a member submits their brief after the configured deadline
- **THEN** the system SHALL accept the submission and tag it as `late` in the admin view
