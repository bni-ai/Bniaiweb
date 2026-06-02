## Why

BNI 華AI分會（36 位會員 + 幹部團隊）目前的例會運作依賴手動流程：會員資料散在 Google Sheet、簡報用 PPT 手動編輯、一對一預約靠 LINE 口頭約、培訓紀錄靠人腦記憶。每週幹部花大量時間「搬資料」「對資料」「催人填寫」。需要一個統一的 SaaS 平台，讓會員自助填寫、系統自動產出簡報、幹部一站管理所有分會事務。

## What Changes

- 建立獨立 SaaS 平台（Next.js + Supabase + Tailwind CSS + Vercel）
- 會員透過 Gmail 登入，自助管理個人資料、上傳照片與產品圖
- `members` 表三個欄位分離：`role`（admin/member，控制後台存取權限）、`position`（主席/副主席/秘書財務/資訊組長/成長協調/活動協調/導師協調/教育協調/來賓接待/無）、`committee`（導師群/接待組員/教育組員/秘財組員/資訊組員/成長組員/活動組員/會員委員/無）。8 個職掌 + 其底下的組員 = admin role；其餘 = member role
- 初始資料：36 位會員完整組織架構（主席吳文凱、副主席馬驊、秘書財務何佳薇、資訊組長余啟彰、成長協調石惠瑩、活動協調蔡晴羽、導師協調林政翰、教育協調康祐禎、來賓接待朱展宏，及各組組員）
- 每週會員填表後，系統自動產出 HTML 簡報（含首頁、會員簡報卡、8 分鐘演講、來賓介紹、領導團隊、表揚、副主席報告等頁面類型）
- 幹部後台可查看填寫進度、調整簡報順序、一鍵提醒未填會員、發布簡報到線上
- 8 分鐘短講管理：排程、上傳簡報素材、自動產出演講頁面
- 來賓管理：來賓名單、引薦人對應、來賓心得
- 前台「會員通訊錄」頁面：卡片 grid 展示全體會員（頭像、姓名、專業、職掌/委員會 badge）、搜尋篩選、點入唯讀 profile（含一分鐘介紹、理想客戶、服務或產品、三層引薦），提供 [預約一對一] 入口；自己的卡片顯示 [查看我的資料]
- 一對一預約系統：會員設定可用時段（`member_availability` 表）、選人比對雙方空閒、選時段、對方確認；內嵌 Jitsi Meet iframe（Phase 1：meet.jit.si 公開 server，Phase 2：Vultr VPS 自架）；視訊入口在即將進行的一對一卡片 [開始視訊]
- 活動管理：活動行事曆、報名管理
- 培訓追蹤：16 種培訓課程、教育學分計算、完課狀態
- AI 助手模組：支援多 AI provider（Claude API / Gemini API / OpenAI API），可切換或並用，提供自動提醒、資料查詢、智能摘要、會員簡報內容建議
- BNI Connect 自動同步：會員提交每週簡報後，後台 Playwright job 自動登入 bniconnectglobal.com，將相同引薦/成交/來賓數字填入並提交，無需人工重複輸入。帳密由管理員設定後加密儲存，每週觸發一次
- 從現有 Google Sheet 匯入 36 位會員完整資料

## Delivery Rescope

這個 change 最早是「整站總包」，但目前已有多個子 change 已獨立完成並封存：

- `2026-06-02-presentation-engine`
- `2026-06-02-member-module`
- 以及先前已封存的 auth / admin backend / member portal / guest portal / uiux alignment 相關 change

因此本 change 不再作為「所有功能從頭做到尾」的單一執行清單，而改成：

- `Phase A — 驗收必做`：仍會擋住整站功能驗收的核心能力
- `Phase B — 可延後但仍在主產品範圍內`：不影響本輪功能驗收的次要模組
- `Phase C — 進階或未來能力`：AI 深功能、全自動同步、PDF 匯出等

本 change 的主要目的改為：

1. 整理總包任務，避免與已封存子 change 重工
2. 只保留會阻擋本輪驗收的剩餘工作
3. 待 `Phase A` 完成後，再另外開新的 UI/UX 對齊 SR

## Non-Goals

- 不做金流/付款功能（會費收取走既有流程）
- 不做即時通訊/聊天功能（LINE 群組繼續使用）
- 不做會員間交易媒合（非商務平台）
- 不綁定 supastarter monorepo，獨立部署
- 不做多分會支援（Phase 1-4 專注華AI分會，多分會為未來擴展）

## Capabilities

### New Capabilities

- `member-auth`: 會員認證系統 — Gmail OAuth 登入、角色區分（`role`: admin/member，`position`: 9 個職掌值 + 無，`committee`: 8 個委員會值 + 無）、session 管理；具 position 的 8 個職掌 + 其組員 = admin role
- `member-profile`: 會員個人資料管理 — 基本資訊 CRUD（含 position/committee 欄位）、照片與產品圖上傳（S3/Supabase Storage）、專業介紹、三層引薦維護
- `weekly-brief`: 每週簡報填寫 — 會員每週填寫「本週我有/本週我要」、草稿自動儲存、截止時間提醒、填寫狀態追蹤；提交後觸發 bni-connect-sync job
- `presentation-engine`: 簡報自動產出引擎 — 將會員資料渲染成 HTML 簡報、支援多種頁面類型（首頁、會員卡、演講、來賓、表揚等）、簡報順序管理、線上發布與 PDF 匯出
- `keynote-talk`: 8 分鐘短講管理 — 演講排程（未來 6 週）、講者上傳簡報素材與產品圖、自動產出演講專屬頁面
- `guest-management`: 來賓管理 — 來賓名單 CRUD、引薦人對應、來賓自我介紹與心得、來賓出席紀錄
- `member-directory`: 前台會員通訊錄 — `/dashboard/directory` 卡片 grid 展示全體會員（頭像、姓名、專業、職掌/委員會 badge）；依姓名/職掌/委員會搜尋篩選；點入唯讀 profile modal（姓名、一分鐘介紹、理想客戶、服務或產品、三層引薦）；每張卡片有 [預約一對一] 按鈕；自己的卡片顯示 [查看我的資料]，點入只顯示 profile modal（無預約入口）
- `one-on-one`: 一對一預約系統 — 會員設定可用時段（`member_availability`：member_id、day_of_week 0–6、start_time、end_time、is_active）；從通訊錄 [預約一對一] 進入 → 比對雙方空閒時段 → 選時段 → 對方確認；紀錄追蹤與完成統計；即將進行的預約顯示 [開始視訊] 按鈕，內嵌 Jitsi Meet iframe（Phase 1：meet.jit.si，Phase 2：Vultr VPS 自架）
- `event-calendar`: 活動管理 — 活動行事曆、報名管理、出席追蹤
- `training-tracker`: 培訓追蹤 — 16 種 BNI 培訓課程管理、教育學分自動計算、會員完課狀態、培訓提醒
- `ai-assistant`: AI 助手模組 — 多 AI provider 支援（Claude / Gemini / OpenAI，可在設定中切換）、自動提醒未填寫會員、資料查詢（自然語言搜尋會員資料）、智能摘要（一對一紀錄摘要、週報摘要）、簡報內容建議
- `admin-dashboard`: 幹部管理後台 — 填寫進度 dashboard、會員管理、簡報管理與發布、一鍵提醒、系統設定（含 BNI Connect 帳密管理）
- `data-import`: 資料匯入 — 從 Google Sheet CSV 匯入會員資料、資料欄位對應、重複偵測、匯入紀錄；支援 36 位初始會員種子資料
- `bni-connect-sync`: BNI Connect 自動同步 — 每週簡報提交後，Playwright job（Vultr VPS，Phase 2 同 Jitsi）自動登入 bniconnectglobal.com，填入與本週簡報相同的引薦/成交/來賓數字並提交；管理員在後台設定 BNI Connect 帳密（加密儲存於 Supabase）；同步結果（成功/失敗）記錄於 sync_logs 表；Phase 1 為手動觸發按鈕，Phase 2 為每週自動排程

### Modified Capabilities

(none — 全新專案)

## Impact

- Affected specs: All capabilities are new — 14 new spec files (12 original + member-directory + bni-connect-sync)
- Affected code:
  - New: app/(auth)/ — 認證頁面與 OAuth 回呼
  - New: app/(member)/ — 會員前台頁面（個人資料、每週填表、一對一、培訓、通訊錄）
  - New: app/(admin)/ — 幹部後台頁面（dashboard、會員管理、簡報管理、設定、BNI Connect 帳密）
  - New: app/(presentation)/ — 簡報渲染公開頁面
  - New: app/api/ — API routes（會員、簡報、一對一、活動、AI、bni-connect 同步）
  - New: lib/ — 共用邏輯（Supabase client、AI provider adapter、簡報引擎）
  - New: lib/bni-connect-sync/ — Playwright 自動填表 job（server-only）
  - New: components/ — 共用 UI 元件
  - New: content/members/ — 會員靜態資料（初始匯入用）
  - New: content/presentations/ — 簡報模板
  - New: supabase/migrations/ — DB schema migrations
  - Modified: (none — 全新專案)
  - Removed: (none)
- DB tables: members（含 role/position/committee 欄位）、weekly_briefs、one_on_ones、member_availability、keynote_talks、guests、events、event_registrations、training_records、ai_conversations、sync_logs（BNI Connect 同步紀錄）
- Dependencies: next, @supabase/supabase-js, @supabase/ssr, tailwindcss, @anthropic-ai/sdk, openai, @google/generative-ai, playwright（server-only）
- Systems: Supabase (DB + Auth + Storage), Vercel (Deploy), Google OAuth, Vultr VPS (Phase 2: Jitsi + Playwright scheduler)
