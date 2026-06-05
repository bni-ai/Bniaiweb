## 1. 來賓入口與首頁

- [x] 1.1 落實 `Role-separated portal navigation` 與 `Guest portal supports public signup and login handoff`：整理 `app/(guest)/layout.tsx`，讓匿名與已登入來賓的 CTA 正確分流，不再同時顯示互相衝突的登入 / 登出操作；驗證：anonymous 看得到登入 / 註冊 CTA，已登入 guest 看得到登出與 guest navigation。
- [x] 1.2 落實 `Authenticated guest portal content`、`Guest introduction content separation`、`來賓 portal 以受限個人化為主` 與 ``/guest` 同時承接公開介紹與登入後上下文`：調整 `/guest` 首頁，讓匿名訪客看到分會 / BNI 介紹與 CTA，已登入來賓看到邀約人或聯繫窗口、參訪週次、狀態與下一步；驗證：Playwright 分別以 anonymous 與 guest session 開啟 `/guest`，內容差異符合 spec。
- [x] [P] 1.3 落實 `Guest-facing Traditional Chinese content`、`Portal visual consistency` 與 `Open Design / v3 final alignment 作為來賓視覺基準`：保持來賓首頁、準備頁、內容頁為繁體中文、符合 v3 final alignment，且無水平溢位；驗證：文字掃描不命中舊英文按鈕，桌機與手機 viewport 下無 horizontal overflow。

## 2. 回饋與聯繫入口

- [x] [P] 2.1 新增 `app/(guest)/guest/feedback/page.tsx`，提供來賓可進入的會後回饋頁與基本提交介面；驗證：guest 開啟 `/guest/feedback` 時能看到繁體中文表單，提交後顯示成功狀態或成功訊息。
- [x] [P] 2.2 落實 `Guest contact ownership`、`Guest introduction request tracking` 與 `第一版只提供聯繫窗口與引介入口，不做完整追蹤 CRM`：新增 `app/(guest)/guest/connections/page.tsx`，顯示邀約人或指定聯繫窗口，並提供「請聯繫人協助引介」入口；驗證：guest 開啟 `/guest/connections` 時看得到聯繫窗口名稱與 CTA，且不暴露完整會員私有聯絡資料。
- [x] 2.3 落實 `來賓回饋表單優先存在 Supabase，不外連第三方表單` 與 `來賓回饋表單資料契約`：調整 `lib/actions/guest-portal.ts` 與必要資料寫入，讓回饋優先寫入 Supabase guest 資料層（第一版可寫 `guest_visits.feedback`）；驗證：`lib/actions/guest-portal.test.ts` 覆蓋 feedback 更新與 redirect。

## 3. 權限邊界與驗收

- [x] 3.1 落實 `Guest portal hides member-only workflows` 與 `Guest portal introduction boundary`：來賓導覽與引介頁不得顯示會員週報、一對一管理、AI 助手、管理端操作或完整會員私有聯絡資料；驗證：guest role e2e 對 `/guest`、`/dashboard`、`/admin`、引介頁執行權限與可見文字檢查。
- [x] 3.2 完成 `先做 guest MVP，不在本輪做完整三入口重構` 與 `目前 guest MVP 仍缺的落差` 的整體驗收：guest MVP 實作後需通過 focused tests、`npm run build`、guest route e2e；驗證：測試全綠，`/guest`、`/guest/register`、`/guest/feedback`、`/guest/connections` 無錯誤頁、無舊英文文案、無水平溢位。
