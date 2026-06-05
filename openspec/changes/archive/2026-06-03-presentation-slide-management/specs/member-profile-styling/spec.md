## ADDED Requirements

### Requirement: Member profile page uses card-based layout
The system SHALL render the member profile page using a card-based, information-hierarchy design that aligns with the `ui-mockup-member.html` reference. The layout MUST separate personal info, professional details, referral tiers, GAINS data, and weekly briefs into distinct visual sections.

#### Scenario: Profile page displays member information
- **WHEN** a member or officer views a member profile page
- **THEN** the page MUST display: avatar, chinese_name, english_name, company_name, specialty_title, specialty_description, position, committee, contact info, and member_number in a structured card layout

##### Example:
- **GIVEN** member "張三" with specialty_title="財務顧問", company_name="ABC會計"
- **WHEN** the profile page loads
- **THEN** the page shows a profile card with large avatar on the left, name and company on the right, and specialty in a dedicated section below

### Requirement: Profile page displays referral tiers
The system SHALL display the member's referral tiers (引薦來源層級) in a structured format with tier labels, titles, and descriptions.

#### Scenario: Referral tiers are visible
- **WHEN** a member has defined referral tiers
- **THEN** the profile page MUST display each tier with its label (e.g., "第一層"), title, and description in a bordered card

### Requirement: Profile page displays GAINS profile
The system SHALL display the member's GAINS (Goals, Accomplishments, Interests, Networks, Skills) data in a dedicated section using a grid layout.

#### Scenario: GAINS data is rendered
- **WHEN** a member has GAINS data
- **THEN** the profile page MUST display Goals, Accomplishments, Interests, Networks, and Skills in a 2-column grid with clear labels

### Requirement: Profile page displays weekly brief
The system SHALL display the member's most recent weekly brief (have_this_week, want_this_week) in a prominent card at the top of the profile.

#### Scenario: Weekly brief is current
- **WHEN** the member has submitted a brief for the current week
- **THEN** the profile page MUST display have_this_week and want_this_week in a highlighted card with a "本週簡報" label

### Requirement: Profile and presentation share visual language
The member profile page and the member slide in presentations SHALL use consistent typography, color tokens, and spacing. The profile page design MUST inform the member slide template design.

#### Scenario: Consistent styling between profile and slide
- **WHEN** viewing a member profile and then viewing the same member's presentation slide
- **THEN** both MUST use the same font sizes for name display, the same color for specialty labels, and the same avatar sizing

##### Example:
- **GIVEN** 會員「李美玲」的個人頁面在姓名顯示上使用 `font-size: 28px`、`font-weight: 700`，專長標籤顏色為 `#1D4ED8`（藍色），頭像尺寸為 `96px × 96px`
- **WHEN** 在 BNI 例會簡報中檢視「李美玲」的會員頁投影片
- **THEN** 投影片上的姓名同樣以 `font-size: 28px`、`font-weight: 700` 顯示，專長標籤顏色同為 `#1D4ED8`，頭像尺寸同為 `96px × 96px`，視覺上與個人頁保持一致
