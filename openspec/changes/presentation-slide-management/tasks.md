## 1. 類型與 Schema 擴充（Decision: Slide CRUD 在現有 `slide_order` 架構上擴充，不另開資料表）

- [ ] 1.1 擴充 `SlideEntry` 聯合類型，新增 `{ type: "custom"; id: string; visible: boolean; editor?: SlideEditorPatch }`，支援 "Admin can add a blank slide" 與 "Admin can duplicate a slide" 所需的 custom slide 類型；驗證：`lib/presentation/types.ts` 編譯通過，且 TypeScript 對 `custom` 類型的 discriminated union 推導正確
- [ ] 1.2 擴充 `SlideEditorPatch`，新增 `dataOverride?: Record<string, string | null>` 欄位，落實 "Editor patch acts as layout override only" 的欄位級覆寫能力；驗證：`lib/presentation/types.ts` 編譯通過，現有 editor patch 寫入不受影響
- [ ] 1.3 更新 `parseSlideOrder` 驗證器，識別 `type: "custom"` 並要求 `id` 與 `visible` 欄位，落實 "Decision: Slide CRUD 在現有 `slide_order` 架構上擴充，不另開資料表" 的 schema 契約；驗證：`lib/presentation/slide-order.ts` 的單元測試覆蓋 custom type 的 parse / invalid 路徑

## 2. Slide CRUD 後端 Actions

- [ ] 2.1 實作 `duplicateSlideAction(formData)`，落實 "Admin can duplicate a slide"：接收 presentation id 與 slide index，深拷貝指定 slide entry（固定頁複製後轉為 custom type），產生新 id，append 到 slide_order，並確保 "Canvas editor preserves editor patches across CRUD operations"；驗證：integration test 覆蓋複製後 slide_order 長度 +1、新 entry 有獨立 id、editor patch 保留
- [ ] 2.2 實作 `addBlankSlideAction(formData)`，落實 "Admin can add a blank slide"：接收 presentation id，append `{ type: "custom", id: "<uuid>", visible: true, editor: { textLayers: [defaultLayer] } }`；驗證：integration test 覆蓋新增後 slide_order 包含 custom type、editor 有預設文字框
- [ ] 2.3 實作 `deleteSlideAction(formData)`，落實 "Admin can delete a slide"：接收 presentation id 與 slide index，拒絕刪除固定頁（cover/agenda/team/closing），拒絕刪除唯一 slide；驗證：integration test 覆蓋成功刪除、固定頁拒絕、唯一 slide 拒絕三種路徑
- [ ] 2.4 實作 `deletePresentationAction(formData)`，落實 "Admin can delete an entire presentation"：接收 presentation id，刪除 presentations 紀錄與 storage 中 `presentations/{id}/` 前綴的資產；驗證：integration test 覆蓋紀錄刪除與 storage 清理

## 3. Slide CRUD 前端整合（Canvas editor supports slide-level CRUD controls）

- [ ] 3.1 在 `components/presentation/canvas-editor.tsx` 的 slide navigator 每張縮圖加上「複製」按鈕，落實 "Canvas editor supports slide-level CRUD controls" 與 "Admin can duplicate a slide"，點擊後呼叫 `duplicateSlideAction` 並重新載入頁面；驗證：Playwright `presentation editor can duplicate a slide` 通過，複製後列表長度 +1
- [ ] 3.2 在 slide navigator 底部加上「新增空白頁」按鈕，落實 "Canvas editor supports slide-level CRUD controls" 與 "Admin can add a blank slide"，點擊後呼叫 `addBlankSlideAction`；驗證：Playwright `presentation editor can add a blank slide` 通過，新 slide 為 custom type 且含預設文字框
- [ ] 3.3 在 slide navigator 每張縮圖加上「刪除」按鈕，落實 "Canvas editor supports slide-level CRUD controls"、"Canvas editor distinguishes fixed vs deletable slides" 與 "Admin can delete a slide"，固定頁 disabled 並顯示 tooltip「固定頁面無法刪除」；驗證：Playwright `presentation editor cannot delete fixed slides` 通過，且 `presentation editor can delete a slide` 通過
- [ ] 3.4 在 `app/(admin)/admin/presentation/page.tsx` 的簡報卡片加上「刪除」按鈕與確認對話框，落實 "Admin can delete an entire presentation"；驗證：Playwright `admin can delete a presentation` 通過，刪除後列表不再顯示該簡報

## 4. 資料與排版分離（Decision: 資料層即時讀取，排版層保留在 `slide_order`）

- [ ] 4.1 修改 `lib/presentation/runtime.ts` 的 `resolveRuntimeSlide`，對 `type: "member"` 的 slide 在渲染時即時查詢 `members` + `weekly_briefs` 表取得最新資料，落實 "Data-driven slides render with live database data" 與 "Editor patch acts as layout override only"；驗證：單元測試覆蓋 `resolveRuntimeSlide` 對 member slide 即時查詢正確欄位，且 editor patch 中的 title/body 覆寫優先於資料庫值
- [ ] 4.2 擴充 `resolveRuntimeSlide`，對 `type: "keynote"` / `"guest"` / `"award"` / `"vp_report"` 即時查詢對應資料表，落實 "Data-driven slides render with live database data"；驗證：單元測試覆蓋四種 type 的即時查詢與 fallback
- [ ] 4.3 實作 editor patch merge 邏輯，落實 "Editor patch acts as layout override only"：非 null 的 editor 欄位為覆寫，null 為「使用資料庫值」，undefined 為「未設定」；驗證：單元測試覆蓋三種狀態的 merge 結果
- [ ] 4.4 實作資料缺失 fallback，落實 "Data source missing fallback"：當資料來源不存在時，顯示「資料暫時無法取得」placeholder；驗證：單元測試覆蓋 member 被刪除後的 placeholder 渲染，viewer 不白屏

## 5. Viewer 與 Present Mode 更新（Slide viewer）

- [ ] [P] 5.1 更新 `app/presentation/[week-date]/page.tsx`，確保公開 viewer 使用新的 `resolveRuntimeSlide` 渲染，落實 "Slide viewer" 與 "Data-driven slides render with live database data"；驗證：Playwright `presentation viewer shows updated member data after profile change` 通過——會員更新資料後重新整理 viewer 顯示新內容
- [ ] [P] 5.2 更新 `app/presentation/[week-date]/present/page.tsx`，確保 present mode 同樣使用即時資料渲染，落實 "Slide viewer"；驗證：手動測試 present mode 顯示內容與公開 viewer 一致

## 6. 發布流程強化（Presentation publishing）

- [ ] 6.1 在 `publishPresentationAction` 中加入 `slide_order` schema 驗證（呼叫 `parseSlideOrder`），驗證失敗則阻止發布並回傳詳細錯誤，落實 "Presentation publishing" 中 invalid layout 阻止發布的要求；驗證：integration test 覆蓋 invalid slide_order publish 被拒絕，錯誤訊息包含具體欄位名稱
- [ ] 6.2 在 `publishPresentationAction` 中檢查 slide count ≥ 1，否則阻止發布，落實 "Presentation publishing"；驗證：integration test 覆蓋空 slide_order publish 被拒絕

## 7. 會員個人檔案排版（Decision: 會員個人檔案排版採用卡片式、資訊層級化設計）

- [ ] [P] 7.1 建立 `components/member/profile-card.tsx`，實作卡片式個人檔案布局，落實 "Member profile page uses card-based layout"：左側大頭貼、右側基本資訊，參考 `ui-mockup-member.html` 的 `.profile-layout` 與 `.avatar-section`；驗證：截圖比對，確認資訊層級與 mockup 一致
- [ ] [P] 7.2 在個人檔案頁加入「專業別與引薦來源」區塊，落實 "Profile page displays referral tiers"，使用 `.referral-tier` 卡片式呈現；驗證：截圖比對，確認 tier 標籤、標題、描述正確顯示
- [ ] [P] 7.3 在個人檔案頁加入「GAINS Profile」區塊，落實 "Profile page displays GAINS profile"，使用 2-column grid 顯示 Goals / Accomplishments / Interests / Networks / Skills；驗證：截圖比對，確認五個欄位都有標籤與內容
- [ ] [P] 7.4 在個人檔案頁頂部加入「本週簡報」卡片，落實 "Profile page displays weekly brief"，顯示 have_this_week 與 want_this_week；驗證：截圖比對，確認 brief 內容以 highlight 卡片呈現
- [ ] 7.5 統一個人檔案頁與 member slide 的字級、色票、間距 token，落實 "Profile and presentation share visual language" 與 "Decision: 參考 `open-slide` 的 Design System 概念統一簡報視覺語言"；驗證：視覺比對，確認兩者 name display 字級相同、specialty label 顏色相同、avatar 尺寸相同

## 8. 測試與驗收（Acceptance Criteria、Failure Modes、Scope Boundaries）

- [ ] 8.1 補齊 E2E 測試矩陣，覆蓋 "Admin can duplicate a slide"、"Admin can add a blank slide"、"Admin can delete a slide"、"Admin can delete an entire presentation"、"Slide viewer" 與 "Data-driven slides render with live database data"；驗證：`E2E_BASE_URL=http://localhost:4010 npx playwright test --grep "presentation"` 全通過，達成 Acceptance Criteria 中定義的 observable behavior
- [ ] 8.2 補齊 `lib/presentation/runtime.ts` 與 `lib/presentation/slide-order.ts` 的單元測試，覆蓋 "Editor patch acts as layout override only" 與 "Data source missing fallback"，驗證 Failure Modes 中定義的資料缺失 fallback 與 invalid layout 處理；驗證：`npm test -- --grep "presentation"` 全通過
- [ ] 8.3 執行視覺 QA：桌機截圖比對 `/admin/presentations/[id]`、 `/presentation/[week-date]`、會員個人檔案頁，確認 "Slide viewer" 文字不消失、底圖正常、風格對齊；驗證：手動截圖存證。Scope Boundaries 檢查：確認未擴散到非簡報模組（來賓 portal、全站 IA 等不在範圍內）
- [ ] 8.4 驗證 Interface / Data Shape 契約：確認 `SlideEntry` 已擴充 custom type、`SlideEditorPatch` 已新增 dataOverride、`resolveRuntimeSlide` 簽名未變更；驗證：TypeScript 編譯全通過，無型別錯誤
