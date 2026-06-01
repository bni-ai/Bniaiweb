## Why

BNI 華AI分會（36 位會員 + 幹部團隊）目前的例會運作依賴手動流程：會員資料散在 Google Sheet、簡報用 PPT 手動編輯、一對一預約靠 LINE 口頭約、培訓紀錄靠人腦記憶。每週幹部花大量時間「搬資料」「對資料」「催人填寫」。需要一個統一的 SaaS 平台，讓會員自助填寫、系統自動產出簡報、幹部一站管理所有分會事務。

## What Changes

- 建立獨立 SaaS 平台（Next.js + Supabase + Tailwind CSS + Vercel）
- 會員透過 Gmail 登入，自助管理個人資料、上傳照片與產品圖
- 每週會員填表後，系統自動產出 HTML 簡報（含首頁、會員簡報卡、8 分鐘演講、來賓介紹、領導團隊、表揚、副主席報告等頁面類型）
- 幹部後台可查看填寫進度、調整簡報順序、一鍵提醒未填會員、發布簡報到線上
- 8 分鐘短講管理：排程、上傳簡報素材、自動產出演講頁面
- 來賓管理：來賓名單、引薦人對應、來賓心得
- 一對一預約系統：會員互相約時間、追蹤紀錄
- 活動管理：活動行事曆、報名管理
- 培訓追蹤：16 種培訓課程、教育學分計算、完課狀態
- AI 助手模組：支援多 AI provider（Claude API / Gemini API / OpenAI API），可切換或並用，提供自動提醒、資料查詢、智能摘要、會員簡報內容建議
- 從現有 Google Sheet 匯入 36 位會員完整資料

## Non-Goals

- 不做金流/付款功能（會費收取走既有流程）
- 不做即時通訊/聊天功能（LINE 群組繼續使用）
- 不做會員間交易媒合（非商務平台）
- 不綁定 supastarter monorepo，獨立部署
- 不做多分會支援（Phase 1-4 專注華AI分會，多分會為未來擴展）

## Capabilities

### New Capabilities

- `member-auth`: 會員認證系統 — Gmail OAuth 登入、角色區分（會員/幹部/主席）、session 管理
- `member-profile`: 會員個人資料管理 — 基本資訊 CRUD、照片與產品圖上傳（S3/Supabase Storage）、專業介紹、三層引薦維護
- `weekly-brief`: 每週簡報填寫 — 會員每週填寫「本週我有/本週我要」、草稿自動儲存、截止時間提醒、填寫狀態追蹤
- `presentation-engine`: 簡報自動產出引擎 — 將會員資料渲染成 HTML 簡報、支援多種頁面類型（首頁、會員卡、演講、來賓、表揚等）、簡報順序管理、線上發布與 PDF 匯出
- `keynote-talk`: 8 分鐘短講管理 — 演講排程（未來 6 週）、講者上傳簡報素材與產品圖、自動產出演講專屬頁面
- `guest-management`: 來賓管理 — 來賓名單 CRUD、引薦人對應、來賓自我介紹與心得、來賓出席紀錄
- `one-on-one`: 一對一預約系統 — 會員互相發起一對一邀約、時段選擇、紀錄追蹤、一對一完成統計
- `event-calendar`: 活動管理 — 活動行事曆、報名管理、出席追蹤
- `training-tracker`: 培訓追蹤 — 16 種 BNI 培訓課程管理、教育學分自動計算、會員完課狀態、培訓提醒
- `ai-assistant`: AI 助手模組 — 多 AI provider 支援（Claude / Gemini / OpenAI，可在設定中切換）、自動提醒未填寫會員、資料查詢（自然語言搜尋會員資料）、智能摘要（一對一紀錄摘要、週報摘要）、簡報內容建議
- `admin-dashboard`: 幹部管理後台 — 填寫進度 dashboard、會員管理、簡報管理與發布、一鍵提醒、系統設定
- `data-import`: 資料匯入 — 從 Google Sheet CSV 匯入會員資料、資料欄位對應、重複偵測、匯入紀錄

### Modified Capabilities

(none — 全新專案)

## Impact

- Affected specs: All capabilities are new — 12 new spec files
- Affected code:
  - New: app/(auth)/ — 認證頁面與 OAuth 回呼
  - New: app/(member)/ — 會員前台頁面（個人資料、每週填表、一對一、培訓）
  - New: app/(admin)/ — 幹部後台頁面（dashboard、會員管理、簡報管理、設定）
  - New: app/(presentation)/ — 簡報渲染公開頁面
  - New: app/api/ — API routes（會員、簡報、一對一、活動、AI）
  - New: lib/ — 共用邏輯（Supabase client、AI provider adapter、簡報引擎）
  - New: components/ — 共用 UI 元件
  - New: content/members/ — 會員靜態資料（初始匯入用）
  - New: content/presentations/ — 簡報模板
  - New: supabase/migrations/ — DB schema migrations
  - Modified: (none — 全新專案)
  - Removed: (none)
- Dependencies: next, @supabase/supabase-js, @supabase/ssr, tailwindcss, @anthropic-ai/sdk, openai, @google/generative-ai
- Systems: Supabase (DB + Auth + Storage), Vercel (Deploy), Google OAuth
