## 1. 專案初始化與基礎架構

- [ ] 1.1 初始化 Next.js 15 App Router 專案，安裝 Supabase、Tailwind CSS、TypeScript 依賴。驗證：`npm run dev` 在 localhost:3000 顯示預設首頁。[Tool: Sonnet]
- [ ] 1.2 建立 Supabase 專案，設定 Google OAuth provider，取得 project URL 和 anon key。驗證：Supabase dashboard 顯示 Google provider 已啟用。[Tool: Sonnet]
- [ ] 1.3 建立 lib/supabase/client.ts (browser) 和 lib/supabase/server.ts (server) Supabase client 封裝。驗證：在 server component 中呼叫 `supabase.from('members').select()` 回傳空陣列不報錯。[Tool: Sonnet]

## 2. Database Schema（D1 — Database Schema）

- [ ] 2.1 建立 `members` table migration：包含 id (uuid), email (unique), member_number (integer, unique), chinese_name, english_name, line_name, specialty_title, specialty_description, general_referral, ideal_referral, dream_referral, photo_url, role (enum: 'admin'|'member'，幹部/主席 = admin), position (enum: '主席'|'副主席'|'秘書財務'|'資訊組長'|'成長協調'|'活動協調'|'導師協調'|'教育協調'|'來賓接待'|'無'，default '無'), committee (enum: '導師群'|'接待組員'|'教育組員'|'秘財組員'|'資訊組員'|'成長組員'|'活動組員'|'會員委員'|'無'，default '無'), auth_uid (uuid, nullable), created_at, updated_at。啟用 RLS：member 只能讀寫自己（auth.uid() = auth_uid），admin 可讀寫全部；SELECT 對所有登入會員開放（用於通訊錄）。驗證：`supabase db push` 成功，Supabase dashboard 顯示 table + RLS policies。[Tool: Sonnet]
- [ ] 2.2 建立 `weekly_briefs` table migration：id, member_id (FK), week_date (date), have_this_week (text), want_this_week (text), status (enum: draft/submitted), is_late (boolean default false), submitted_at (timestamp), created_at, updated_at。RLS：member 讀寫自己的 briefs，officer 讀寫全部。驗證：migration 成功，RLS 測試通過。[Tool: Sonnet]
- [ ] 2.3 建立 `presentations` table migration：id, week_date (date, unique), title, status (enum: draft/published), published_url, slide_order (jsonb), created_by (FK members), created_at, updated_at。RLS：officer 讀寫，public 可讀 published。驗證：migration 成功。[Tool: Sonnet]
- [ ] 2.4 建立 `keynote_talks` table migration：id, speaker_id (FK), week_date (date), topic, outline (text), slides_url, product_images (jsonb), created_at, updated_at。RLS：speaker 可寫自己的 talks，officer 讀寫全部。驗證：migration 成功。[Tool: Sonnet]
- [ ] 2.5 建立 `guests` table migration：id, name, specialty, referrer_id (FK members), week_date (date), self_intro (text), feedback (text), created_at。RLS：officer 讀寫。驗證：migration 成功。[Tool: Sonnet]
- [ ] 2.6 建立 `one_on_ones` table migration：id, inviter_id (FK), invitee_id (FK), scheduled_at (timestamp), status (enum: pending/confirmed/declined/completed), notes (text), completed_at (timestamp), created_at。RLS：參與者讀寫自己的 records，officer 讀全部。驗證：migration 成功。[Tool: Sonnet]
- [ ] 2.7 建立 `events` + `event_registrations` table migration。events：id, title, date, description, registration_deadline, max_participants, created_at。event_registrations：id, event_id (FK), member_id (FK), status (enum: registered/attended/absent), created_at。RLS：officer 管理 events，member 可報名。驗證：migration 成功。[Tool: Sonnet]
- [ ] 2.8 建立 `training_courses` + `training_records` table migration。training_courses：id, name, system_form_name, desktop_form_name, credits (integer), first_fee, repeat_fee, provider。training_records：id, member_id (FK), course_id (FK), completed_at, credits_earned (integer)。RLS：officer 管理，member 讀自己的 records。驗證：migration 成功。[Tool: Sonnet]
- [ ] 2.9 建立 `ai_settings` table migration：id, provider (enum: claude/gemini/openai), api_key_encrypted (text), model_name, is_active (boolean), created_at, updated_at。RLS：只有 role='admin' 且 position='主席' 可讀寫。驗證：migration 成功。[Tool: Sonnet]
- [ ] 2.10 建立 `member_availability` table migration：id (uuid), member_id (FK members.id, CASCADE DELETE), day_of_week (integer 0–6，0=週日), start_time (time), end_time (time), is_active (boolean default true), created_at, updated_at。UNIQUE(member_id, day_of_week, start_time)。RLS：member 讀寫自己的時段，admin 讀全部，其他 member 可 SELECT（用於比對空閒）。驗證：migration 成功，一個 member 能新增多筆不同 day_of_week 的時段。[Tool: Sonnet]
- [ ] 2.11 建立 `sync_logs` table migration：id (uuid), triggered_by (FK members.id), trigger_type (enum: 'manual'|'auto'), bni_connect_username (text), status (enum: 'pending'|'success'|'failed'), error_message (text nullable), brief_week_date (date), synced_at (timestamp nullable), created_at。RLS：admin 可讀全部，member 只能讀自己 triggered 的記錄。驗證：migration 成功。[Tool: Sonnet]
- [ ] 2.12 建立種子資料 migration：將 36 位完整會員資料（member_number 001–036，含 position/committee/role）insert 到 members table。資料來源：HANDOFF.md 組織架構表。驗證：`SELECT COUNT(*) FROM members` 回傳 36，主席吳文凱 position='主席' role='admin'。[Tool: Sonnet]

## 3. 認證系統（D2 — Authentication, Gmail OAuth Login, Role-Based Access Control, Session Management）

- [ ] 3.1 建立 `/login` 頁面，含 "Sign in with Google" 按鈕，觸發 Supabase Auth `signInWithOAuth({ provider: 'google' })`。驗證：點擊按鈕 → 跳轉 Google OAuth 同意頁面。[Tool: Sonnet]
- [ ] 3.2 建立 `/auth/callback` route handler，處理 OAuth 回調：查 `members` table 比對 email → 綁定 auth_uid → 根據 role 導向：role='admin' → `/admin`，role='member' → `/dashboard`。非會員 email 導向 `/not-member` 錯誤頁。驗證：已存在 admin email 登入 → 到 /admin；member email 登入 → 到 /dashboard；不存在 email → 到 /not-member。[Tool: Sonnet]
- [ ] 3.3 建立 middleware.ts 保護路由：未登入 → redirect /login；role='member' 存取 /admin/* → redirect /dashboard；role='admin' 可存取 /admin/*。驗證：未登入訪問 /dashboard → 跳轉 /login；role='member' 訪問 /admin → 跳轉 /dashboard。[Tool: Sonnet]

## 4. 會員資料管理（Member Profile Data Management, Photo Upload, Product Image Gallery, Profile Visibility）

- [ ] 4.1 建立 `/api/members` GET/POST/PATCH API routes，含 Supabase RLS 驗證。GET 支援 search query parameter 篩選 name/specialty。驗證：curl GET 回傳 member list JSON；curl PATCH 更新 specialty 成功。[Tool: Sonnet]
- [ ] 4.2 建立 `/dashboard/profile` 頁面：顯示 member 自己的資料卡片，含編輯表單（chinese_name、english_name、specialty_title、specialty_description、general/ideal/dream_referral）。驗證：登入後看到自己資料，修改後重整保持更新。[Tool: Sonnet]
- [ ] 4.3 建立照片上傳元件：上傳 JPEG/PNG（最大 5MB）到 Supabase Storage `members/{id}/photo`，更新 members.photo_url。含拖放、預覽、裁切。驗證：上傳照片後 profile 頁即時顯示新照片。[Tool: Sonnet]
- [ ] 4.4 建立產品圖上傳元件：最多 10 張，存 `members/{id}/products/`，gallery grid 展示。驗證：上傳 3 張產品圖，profile 頁顯示 3 張 grid。[Tool: Sonnet]
- [ ] 4.5 建立 `/members/[id]` 會員公開 profile 頁面：任何登入會員可瀏覽其他會員的完整 profile（唯讀）。驗證：member A 可看到 member B 的照片、專業、引薦需求。[Tool: Sonnet]

## 4b. 會員通訊錄（Member Directory, Card Grid, Search and Filter, Profile Modal, One-on-One Entry）

- [ ] 4b.1 建立 `/api/members/directory` GET API route：回傳所有 active members 的 id, member_number, chinese_name, specialty_title, position, committee, photo_url；支援 `q` (姓名/職掌/委員會模糊搜尋) 和 `position`/`committee` filter query params。驗證：GET /api/members/directory?position=主席 回傳 1 筆；GET /api/members/directory?q=文凱 回傳吳文凱。[Tool: Sonnet]
- [ ] 4b.2 建立 `/dashboard/directory` 通訊錄頁面：卡片 grid（head photo + member_number badge + chinese_name + specialty_title + position/committee badge）；頂部搜尋列 + position/committee 下拉篩選；自己（current user）的卡片顯示 [查看我的資料] 按鈕；其他會員卡片顯示 [預約一對一] 按鈕。驗證：登入後看到 36 張卡片；搜尋「副主席」→ 只顯示馬驊；自己的卡片只有 [查看我的資料]。[Tool: Sonnet]
- [ ] 4b.3 建立通訊錄 profile modal：點擊卡片或按鈕 → 顯示唯讀 profile（頭像、姓名、member_number、position/committee badge、一分鐘介紹 specialty_description、理想客戶 ideal_referral、服務或產品 general_referral、三層引薦 dream_referral）。自己的 modal 不顯示 [預約一對一] 按鈕；他人的 modal 顯示 [預約一對一] 按鈕 → 跳轉 `/dashboard/one-on-one/new?invitee_id={id}`。驗證：點吳文凱卡片 → modal 顯示其完整 profile；modal 底部有 [預約一對一] 按鈕（自己的 modal 無此按鈕）。[Tool: Sonnet]

## 5. 每週簡報填寫（Weekly Brief Submission Form, Draft Auto-Save, Submission Status Tracking, Deadline Enforcement）

- [ ] 5.1 建立 `/api/weekly-briefs` GET/POST/PATCH API routes。POST 建立新 brief，PATCH 更新 draft 或提交。驗證：POST 建立 draft → PATCH 改 status 為 submitted。[Tool: Sonnet]
- [ ] 5.2 建立 `/dashboard/weekly` 每週填寫頁面：兩個 textarea（本週我有、本週我要）+ 可收合的三層引薦區塊。30 秒自動儲存草稿。「送出」按鈕提交。驗證：填寫 → 關閉 → 重開 → 草稿內容還在；送出後狀態變 submitted。[Tool: Sonnet]
- [ ] 5.3 實作截止時間邏輯：從 system settings 讀取 deadline（預設 Friday 23:59），超時提交標記 is_late=true。驗證：deadline 後提交的 brief 在 admin 列表顯示「遲交」標籤。[Tool: Sonnet]
- [ ] 5.4 提交成功後觸發 BNI Connect sync：weekly brief status 由 draft → submitted 時，呼叫 `/api/bni-connect/trigger`（僅記錄 sync_log，實際 Playwright job 在 Task 16.x 實作）。驗證：提交 brief → sync_logs 表出現 status='pending' 記錄，brief_week_date 正確。[Tool: Sonnet]

## 6. 簡報引擎（D3 — Presentation Engine, Presentation Auto-Generation, Slide Type Components, Slide Order Management, Public Presentation URL, PDF Export）

- [ ] 6.1 建立 7 個 slide React 元件：CoverSlide、MemberCard、KeynoteSlide、GuestSlide、TeamSlide、AwardSlide、VPReportSlide。每個元件 1920x1080 canvas，BNI 品牌色（#CC0000 紅、#333 灰、#D4A84B 金），Noto Sans TC 字型。驗證：每個元件在 Storybook 或測試頁面正確渲染。[Tool: Sonnet]
- [ ] 6.2 建立 `/api/presentations` POST route：讀取該週所有 submitted briefs、keynote、guests → 組裝 slide_order JSONB → 存入 presentations table。驗證：呼叫 API 後 presentations table 有新記錄，slide_order 包含所有會員卡。[Tool: Sonnet]
- [ ] 6.3 建立 `/presentation/[week-date]` 公開頁面：讀取 slide_order → 依序渲染對應元件。含鍵盤導航（左右鍵）、全螢幕按鈕、觸控滑動、進度條。驗證：訪問 URL（無登入）→ 顯示完整簡報 → 左右鍵切頁正常。[Tool: Sonnet]
- [ ] 6.4 建立 slide 拖放排序功能：admin 頁面中拖放 slides → 更新 slide_order JSONB。驗證：拖放第 5 張到第 3 位 → 重整後順序保持。[Tool: Sonnet]
- [ ] 6.5 實作 PDF 匯出：用 puppeteer 或 html2pdf 將簡報各頁渲染為 PDF。驗證：點擊「匯出 PDF」→ 下載 PDF 檔案，每頁一張 slide。[Tool: Sonnet]

## 7. 幹部管理後台（Admin Dashboard, Weekly Submission Progress Dashboard, Member Management, Presentation Management, Bulk Reminder, System Settings）

- [ ] 7.1 建立 `/admin` dashboard 頁面：4 格統計卡（總會員、已填、未填、填寫率）+ 填寫進度表格（編號/姓名/專業/狀態/最後更新）。驗證：登入 officer → 看到正確統計數字和表格。[Tool: Sonnet]
- [ ] 7.2 建立 `/admin/members` 會員管理頁面：會員列表含搜尋篩選、新增/編輯/停用功能。驗證：搜尋「AI」→ 只顯示 specialty 含 AI 的會員。[Tool: Sonnet]
- [ ] 7.3 建立 `/admin/presentations` 簡報管理頁面：產出/預覽/發布/取消發布功能。驗證：點「產出」→ 點「發布」→ public URL 可存取。[Tool: Sonnet]
- [ ] 7.4 實作一鍵提醒功能：查所有未提交會員 → 產出提醒訊息列表 → 一鍵發送（Phase 1 先做 email notification，未來接 LINE）。驗證：點「一鍵提醒」→ 未填 7 人各收到提醒。[Tool: Sonnet]
- [ ] 7.5 建立 `/admin/settings` 系統設定頁面：submission deadline、reminder time、chapter info、AI provider 設定、BNI Connect 帳密設定（帳號 + 密碼，密碼以 AES-256 加密存 Supabase admin_settings table，只有 role='admin' 且 position='主席' 可讀寫）。驗證：改 deadline → 新 deadline 在填寫頁面顯示正確；儲存 BNI Connect 帳密 → 讀回顯示帳號（密碼顯示 ****）。[Tool: Sonnet]

## 8. 8 分鐘短講管理（Keynote Talk Scheduling, Talk Material Upload, Keynote Slide Auto-Generation）

- [ ] 8.1 建立 `/api/keynotes` CRUD API routes + `/admin/keynotes` 排程管理頁面：顯示未來 6 週排程表，officer 指定講者。驗證：指定 member #007 為下週講者 → 排程表更新。[Tool: Sonnet]
- [ ] 8.2 建立 `/dashboard/keynote` 講者素材上傳頁面：topic、outline textarea、產品圖上傳（最多 5 張）。驗證：講者填寫 topic + 上傳 3 張圖 → 資料存入 keynote_talks。[Tool: Sonnet]
- [ ] 8.3 將 KeynoteSlide 元件整合到簡報引擎：有 keynote 資料的週 → 自動包含 KeynoteSlide。驗證：產出簡報 → 包含講者大頭照 + topic + outline + 產品圖 gallery。[Tool: Sonnet]

## 9. 來賓管理（Guest Registration, Guest Self-Introduction and Feedback, Guest Slide Auto-Generation）

- [ ] 9.1 建立 `/api/guests` CRUD API routes + `/admin/guests` 管理頁面：新增來賓（姓名/專業/引薦人）、編輯 self_intro 和 feedback。驗證：新增來賓「陳駿翰」引薦人 #026 → 列表顯示。[Tool: Sonnet]
- [ ] 9.2 將 GuestSlide 元件整合到簡報引擎：有來賓的週 → 自動包含 GuestSlide。驗證：產出簡報 → 包含 3 張 GuestSlide。[Tool: Sonnet]

## 10. 一對一預約系統（One-on-One Invitation, Invitation Response Flow, Completion Tracking, One-on-One Statistics）

- [ ] 10.1 建立 `/api/one-on-ones` CRUD API routes + `/dashboard/one-on-one` 頁面：發起邀約（選對象 + 日期時間）、待確認/已確認/已完成列表。驗證：member A 邀 member B → B 看到 pending 邀約 → B 接受 → 狀態變 confirmed。[Tool: Sonnet]
- [ ] 10.2 實作完成紀錄與筆記：confirmed 的 one-on-one → 任一方可標記 completed + 填 notes。驗證：標記完成 + 填筆記 → dashboard 顯示 completed。[Tool: Sonnet]
- [ ] 10.3 建立一對一統計元件：本週 / 本月 / 累計次數 + 半年目標 52 次進度條。驗證：完成 10 次 → 進度條顯示 10/52 (19%)。[Tool: Sonnet]
- [ ] 10.4 建立 `/dashboard/availability` 可用時段設定頁面：週曆 grid UI，每格代表一個 day_of_week + start_time 組合；click toggle 開/關；PATCH /api/availability 批次儲存。驗證：設定週三 10:00-11:00 → 重整後勾選狀態保持；API 回傳 member_availability 資料。[Tool: Sonnet]
- [ ] 10.5 建立 Jitsi Meet 視訊入口：`/dashboard/one-on-one/[id]/video` 頁面；confirmed 且 scheduled_at 在 ±30 分鐘內的 one-on-one 顯示 [開始視訊] 按鈕；點擊跳轉視訊頁面，內嵌 `<iframe src="https://meet.jit.si/bni-hua-{one_on_one_id}">` 全螢幕。房間名稱固定為 `bni-hua-{uuid 前 8 碼}` 確保兩人進同一房間。驗證：雙方分別點 [開始視訊] → 進入同一 Jitsi 房間。[Tool: Sonnet]

## 11. 活動管理（Event Management, Event Registration, Attendance Tracking）

- [ ] 11.1 建立 `/api/events` CRUD + registration API routes + `/admin/events` 管理頁面 + `/dashboard/events` 會員活動列表。驗證：officer 建活動 → member 報名 → 額滿顯示「已額滿」。[Tool: Sonnet]
- [ ] 11.2 實作出席追蹤：officer 可批次勾選出席者。驗證：勾 30/50 出席 → 出席率顯示 60%。[Tool: Sonnet]

## 12. 培訓追蹤（Training Course Catalog, Training Completion Records, Education Credit Calculation, Training Status Overview）

- [ ] 12.1 建立 `/api/training` CRUD API routes + `/admin/training` 管理頁面：16 課程目錄 + 記錄會員完課。驗證：記錄 member #003 完成 MSP培訓 → 顯示 +2 學分。[Tool: Sonnet]
- [ ] 12.2 建立 `/dashboard/training` 個人培訓 dashboard：已完成課程列表 + 總學分 + 推薦下一課程。驗證：member 看到自己的學分總計和課程列表。[Tool: Sonnet]
- [ ] 12.3 建立 `/admin/training/overview` 全分會培訓總覽：所有會員學分表格（可排序）。驗證：排序 → 學分最高的排最前。[Tool: Sonnet]

## 13. AI 助手（D4 — AI Integration, Multi-Provider AI Support, Provider Switching, Natural Language Member Query, Automated Submission Reminders）

- [ ] 13.1 建立 `lib/ai/adapter.ts` AIProviderAdapter interface + ClaudeAdapter + GeminiAdapter + OpenAIAdapter 三個實作。從 ai_settings 讀取 active provider。失敗自動 fallback 到下一個 enabled provider。驗證：unit test 覆蓋三個 adapter 的 chat() 呼叫 + fallback 邏輯。[Tool: Sonnet]
- [ ] 13.2 建立 `/api/ai` POST route + `/dashboard/ai` 聊天介面：用戶輸入自然語言 → 系統附帶 member profiles context → AI 回答。驗證：問「誰的專業是 AI落地」→ 回傳吳文凱。[Tool: Sonnet]
- [ ] 13.3 實作自動提醒生成：cron 或 API trigger → 查未提交會員 → AI 產出個人化提醒訊息。驗證：觸發提醒 → 7 位未填會員各有一則提醒訊息產出。[Tool: Sonnet]
- [ ] 13.4 建立 `/admin/settings/ai` AI provider 管理頁面：新增/編輯 provider 設定（API key 加密存儲）、切換 active provider。驗證：切換 provider → 下一次 AI 查詢使用新 provider。[Tool: Sonnet]

## 14. 資料匯入（CSV Upload and Parse, Column Mapping, Row-Level Validation, Duplicate Detection, Import Confirmation and Commit）

- [ ] 14.1 建立 `/admin/import` 頁面：CSV 上傳 → 解析 → 欄位對應（自動偵測「編號」→ member_number 等）→ 逐行驗證（必填檢查、格式檢查）→ 重複偵測（email/member_number）→ 預覽確認 → atomic commit。驗證：上傳 36 行 CSV → 預覽顯示 36 筆 → 確認匯入 → members table 有 36 筆。[Tool: Sonnet]

## 15. 部署與驗收

- [ ] 15.1 設定 Vercel 專案連結 GitHub repo `bni-ai/Bniaiweb`，設定環境變數（SUPABASE_URL、SUPABASE_ANON_KEY、GOOGLE_CLIENT_ID 等）。驗證：push 到 main → Vercel 自動部署 → production URL 可存取。[Tool: Sonnet]
- [ ] 15.2 端到端驗收：(1) 匯入 CSV → 36 會員建立；(2) member 登入 → 填寫 weekly brief → submit；(3) officer 登入 → dashboard 顯示填寫進度 → 產出簡報 → 發布；(4) 公開 URL 可瀏覽完整簡報；(5) member 在通訊錄點 [預約一對一] → 預約流程完成 → 雙方可進入 Jitsi 視訊。驗證：以上 5 步全部成功完成。[Tool: Sonnet]

## 16. BNI Connect 自動同步（BNI Connect Playwright Auto-Fill, Encrypted Credential Storage, Sync Log, Manual Trigger）

- [ ] 16.1 建立 `admin_settings` table migration：id (uuid), key (text unique), value_encrypted (text), updated_by (FK members.id), updated_at。儲存 bni_connect_username、bni_connect_password_enc。RLS：只有 role='admin' 且 position='主席' 可讀寫。驗證：migration 成功，INSERT bni_connect_username → SELECT 回傳正確。[Tool: Sonnet]
- [ ] 16.2 建立 `lib/bni-connect-sync/playwright-job.ts`（server-only）：接收 { username, passwordEnc, weeklyBriefData } 參數；用 Playwright headless chromium 登入 bniconnectglobal.com → 填寫 have/want 欄位數字 → 提交；捕捉成功/失敗 → 回傳 { success: boolean, errorMessage?: string }。含 5 秒 timeout 和 navigation wait。驗證：unit test mock Playwright browser，測試填表成功路徑和登入失敗（帳密錯誤）路徑。[Tool: Sonnet]
- [ ] 16.3 建立 `/api/bni-connect/trigger` POST route（admin-only）：讀取 admin_settings 帳密 → 呼叫 playwright-job → 更新 sync_logs 記錄 status = 'success'/'failed'。手動觸發端點，同時用於 Phase 1 前台按鈕和 Phase 2 排程。驗證：curl POST 回傳 { success: true }；sync_logs 記錄更新。[Tool: Sonnet]
- [ ] 16.4 建立 `/admin/bni-connect` 同步管理頁面：顯示最近 10 筆 sync_logs（週期、狀態、時間、觸發人）；[立即同步] 按鈕呼叫 trigger API；狀態 badge（pending 黃、success 綠、failed 紅）。驗證：點 [立即同步] → 顯示 loading → 回傳結果後 sync_logs 表格更新。[Tool: Sonnet]
