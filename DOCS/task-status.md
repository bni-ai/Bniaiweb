# BNI AI 平台 — 任務狀態總覽
更新：2026-06-04

## 摘要

目前有 5 個 Spectra changes，1 個已封存完成。剩餘 4 個均有未完成任務：安全性補強（全未開始，最高優先）、畫布功能有 3 個 task 待做、三入口分離全部待做、UI 小錯全部待做。最緊急是安全漏洞修補（admin server actions 無 session 驗證即可寫入 DB）。

---

## 優先級排序

### 🔴 高優先（影響安全或核心功能）

**platform-code-review-hardening**（安全性補強）
- `1.1` 新增 `assertAdminSession()` helper，驗證 Supabase user + admin role；需單元測試
- `1.2` 在 `lib/actions/presentations.ts` 所有寫入 action 加授權 helper
- `1.3` 盤點其他 `createAdminClient()` 寫入 actions 並補 session 驗證

### 🟡 中優先（功能完整性）

**presentation-canvas-authoring-parity**（簡報畫布）
- `1.1` layout document persistence：schema、draft/published snapshot
- `1.2` legacy presentation backfill/migration guard
- `1.3` slide components 模板區塊契約（member/guest/keynote/award/vp_report）

**segment-admin-member-guest-portals**（三入口分離）
- `0.1` 鎖定會員 CSV 匯入欄位契約
- `0.2` 鎖定來賓回饋表單存放策略（Supabase `guest_visits.feedback`）
- `0.3` 補記三入口差異落差清單
- `1.1` 三入口導覽架構設計
- `1.2` 來賓 portal 設計基準

### 🟢 低優先（UI 細節）

**presentation-editor-ui-bugs**（編輯器 UI 小錯）
- `1.1` 屬性面板寬度從 280px 擴大到 340px
- `1.2` 縮小輸入框 padding/gap
- `2.1` 隱藏頂部導航列的重複用戶資訊
- `3.1` 搜尋框綁定 Enter 事件
- `4.1` sidebar「每週例會」連結指向正確頁面

### ✅ 已完成（可略過）

- **presentation-editor-desktop-workspace-expansion** — 所有 task 完成，已封存

---

## 各 Change 詳細狀態

### platform-code-review-hardening
**背景**：2026-06-03 code review 發現 admin server actions 未驗證 session 即可寫入 DB，屬高危安全漏洞。

已做：無（全未開始）

待做：
1. 建立 `assertAdminSession()` helper（含單元測試）
2. `lib/actions/presentations.ts` 所有寫入 action 套用此 helper
3. 全面盤點其他使用 `createAdminClient()` 的寫入路徑，補上同等驗證

---

### presentation-canvas-authoring-parity
**背景**：將簡報從表單式編輯改為 canvas 畫布模式（1920×1080）。

已做：
- `1.4` 會員資料綁定契約 ✅
- `2.1` Canvas stage、slide navigator、block selection ✅

待做：
1. `1.1` layout document persistence（schema + draft/published snapshot 設計）
2. `1.2` 舊版簡報資料回填與 migration guard
3. `1.3` 五種 slide 模板區塊契約定義（member / guest / keynote / award / vp_report）

---

### presentation-editor-ui-bugs
**背景**：編輯器介面有多個 UI 細節問題，不影響核心功能但影響使用體驗。

已做：無

待做：
1. `1.1` 屬性面板寬度 280px → 340px
2. `1.2` 縮小輸入框 padding/gap
3. `2.1` 隱藏頂部導航列重複用戶資訊
4. `3.1` 搜尋框綁定 Enter 事件
5. `4.1` sidebar「每週例會」連結修正

---

### segment-admin-member-guest-portals
**背景**：管理員 / 會員 / 來賓三個入口尚未完整分離，來賓需要獨立 portal。

已做：無（全未開始）

待做：
1. `0.1` 鎖定會員 CSV 匯入欄位契約
2. `0.2` 鎖定來賓回饋表單存放策略（Supabase `guest_visits.feedback`）
3. `0.3` 補記三入口差異落差清單
4. `1.1` 三入口導覽架構設計
5. `1.2` 來賓 portal 設計基準

---

## 不需要做的事

- **presentation-editor-desktop-workspace-expansion** — 已封存，全部完成，無需重開或追蹤
