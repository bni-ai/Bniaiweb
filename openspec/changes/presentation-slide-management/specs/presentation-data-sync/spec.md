## ADDED Requirements

### Requirement: Data-driven slides render with live database data
The system SHALL resolve data-driven slide content (member, guest, keynote, award, vp_report) from the database at render time, not from cached data in the slide_order. The editor patch in slide_order SHALL only store layout overrides (position, style, background), not data content.

#### Scenario: Member slide renders latest member data
- **WHEN** the viewer renders a member slide
- **THEN** the system MUST query the members and weekly_briefs tables for the latest data associated with that slide's sourceId

##### Example:
- **GIVEN** member "張三" updated his specialty_title from "會計師" to "財務顧問" yesterday
- **WHEN** the viewer renders the member slide for "張三"
- **THEN** the slide MUST display "財務顧問" without requiring manual regeneration

#### Scenario: Keynote slide renders latest talk data
- **WHEN** the viewer renders a keynote slide
- **THEN** the system MUST query the keynote_talks table for the latest topic, outline, and product_images

##### Example:
- **GIVEN** 主題演講人「陳大明」已將本次演講主題從「傳統行銷」更新為「AI 驅動行銷策略」，`keynote_talks` 資料表中 `topic` 欄位已反映最新值
- **WHEN** 簡報播放器渲染 keynote 頁（`{ type: "keynote", sourceId: "kt-001" }`）
- **THEN** 投影片顯示「AI 驅動行銷策略」作為演講主題，並呈現最新的 outline 和 product_images，不顯示舊值「傳統行銷」

#### Scenario: Guest slide renders latest visit data
- **WHEN** the viewer renders a guest slide
- **THEN** the system MUST query the guest_visits and guests tables for the latest visit information

##### Example:
- **GIVEN** 來賓「王小明」的到訪記錄（`guest_visits` 中 `id: "gv-007"`）已更新公司名稱為「創新科技股份有限公司」，原簡報 slide_order 中僅存 `{ type: "guest", sourceId: "gv-007" }`，無 editor patch 覆寫
- **WHEN** 簡報播放器渲染該來賓頁
- **THEN** 投影片顯示「創新科技股份有限公司」，不顯示舊公司名稱，資料來源直接查詢 `guest_visits` 和 `guests` 資料表

### Requirement: Editor patch acts as layout override only
The system SHALL treat non-null values in the editor patch as layout overrides. When an editor field is null, the system MUST fall back to the live database value. When an editor field is undefined, the system MUST treat it as not configured.

#### Scenario: Title override takes precedence
- **WHEN** an officer manually edited a member slide's title to "特別介紹：張三"
- **THEN** the viewer MUST display "特別介紹：張三" instead of the member's chinese_name

#### Scenario: Null title falls back to database
- **WHEN** an officer clears the title override (sets it to null)
- **THEN** the viewer MUST display the member's chinese_name from the database

##### Example:
- **GIVEN** 幹部先前為會員頁設定了 title 覆寫「特別介紹：林小華」，後來決定移除覆寫，將 editor patch 中的 `title` 欄位設為 `null`
- **WHEN** 簡報播放器渲染該會員頁
- **THEN** 投影片顯示資料庫中 `members.chinese_name` 的值「林小華」，不再顯示「特別介紹：林小華」

#### Scenario: Undefined editor field uses database default
- **WHEN** an editor field is undefined (never set)
- **THEN** the viewer MUST use the live database value without modification

##### Example:
- **GIVEN** 一張新複製的會員投影片，editor patch 為 `{ backgroundImageUrl: "..." }`，其中 `title` 欄位完全不存在（`undefined`，從未被設定過）
- **WHEN** 簡報播放器渲染該投影片
- **THEN** 系統直接使用資料庫的 `members.chinese_name`（例如「黃阿強」）作為顯示標題，不顯示空白，也不顯示任何 fallback 佔位符

### Requirement: Data source missing fallback
The system MUST handle cases where a data source referenced by a slide no longer exists. The viewer SHALL render a placeholder indicating missing data rather than failing or showing blank content.

#### Scenario: Member no longer exists
- **GIVEN** a member slide references a member_id that has been deleted
- **WHEN** the viewer renders that slide
- **THEN** the slide MUST display a placeholder message (e.g., "會員資料暫時無法取得") and MUST NOT crash
