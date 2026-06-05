## ADDED Requirements

### Requirement: Canvas editor supports slide-level CRUD controls
The system SHALL expose slide-level controls in the canvas editor's slide navigator panel. Each slide thumbnail MUST display duplicate and delete buttons. The panel MUST include an "add blank slide" button at the bottom.

#### Scenario: Slide navigator shows CRUD buttons
- **WHEN** an officer opens the presentation editor
- **THEN** each slide thumbnail in the navigator MUST show a duplicate button and a delete button (disabled for fixed slides)

##### Example:
- **GIVEN** 一份簡報包含 4 張投影片：index 0 封面（`type: "cover"`）、index 1 會員（`type: "member"`）、index 2 自訂（`type: "custom"`）、index 3 結尾（`type: "closing"`）
- **WHEN** 幹部開啟簡報編輯器，左側導覽列顯示這 4 個縮圖
- **THEN** index 0（封面）縮圖顯示「複製」按鈕（可用）和「刪除」按鈕（灰色停用）；index 1、2 縮圖同時顯示可用的「複製」和「刪除」按鈕；index 3（結尾）縮圖顯示「複製」按鈕（可用）和「刪除」按鈕（灰色停用）；導覽列底部顯示「新增空白頁」按鈕

#### Scenario: Adding a blank slide from navigator
- **WHEN** an officer clicks "add blank slide"
- **THEN** a new custom slide MUST be appended to the slide order and the editor MUST switch to that new slide

### Requirement: Canvas editor distinguishes fixed vs deletable slides
The system SHALL visually distinguish fixed slides (cover, agenda, team, closing) from data-driven and custom slides. Fixed slides MUST show a lock icon or disabled delete state.

#### Scenario: Fixed slide shows non-deletable state
- **WHEN** viewing the cover slide in the navigator
- **THEN** the delete button MUST be disabled and a tooltip MUST explain "固定頁面無法刪除"

### Requirement: Canvas editor preserves editor patches across CRUD operations
The system SHALL ensure that duplicate, add, and delete operations do not corrupt or lose existing editor patches for unaffected slides.

#### Scenario: Duplicating a slide preserves other slides
- **GIVEN** a presentation with 3 slides, each having custom text layers
- **WHEN** an officer duplicates slide 1
- **THEN** slides 0, 2, and the new slide 3 MUST all retain their original editor patches
