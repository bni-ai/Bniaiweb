## ADDED Requirements

### Requirement: Guest Registration

Officers SHALL be able to register guests for a given week, recording: guest name, specialty, and referrer (existing member). Each guest SHALL be linked to the referring member.

#### Scenario: Officer registers a guest

- **WHEN** an officer adds guest "陳駿翰" with specialty "睿思智慧執行長" referred by member #026
- **THEN** the system SHALL create a `guests` record linked to that week and referrer

---

### Requirement: Guest Self-Introduction and Feedback

Guests SHALL have fields for self-introduction (15-second intro content) and post-meeting feedback (15-second reflection). Officers SHALL be able to fill these fields on behalf of guests.

#### Scenario: Officer records guest feedback

- **WHEN** an officer enters feedback for a guest after the meeting
- **THEN** the system SHALL save the feedback and make it visible in the guest history

##### Example: 會後回饋保存

- **GIVEN** guest `陳駿翰` 當週參與例會
- **WHEN** officer 填入 `feedback='認識到三位潛在合作夥伴'` 並儲存
- **THEN**該 feedback 會出現在該 guest 的歷史紀錄頁

---

### Requirement: Guest Slide Auto-Generation

The presentation engine SHALL auto-generate GuestSlide components from `guests` data, displaying guest name, specialty, and referrer information.

#### Scenario: Presentation includes guest slides

- **WHEN** a presentation is generated for a week with 3 registered guests
- **THEN** the system SHALL include 3 GuestSlide components in the slide deck
