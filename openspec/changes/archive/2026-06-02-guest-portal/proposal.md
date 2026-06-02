## Why

BNI 華 AI 分會目前的登入流程只區分正式會員與非會員錯誤頁，但實際運作上「受邀來賓」需要一個低權限、可引導、可教育的專屬入口。這個入口可讓來賓在會前了解分會、BNI、受邀資訊與 15 秒自我介紹準備方式，同時避免來賓誤進正式會員功能或後台。

## What Changes

- 新增來賓專區入口，支援公開瀏覽與登入後個人化狀態。
- 公開狀態可瀏覽分會介紹、BNI 基本資訊、來賓須知、文章與影片內容。
- 來賓登入後可看到自己的邀約資訊、邀約會員、拜訪週次、15 秒介紹準備提示。
- 來賓登入後可查看部分會員資訊，但權限受限，不可進入後台、不可使用正式會員一對一預約、不可使用會員資料編輯或開發中功能。
- Auth callback 需能識別「email 不在 members 但在 guests」的來賓，並導向來賓專區，而不是只導向錯誤頁。
- 後台來賓管理需要能補齊來賓 email 與邀約會員，作為來賓登入後個人化資料來源。

## Non-Goals

- 不在本 SR 建立完整 CMS；文章與影片先定義資料模型與列表/詳情顯示邊界。
- 不開放來賓申請正式會員、付款、合約、審核流程。
- 不開放來賓使用正式會員的一對一預約、會員後台、會員資料編輯、週報提交。
- 不處理公開 SEO/行銷頁完整改版；本 SR 聚焦來賓專區與登入後流程。
- 不把來賓視為 `members` 正式會員；來賓身份仍以 `guests` / `guest_visits` 為主。

## Capabilities

### New Capabilities

- `guest-public-content`: 公開來賓資訊頁，提供分會介紹、BNI 說明、來賓須知、文章與影片內容瀏覽。
- `guest-auth-portal`: 來賓登入後個人化專區，顯示邀約來源、拜訪資訊、15 秒介紹準備與受限會員資訊。
- `guest-access-boundary`: 來賓角色與正式會員/後台權限隔離，包含 auth callback 導向與 middleware 存取規則。

### Modified Capabilities

(none)

## Impact

- Affected specs: guest-public-content, guest-auth-portal, guest-access-boundary
- Affected code:
  - New: app/(guest)/guest/page.tsx
  - New: app/(guest)/guest/content/page.tsx
  - New: app/(guest)/guest/members/page.tsx
  - New: app/(guest)/guest/prepare/page.tsx
  - New: lib/actions/guest-portal.ts
  - New: supabase/migrations/004_guest_portal.sql
  - Modified: app/auth/callback/route.ts
  - Modified: middleware.ts
  - Modified: app/(admin)/admin/guests/page.tsx
