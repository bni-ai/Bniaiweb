## ADDED Requirements

### Requirement: Admin can duplicate a slide
The system SHALL allow an officer to duplicate any existing slide within a presentation. The duplicated slide MUST preserve the original slide's editor patch (text layers, background image, styles) and MUST be appended to the end of the slide order with a new unique identifier.

#### Scenario: Duplicating a data-driven slide
- **WHEN** an officer clicks the duplicate button on a member slide
- **THEN** the system MUST create a new slide entry with the same type, a new internal id, the same editor patch, and append it to the slide order

##### Example:
- **GIVEN** slide at index 2 is `{ type: "member", id: "m-01", visible: true, editor: { textLayers: [...] } }`
- **WHEN** officer clicks duplicate on index 2
- **THEN** a new slide `{ type: "member", id: "m-01-copy-<uuid>", visible: true, editor: { textLayers: [...] } }` is appended at the end

#### Scenario: Duplicating a fixed slide
- **WHEN** an officer duplicates a cover slide
- **THEN** the system MUST create a new slide entry with type "custom" (not "cover"), preserving the editor patch, because fixed slides cannot have duplicates with the same type

##### Example:
- **GIVEN** slide at index 0 is `{ type: "cover", editor: { backgroundImageUrl: "..." } }`
- **WHEN** officer clicks duplicate on index 0
- **THEN** a new slide `{ type: "custom", id: "<uuid>", visible: true, editor: { backgroundImageUrl: "..." } }` is appended

### Requirement: Admin can add a blank slide
The system SHALL allow an officer to insert a blank slide of type "custom" into a presentation. The blank slide MUST have a unique identifier and MUST include one default editable text layer.

#### Scenario: Adding a blank slide
- **WHEN** an officer clicks "add blank slide"
- **THEN** the system MUST append a new slide `{ type: "custom", id: "<uuid>", visible: true, editor: { textLayers: [{ id: "...", text: "輸入文字", x: 180, y: 180, width: 720, height: 140, fontSize: 56, color: "#111827", fontWeight: "700", align: "left" }] } }` to the slide order

### Requirement: Admin can delete a slide
The system SHALL allow an officer to delete any non-fixed slide from a presentation. Fixed slides (cover, agenda, team, closing) MUST NOT be deletable. The system MUST reject attempts to delete the last remaining slide.

#### Scenario: Deleting a data-driven slide
- **WHEN** an officer clicks delete on a guest slide
- **THEN** the slide MUST be removed from the slide_order array

##### Example:
- **GIVEN** 簡報的 slide_order 為 `["cover", "guest-01", "guest-02", "closing"]`，目前選取的是 index 1 的來賓頁 `{ type: "guest", id: "guest-01", sourceId: "v-abc123" }`
- **WHEN** 幹部點擊該頁的刪除按鈕並確認
- **THEN** slide_order 更新為 `["cover", "guest-02", "closing"]`，`guest-01` 項目消失，頁面總數從 4 頁變為 3 頁

#### Scenario: Attempting to delete a fixed slide
- **WHEN** an officer attempts to delete the cover slide
- **THEN** the delete action MUST be blocked and the UI MUST show a tooltip explaining that fixed slides cannot be deleted

##### Example:
- **GIVEN** 幹部在投影片導覽列看到 index 0 的封面頁 `{ type: "cover" }`，其刪除按鈕呈灰色停用狀態
- **WHEN** 幹部嘗試點擊該停用的刪除按鈕（或透過鍵盤觸發）
- **THEN** 按鈕無反應，滑鼠懸停時顯示 tooltip「固定頁面無法刪除」，slide_order 不變

#### Scenario: Attempting to delete the last slide
- **WHEN** a presentation has only one slide and an officer attempts to delete it
- **THEN** the system MUST reject the deletion with an error message stating that a presentation must have at least one slide

##### Example:
- **GIVEN** 一份簡報的 slide_order 只剩 `["custom-only"]` 這一頁（其他頁都已被刪除）
- **WHEN** 幹部點擊該頁的刪除按鈕並確認
- **THEN** 系統顯示錯誤訊息「簡報至少需要保留一張投影片」，slide_order 維持 `["custom-only"]` 不變，該頁未被刪除

### Requirement: Admin can delete an entire presentation
The system SHALL allow an officer to delete a presentation record from the admin list. The deletion MUST also remove associated background images from storage.

#### Scenario: Deleting a draft presentation
- **WHEN** an officer clicks delete on a draft presentation from the admin list
- **THEN** the presentations record MUST be removed and any associated storage assets MUST be cleaned up

##### Example:
- **GIVEN** 管理清單中有一筆草稿簡報 `{ id: "pres-001", title: "2026-06 例會", status: "draft", published_url: null }`，storage 內有對應背景圖 `uploads/pres-001/bg.jpg`
- **WHEN** 幹部點擊該草稿的刪除按鈕並在確認對話框選「確認刪除」
- **THEN** `presentations` 資料表的 `pres-001` 筆記被移除，storage 中 `uploads/pres-001/` 目錄下的所有檔案被清除，管理清單不再顯示該筆資料

#### Scenario: Deleting a published presentation
- **WHEN** an officer clicks delete on a published presentation
- **THEN** the system MUST require confirmation, then remove the presentations record, clear the published_url, and remove associated storage assets

##### Example:
- **GIVEN** 管理清單中有一筆已發布簡報 `{ id: "pres-002", title: "2026-05 例會", status: "published", published_url: "https://bni.example.com/view/pres-002" }`，storage 內有背景圖 `uploads/pres-002/bg.jpg`
- **WHEN** 幹部點擊刪除按鈕，系統顯示警告「此簡報已發布，刪除後連結將失效，確定要繼續嗎？」，幹部點擊「確認刪除」
- **THEN** `presentations` 資料表的 `pres-002` 筆記被移除，`published_url` 欄位清空，storage `uploads/pres-002/` 目錄被清除，原 published_url 訪問時回傳 404
