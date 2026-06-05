## 1. 屬性面板溢出息皮

- [x] 1.1 收斂 inspector 欄的桌機最小寬度與欄位比例，落實 "Property panel inputs must not overflow container"；驗證：source contract + Playwright desktop layout smoke 已覆蓋
- [x] 1.2 收斂屬性面板輸入框 padding、grid gap 與 sticky/scroll 行為，確保 2-column grid 在桌機版穩定可用；驗證：source contract + Playwright desktop/mobile smoke 已覆蓋

## 2. 重複用戶資訊清理

- [x] 2.1 在簡報工作台 `app/(admin)/admin/presentations/[id]/page.tsx` 與簡報管理 `app/(admin)/admin/presentation/page.tsx` 隱藏頂部導航列的冗餘用戶資訊區塊，落實 "Duplicate user info must not appear on presentation pages"；驗證：source contract + shared shell 路由條件已覆蓋

## 3. 搜尋框功能修復

- [x] 3.1 把頂部導航列搜尋區改成可提交的表單，輸入關鍵字後導向對應 admin 頁面或搜尋結果頁，落實 "Search box must be functional"；驗證：`lib/topbar-search.test.ts` + build route `/admin/search`

## 4. 驗收測試

- [ ] 4.1 執行完整手動測試矩陣：屬性面板不溢出、無重複用戶資訊、搜尋框可用；驗證：逐項截圖存證

## 5. 桌面版工作區擴寬

- [x] 5.1 落實 `Desktop presentation editor uses a workspace-first layout`，讓 `/admin/presentations/[id]` 以 editor workbench 專用桌面寬度策略分配空間；驗證：Playwright `admin presentation workbench desktop layout workspace expansion`
- [x] 5.2 落實 `Desktop editor keeps navigator, canvas, and inspector simultaneously usable`，重配 slide navigator、canvas、property inspector 三欄比例與最小可用寬度；驗證：Playwright `admin presentation workbench edits content and published viewer reflects changes`
- [x] 5.3 收斂右欄欄位排版、內部滾動與大螢幕空間分配，避免欄位被窄框切割，並保留 tablet/mobile 的收斂邏輯；驗證：Playwright `admin presentation workbench mobile and tablet layout responsiveness`
