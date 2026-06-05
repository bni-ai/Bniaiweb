## Context

目前 guest portal 已有初步頁面與資料，但第一階段要的最小閉環還沒收好：

- 來賓公開註冊入口要獨立明確
- 已登入 `/guest` 要能看懂自己現在是誰、要做什麼、找誰
- 來賓要有會後回饋入口與聯繫窗口
- guest 導覽不能再混入 member / admin workflow

這次 change 不做整個三入口重構，只把 guest portal 收成 MVP，讓營運能直接使用。

## Goals / Non-Goals

**Goals:**

- 讓來賓入口成為獨立 portal，而不是只靠公開頁與準備頁湊合。
- 收成 guest MVP：公開註冊、登入後歡迎資訊、聯繫窗口、會後回饋入口。
- 延續 Open Design / v3 final alignment 的設計語彙，避免來賓頁變成第三套風格。
- 保留 guest access boundary：來賓不能看到會員或管理員的私有操作。
- 先明確規定來賓回饋優先寫入 Supabase。

**Non-Goals:**

- 本 SR 不做完整三入口 portal switch 重構。
- 本 SR 不做正式會員 CSV 契約與匯入。
- 本 SR 不開放完整會員通訊錄給來賓。
- 本 SR 不做 introduction request 的完整後台追蹤資料流。
- 本 SR 不把 LINE 串接與通知自動化納入第一版。

## Decisions

### D1. 先做 guest MVP，不在本輪做完整三入口重構

更大的 admin/member/guest portal switch 還要再拆，但目前營運最需要的是 guest 可以獨立註冊、登入並完成參訪前後基本流程。先收 guest MVP，可以直接產生可用價值，也能避免一次動太多 shell 與導航結構。

### D2. 來賓 portal 以受限個人化為主

來賓登入後要看得到自己的邀約人、參訪週次、分會介紹、會後回饋與聯繫窗口。這些資訊應該個人化，但不能暴露會員私有操作或完整會員後台資料。

替代方案是完全公開來賓頁；這無法處理會後回饋與聯繫人引介，不採用。

### D3. Open Design / v3 final alignment 作為來賓視覺基準

來賓頁可以比管理端更導覽式，但仍要使用同一套 token、spacing、status 與 responsive 規則。這次只要求 guest surface 看起來跟現有 v3 alignment 同系，不要求同一輪就重做 admin/member shell。

替代方案是先寫功能再補視覺；此專案目前最大的風險就是 UI 對齊落差，不採用。

### D4. 第一版只提供聯繫窗口與引介入口，不做完整追蹤 CRM

來賓若想認識其他會員，第一版只需要看得到「找誰協助」與「從哪裡發起」。真正的後台追蹤、指派與歷史列表可以延後，不必在這輪 guest MVP 一次做完。

替代方案是開放完整會員聯絡清單；這會放大隱私與權限風險，不採用。

### D5. 來賓回饋表單優先存在 Supabase，不外連第三方表單

考量來賓後續可能轉正式會員，回饋資料應與 guest / member 主資料放在同一套資料系統。第一版若只需單段回饋，可先沿用 `guest_visits.feedback`；若要支撐評分、後續追蹤、轉會員分析，則應新增獨立的 `guest_feedback_submissions` 類型資料表。這份 SR 先定方向：不以 Google Form 為 SSOT，外部表單頂多作為暫時入口，不作為最終資料存放。

替代方案是把會後回饋獨立放在 Google 表單；這會增加資料回寫、權限、去重與 guest->member 轉換成本，不採用。

### D6. `/guest` 同時承接公開介紹與登入後上下文

匿名訪客開 `/guest` 時應先看到分會與 BNI 介紹，以及清楚的註冊 / 登入 CTA；已登入來賓再在同一頁面看到個人化資訊、聯繫窗口與下一步。這樣可以降低 route 數量，也能避免把 guest 首頁切成太多碎頁。

## Implementation Contract

後續 apply 這個 SR 時，必須滿足以下可觀察行為：

- 匿名訪客開 `/guest` 時，能看到分會 / BNI 介紹與清楚的登入、註冊 CTA。
- 已登入來賓開啟來賓首頁時，能看到分會 / BNI 簡介、邀約人或聯繫人、參訪週次與下一步動作。
- 來賓會後回饋必須有可進入的頁面與可提交的基本表單或明確提交介面，不得只放靜態文案。
- 來賓會後回饋的資料 SSOT 預設在 Supabase；若第一版暫用 `guest_visits.feedback`，後續也要保留遷移到獨立回饋表的擴充空間。
- 來賓有興趣聯繫其他會員時，必須能看到指定聯繫人 / 邀約人與引介入口；第一版不得直接暴露完整會員聯絡資料。
- guest 導覽不得顯示會員週報、一對一預約管理、AI 助手、會員管理或系統設定。
- 實作驗收必須包含本機 build、focused tests、guest route e2e 與無水平溢位檢查。

範圍邊界：本 SR 的 apply 階段可以調整 guest routes、guest actions、guest layout 與必要資料讀寫；不得擴張到完整三入口導航重構、LINE 自動化、完整 CRM、正式會員資料匯入或測試資料清理。

## Risks / Trade-offs

- [Risk] guest 首頁同時承接匿名與登入後內容，頁面可能過重。→ Mitigation：把個人化資訊集中在首屏卡片，其餘介紹維持簡潔。
- [Risk] 來賓可見會員資訊過多，造成隱私風險。→ Mitigation：來賓只看到公開或受邀上下文內的資訊，聯繫其他會員走聯繫人引介。
- [Risk] 回饋表單需要新資料表，可能牽涉 migration。→ Mitigation：設計階段先定義欄位與存放策略，再進 apply；不得在沒有資料契約時硬寫 UI。
- [Risk] 匿名 CTA 與已登入 CTA 混在一起，使用者不知道該按哪個。→ Mitigation：未登入時主 CTA 顯示註冊 / 登入；已登入時改成回饋與聯繫入口。

## Pre-implementation Contracts

### A. 來賓回饋表單資料契約

- 儲存位置：Supabase
- 第一版可接受：
  - 直接寫入 `guest_visits.feedback`
- 正式版建議獨立欄位：
  - `guest_id`
  - `guest_visit_id`
  - `chapter_id`
  - `rating`
  - `what_you_learned`
  - `who_you_want_to_meet`
  - `follow_up_needed`
  - `notes`
  - `submitted_at`
- 邊界：
  - 外部表單不是 SSOT
  - 若未來有外部表單，也只能當入口，不作最終資料來源

### B. 目前 guest MVP 仍缺的落差

- `/guest/register` 尚未成為獨立公開註冊入口
- `/guest` 尚未把匿名 CTA 與已登入來賓上下文收成同一條清楚流程
- `會後回饋` 與 `聯繫人引介` 還缺正式頁面
- guest 導覽與 shell 仍有登入 / 登出狀態混亂風險
