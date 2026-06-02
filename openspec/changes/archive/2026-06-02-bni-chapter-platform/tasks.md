## 0. 去重後的基線

- [x] 0.0 對應設計決策 `D1 — Database Schema: Normalized, Module-Aligned Tables`、`D2 — Authentication: Supabase Auth + Google OAuth`、`D3 — Presentation Engine: Server Components + Component-Per-Slide-Type`、`D4 — AI Integration: Strategy Pattern with Multi-Provider Adapter`、`D5 — File Storage: Supabase Storage with Path Convention`、`D6 — Phased Delivery Strategy`、`D7 — Change De-duplication And Acceptance Boundary`；驗證：本 tasks 已將已完成能力、Phase A 必做與後續 Phase B/C 明確對齊設計邊界。
- [x] 0.1 將已由封存 change 完成的能力自本 change 的主執行範圍中移除：auth base、guest boundary、member-module、presentation-engine；驗證：`design.md` 的 D7 已明確列出 active scope 與 out-of-scope modules。
- [x] 0.2 將本 change 改成「驗收必做 / 可延後 / 未來能力」三層執行模型，避免 73 項總包任務造成重工；驗證：`proposal.md` 已新增 Delivery Rescope 說明。

## 1. 已完成能力對齊（不重做，但保留規格對應）

### 1A. 認證與權限

- [x] 1.1 完成 `Gmail OAuth Login`、`Role-Based Access Control`、`Session Management`；驗證：`/login`、`/auth/callback`、`middleware.ts` 與 auth E2E 全數通過。

### 1B. 會員資料與週報

- [x] 1.2 完成 `Profile Data Management`、`一對一表單 — 公司資訊`；驗證：member profile CRUD 與 self-service protection 測試通過。
- [x] 1.3 完成 `Photo Upload`、`Product Image Gallery`、`Profile Visibility` 的基礎骨架已建好但正式媒體上傳流程留待 Phase A；驗證：現有 profile data 與欄位顯示已可用，正式 upload 收尾見 2.9。
- [x] 1.4 完成 `一對一表單 — GAINS 收穫工作表`、`一對一表單 — 前十名客戶表`、`一對一表單 — 業務人脈圈規劃表`；驗證：GAINS、top clients、contacts circle 測試與 E2E 通過。
- [x] 1.5 完成 `Weekly Brief Submission Form`、`Draft Auto-Save`、`Submission Status Tracking`；驗證：member report / weekly brief submit flow、草稿儲存與 admin submission 更新測試通過。
- [x] 1.6 完成 `Member Directory Card Grid`、`Self-Card Distinction`；驗證：`/dashboard/directory` 既有 E2E 通過，深互動收尾見 3.1。
- [x] 1.7 完成 `One-on-One Invitation`、`Invitation Response Flow`、`Completion Tracking`、`One-on-One Statistics`；驗證：one-on-one availability / booking / confirm / complete / dashboard 統計測試與 E2E 通過。

### 1C. 管理後台與簡報

- [x] 1.8 完成 `Weekly Submission Progress Dashboard`、`Member Management`、`Presentation Management`；驗證：admin dashboard、members、presentation management 現有測試與 E2E 通過。
- [x] 1.9 完成 `Presentation Auto-Generation`、`Slide Type Components`、`Slide Order Management`、`Public Presentation URL`、`Data-Driven Slide Editing`；驗證：`2026-06-02-presentation-engine` 已封存，viewer / builder / alias 測試通過。
- [x] 1.10 完成 `Award and VP Report Slides`、`Guest Slide - New vs Returning Guest`、`Guest Scheduling (This Week / Next Week)`、`Guest History`、`Guest Registration`、`Guest Self-Introduction and Feedback`、`Guest Slide Auto-Generation`；驗證：presentation engine 與 guest/admin 測試通過。
- [x] 1.11 完成 `Keynote Talk Scheduling`、`Talk Material Upload`、`Keynote Slide Auto-Generation` 的基礎版；驗證：admin keynote flow 已可用，正式媒體 upload 收尾見 2.9。

## 2. Phase A — 驗收必做

### 2A. 匯入與設定

- [x] 2.1 完成 `CSV Upload and Parse`、`Column Mapping`；驗證：`/admin/import` 可上傳 CSV、辨識欄位並進入預覽，Playwright `admin can preview and commit member csv import` 已覆蓋 parse/preview 入口。
- [x] 2.2 完成 `Row-Level Validation`、`Duplicate Detection`、`Import Confirmation and Commit`；驗證：錯誤列會阻擋 commit、重複資料可選 skip/overwrite/merge、確認後成功建立/更新會員資料，Playwright 匯入流程與 `commit_member_import` migration 已通過。
- [x] 2.3 完成 `System Settings`、`Deadline Enforcement`；驗證：`/admin/settings` 可保存 chapter info、submission deadline、reminder time、AI provider baseline、BNI Connect credential baseline，且 deadline 會將 member brief 標記為 late，Playwright `admin settings drive late briefs...` 已通過。
- [x] 2.4 完成 `Bulk Reminder`；驗證：admin 可對未提交會員觸發 reminder，並產生 `reminder_logs` 紀錄，Playwright `admin settings drive late briefs...` 已通過。
- [x] 2.5 完成 `BNI Connect Credential Storage`、`Manual Sync Trigger`；驗證：管理員可保存同步憑證，weekly brief 提交後會建立 pending `sync_logs`，且可手動觸發 baseline sync success，Playwright `admin settings drive late briefs...` 已通過。

### 2B. 活動、培訓、AI

- [x] 2.6 完成 `Event Management`、`Event Registration`、`Attendance Tracking`；驗證：admin 建活動、member 報名、出席狀態正確更新，Playwright `admin creates an event and member can register` 已通過。
- [x] 2.7 完成 `Training Course Catalog`、`Training Completion Records`、`Education Credit Calculation`、`Training Status Overview`；驗證：admin 可建立 training course、補登完課紀錄，會員 `/dashboard/training` 與 admin `/admin/training` 學分統計同步更新，Playwright `admin creates training course and completion updates member credits` 已通過。
- [x] 2.8 完成 `Multi-Provider AI Support`、`Provider Switching`、`Natural Language Member Query`、`Automated Submission Reminders` 的 baseline；驗證：`/dashboard/ai` 會顯示 active provider、切換 provider 後下一筆查詢立即生效，member lookup 以自然語言查詢會員資料，且 reminder preview 直接串接 2.4 的未提交名單，Playwright `ai baseline uses active provider and answers member query` 已通過。

### 2C. 媒體與視訊收尾

- [x] 2.9 完成 `Photo Upload`、`Product Image Gallery`、`Talk Material Upload` 的正式媒體上傳流程；驗證：會員可上傳頭像與產品圖、管理端短講可上傳素材到 Supabase Storage，資料列與頁面顯示同步更新，Playwright `member profile media and keynote materials upload flow works` 已通過。
- [x] 2.10 完成一對一視訊入口頁收尾；驗證：`/dashboard/one-on-one/[id]/video` 僅允許 confirmed 且在時間窗口內的預約進入同一 Jitsi 房間，Playwright `confirmed one-on-one can enter video page within allowed window` 已通過。

## 3. Phase B — 可延後但屬主產品範圍

- [ ] 3.1 補完 `Member Directory Card Grid`、`Self-Card Distinction` 的深互動版：profile modal、member_number / badge / richer readonly profile；驗證：directory E2E 可從卡片開 modal 並分辨 self vs other actions。
- [ ] 3.2 補完 `Keynote Talk Scheduling`、`Talk Material Upload` 的完整分工與講者自助流程；驗證：指定未來週講者後可由講者補資料並反映到 presentation builder。
- [ ] 3.3 補完 `Guest Slide - New vs Returning Guest`、`Guest Scheduling (This Week / Next Week)`、`Guest History` 的管理 UI；驗證：同來賓第二次邀請顯示回訪標記與歷史紀錄。
- [ ] 3.4 補完 `Playwright Auto-Fill Job`；驗證：BNI Connect 可在受控環境跑自動填表 smoke test。

## 4. Phase C — 進階與未來能力

- [ ] 4.1 PDF export。
- [ ] 4.2 presentation drag-and-drop editor with source-form editing。
- [ ] 4.3 AI multi-provider fallback / advanced automation。
- [ ] 4.4 BNI Connect Playwright full automation + schedule。
- [ ] 4.5 richer public/member profile media experience。

## 5. 驗收關卡

- [x] 5.1 `npm run test`、`npm run build`、`npm run test:e2e` 全綠；且新增的 Phase A flows 都有對應 automated coverage。驗證：`vitest 45/45`、`next build` 成功、`playwright 30/30` 成功。
- [x] 5.2 完成 production-like walkthrough：admin 登入 → 匯入/設定/看 submission → 產出並發布簡報；member 登入 → 填 brief → 看 events/training/AI baseline → 預約一對一並進入 video；驗證：雖分成 30 個 Playwright scenario 執行，但已在同一 production build 上覆蓋完整 admin/member walkthrough，無阻斷 bug。
- [x] 5.3 僅在 5.1 與 5.2 完成後，才允許另外開新的 UI/UX 對齊 SR；驗證：本 change 完成後才新增後續 UI/UX SR。
