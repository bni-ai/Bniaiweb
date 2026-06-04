# BNI AI 平台 — SaaS 化規劃
版本：v1.0 | 更新：2026-06-04

---

## 產品願景

把 BNI 分會管理平台從「華 AI 分會專屬工具」轉型為「每個 BNI 分會都能自助開通、按月訂閱的 SaaS 服務」，讓台灣 200+ 個 BNI 分會的幹事從 LINE 記帳、Excel 管理跳進一個現代化的數位工具。

---

## 目標客戶

**主要**：台灣 BNI 各分會的資訊組長、秘書財務或主席（決策購買者）

- 每週例會固定，行政繁瑣（出席紀錄、簡報、VP 報告）
- 現有工具分散（LINE、Excel、Google 表單、手動 PPT）
- 沒有 IT 能力，需要「開帳號就能用」的水準
- 每個分會 20–50 人，不需企業級複雜度

**次要**：BNI 台灣總部（若未來希望統一管理各分會資料）

---

## 商業模式

### 訂閱制

| 方案 | 月費（NTD）| 適用 | 核心限制 |
|------|-----------|------|---------|
| 入門版 | 990 | 50 人以下分會 | 無 AI 功能、無自訂品牌 |
| 標準版 | 1,990 | 一般分會 | 包含 AI 摘要、VP 報告自動化 |
| 旗艦版 | 3,490 | 大型/多分會組 | 自訂網域、白牌、API 存取 |

### 台灣市場估算

- 台灣目前約 200 個 BNI 分會
- 保守滲透率 10%（20 個分會）× 標準版 1,990 = **月營收 39,800 NTD**
- 樂觀滲透率 30%（60 個分會）× 均價 2,200 = **月營收 132,000 NTD**
- 成長路徑：台灣站穩後擴香港、新加坡、馬來西亞（BNI 覆蓋全球 70+ 國）

### 補充收入

- 分會自訂網域年費（999 NTD/年）
- 超量 AI token 按用量計費
- 企業整合（BNI Connect API 對接）按專案報價

---

## 技術架構轉換

### 現況（單租戶）vs 目標（多租戶）

| 層面 | 現況 | 目標 |
|------|------|------|
| 章節解析 | `getChapter()` 硬編碼 `slug = "hua-ai"` | 從請求 context 動態解析 chapter slug |
| JWT claims | 只注入 `app_role`，無 chapter 資訊 | 同時注入 `chapter_id` + `app_role` |
| RLS 策略 | 資料庫層有 `chapter_id` 欄位但 RLS 尚未啟用 | 每張業務表啟用 RLS，policy 比對 `chapter_id` |
| 路由 | `/admin`、`/dashboard`、`/guest` 固定路徑 | 可加 slug 前綴（`/[slug]/admin`）或用子網域 |
| Onboarding | 無（手動建 seed data） | 分會自助註冊 + 付費開通流程 |
| 計費 | 無 | Stripe 訂閱管理 |
| 品牌 | 固定「BNI 華AI分會」名稱與紅色主色 | 每分會可設名稱、Logo、主色 |

### 需要改動的架構層

#### 1. 資料隔離（Row Level Security）

現況：`chapters` 表與所有業務表都有 `chapter_id`，但尚未在 Supabase 啟用 RLS policy。  
目標策略：

```sql
-- 以 members 表為例（其他業務表同樣模式）
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_chapter_isolation"
  ON members
  USING (chapter_id = (
    SELECT id FROM chapters WHERE id = auth.jwt() -> 'chapter_id'
  ));
```

所有寫入 action 目前用 `createAdminClient()` 繞過 RLS，短期可接受，中期需切換成帶 chapter context 的 authenticated client 或在 service_role 層面手動驗證 `chapter_id`。

#### 2. 身份識別（chapter_id 帶入 session）

**問題**：`custom_access_token_hook`（migration 002）目前只注入 `app_role`，未注入 `chapter_id`，導致前端無法從 JWT 知道使用者屬於哪個分會。

**解法**：修改 auth hook，查 `members` 表時同時取 `chapter_id`，一起寫進 JWT claims：

```sql
-- 修改 custom_access_token_hook
claims := jsonb_set(claims, '{chapter_id}', to_jsonb(chapter_id_value), true);
```

`getChapter()` 目前的硬編碼 `slug = "hua-ai"` 改為：
- 方案 A：從 JWT `chapter_id` claim 解析（需 server component 讀 session）
- 方案 B：從 subdomain / URL slug 解析（來賓路徑必須走這條，因為來賓沒有登入 JWT）

#### 3. 分會 Onboarding 流程

新分會開通需要的最小步驟：

1. 管理員在平台註冊帳號（email + 分會基本資料）
2. 系統自動建立 `chapters` 記錄（狀態：`pending_payment`）
3. 完成 Stripe 付款 → 狀態改 `active`
4. 管理員收到帳號啟用信，進入 `/admin` 設定分會
5. 透過 CSV 匯入或手動新增會員名冊

#### 4. 計費/訂閱層（Stripe）

**資料庫側**：在 `chapters` 表加欄位：

```sql
ALTER TABLE chapters ADD COLUMN
  stripe_customer_id    text,
  stripe_subscription_id text,
  plan_tier             text DEFAULT 'trial'
    CHECK (plan_tier IN ('trial', 'starter', 'standard', 'premium')),
  subscription_status   text DEFAULT 'active'
    CHECK (subscription_status IN ('active', 'past_due', 'cancelled', 'trial'));
```

**流程**：Stripe Webhook → Next.js API Route → 更新 `chapters.subscription_status`。  
所有 admin actions 在執行前先驗證 `chapter.subscription_status = 'active'`。

#### 5. 自訂品牌

`chapters` 表已有 `logo_url`、`primary_color`、`custom_domain` 欄位（migration 001 已設計）。  
需要：
- Admin 設定頁面讓分會上傳 Logo（Supabase Storage）
- CSS 變數從 `chapters` 動態注入 `layout.tsx`
- `custom_domain` 需要 Vercel 的 Domain API（或 Next.js middleware 解析）

---

## 開發 Roadmap

### Phase 0 — 現有功能穩定（當前）

這是 SaaS 化的先決條件。對應 `DOCS/task-status.md` 的待做項目：

| 優先 | 任務 | 說明 |
|------|------|------|
| 🔴 | 安全性：`assertAdminSession()` | admin server actions 目前無 session 驗證，SaaS 環境是高危 |
| 🔴 | 安全性：補全所有寫入 action | `lib/actions/presentations.ts` 及其他使用 `createAdminClient()` 的路徑 |
| 🟡 | 三入口分離：來賓 portal 基準 | 來賓入口是 SaaS 的最佳賣點之一，需完整可用 |
| 🟡 | 簡報畫布：layout persistence | 核心功能，SaaS 前要穩定 |

---

### Phase 1 — 多租戶基礎（3–4 週）

**目標**：讓第二個分會可以用同一套部署跑起來，資料完全隔離。

**任務**：

1. **修改 `getChapter()` 動態解析**
   - 從 URL slug 解析（`/[slug]/...`路由）或從 JWT claim 解析
   - 移除硬編碼 `"hua-ai"`
   - 來賓路徑：從 URL slug 解析（無 JWT）

2. **修改 auth hook 注入 `chapter_id`**
   - migration 002 upgrade：查 `members.chapter_id` 寫進 JWT
   - 前端 session 工具讀取 `chapter_id`

3. **啟用 RLS（所有業務表）**
   - 按 chapter 隔離的 USING policy
   - 白名單：service_role bypass 保留（給 onboarding seed）

4. **驗證隔離**
   - 本地建兩個 chapter seed，確認 admin A 看不到 admin B 的資料

**驗收標準**：同一個 Vercel 部署，用不同 slug 進入，顯示不同分會資料，DB 層互相隔離。

---

### Phase 2 — 分會自助開通（2–3 週）

**目標**：新分會不需要 Fish 手動建 seed data。

**任務**：

1. **Onboarding 頁面**（`/signup`）
   - 分會名稱、地區、管理員 email、密碼
   - 自動建 `chapters` 記錄（`plan_tier: 'trial'`，14 天免費）

2. **Trial 狀態管理**
   - `chapters` 加 `trial_ends_at` 欄位
   - Middleware 偵測 trial 到期 → 導向付款頁

3. **管理員初始設定精靈**
   - Step 1：分會基本資料（名稱、地區、logo）
   - Step 2：會員 CSV 匯入（現有功能直接復用）
   - Step 3：第一週例會日期設定

**驗收標準**：訪問 `/signup`，填完表單，自動進入分會 `/admin` 且資料隔離正確。

---

### Phase 3 — 計費系統（2–3 週）

**目標**：有人付錢才讓進。

**任務**：

1. **Stripe 整合**
   - 建 Stripe Products（三個方案）
   - Stripe Checkout session → 成功後 webhook 更新 `chapters.subscription_status`
   - 建 API route：`/api/stripe/webhook`

2. **付費牆 Middleware**
   - `/admin`、`/dashboard` 路由：檢查 `subscription_status`
   - `past_due` → banner 提醒；`cancelled` → 鎖定，導向付款頁

3. **訂閱管理頁面**
   - 顯示目前方案、到期日、付款歷史
   - Stripe Customer Portal link（讓客戶自助升降方案）

**驗收標準**：用 Stripe 測試卡完成付款，分會狀態從 `trial` 變 `active`，取消後存取被鎖。

---

### Phase 4 — 品牌自訂與公開上架（2–3 週）

**目標**：每個分會看起來是「自己的」平台。

**任務**：

1. **分會品牌設定**
   - Admin 設定頁：上傳 Logo（Supabase Storage）、選主色
   - `layout.tsx` 從 DB 動態注入 CSS 變數 `--primary-color`

2. **自訂網域**
   - Admin 設定頁：填入自訂網域
   - Vercel Domain API 自動新增（或指引用戶設定 CNAME）
   - Middleware 從 hostname 解析 `chapter_id`

3. **公開行銷頁**
   - `/`（首頁）介紹平台功能
   - `/pricing` 定價頁
   - `/demo` 申請試用表單

**驗收標準**：`platform.bni-demo.com` 解析到系統，顯示該分會的 Logo 與主色。

---

## 來賓功能在 SaaS 中的角色

來賓功能是整個平台最強的**病毒擴散機制**：

- 會員邀請來賓參加例會 → 來賓收到專屬連結進入 `/guest`
- 來賓看到完整的分會介紹、成員專業、參訪記錄
- 來賓體驗越好 → 成員越願意推廣 → 分會形象越好

**SaaS 設計要點**：

| 面向 | 設計 |
|------|------|
| URL | `/[slug]/guest` 或 `platform.bni-xxx.com/guest`，不需登入 |
| 章節解析 | 從 URL slug 解析，不依賴 JWT（因為來賓無帳號） |
| 隔離 | 來賓只能看到對應分會的公開資料 |
| 付費牆 | 來賓功能可作為「標準版以上」的賣點 |
| 轉化漏斗 | 來賓申請成為會員 → 進入 `pending_member` 審核流程 |

現有的 `guest_content_items` 表（migration 005）與 `guest_visits` 已有 `chapter_id`，架構上已準備好，但來賓 portal 前端（`segment-admin-member-guest-portals` change）尚未完成，這是 Phase 0 必須收尾的項目。

---

## 風險與挑戰

| 風險 | 等級 | 說明 | 對策 |
|------|------|------|------|
| Auth hook 不支援多分會場景 | 🔴 高 | 目前 JWT 無 `chapter_id`，用戶屬於多個分會時邏輯模糊 | 限制一個 email 只能屬於一個分會（符合 BNI 實際情況） |
| `createAdminClient()` 繞過 RLS | 🔴 高 | 所有寫入用 service_role，若 action 被 SSRF 或 injection 攻擊，無分會隔離 | Phase 0 先補 `assertAdminSession()`；Phase 1 同步啟用 RLS |
| 來賓 URL 暴露分會 slug | 🟡 中 | `/[slug]/guest` 讓人猜到其他分會 slug | slug 設計加 entropy（e.g. `tpe-01-k7x2`），非純序號 |
| Stripe 稅務與收款法規 | 🟡 中 | 台灣電商需開發票，Stripe Taiwan 不含稅務服務 | 評估綠界/藍新本土金流；或用 Stripe + 手動開立電子發票 |
| BNI 總部授權問題 | 🟡 中 | 使用 BNI 商標/品牌可能需授權 | 定位為「BNI 分會管理工具」，不冒用 BNI 官方名義；聯繫台灣總部取得合作/背書 |
| 多租戶資料遷移 | 🟢 低 | 現有 `hua-ai` 資料需確保 Phase 1 改動不破壞 | 先在 branch 環境測試，Phase 1 完成後 hua-ai 作為第一個真實 tenant 驗收 |

---

## 最小可行版本（MVP SaaS）

**定義**：第一個「非 hua-ai 分會」願意付費上線的狀態。

必須完成：

- [ ] `getChapter()` 動態解析（無硬編碼）
- [ ] Auth hook 注入 `chapter_id`
- [ ] RLS 啟用，資料按 chapter 隔離
- [ ] 管理員 Onboarding（`/signup` + CSV 匯入）
- [ ] 基本付費牆（Stripe Checkout + webhook）
- [ ] 安全性補強（`assertAdminSession()`）
- [ ] 來賓 portal 可用（三入口分離 change 完成）
- [ ] 分會名稱動態顯示（至少名稱，Logo 可以後補）

**不需要在 MVP 完成**：

- 自訂網域
- 品牌主色自訂
- 公開行銷首頁
- 訂閱管理 Portal
- 多方案 tier（MVP 只要一個價格）

**MVP 預估工期**：Phase 0（2–3 週）+ Phase 1（3–4 週）+ Phase 2 核心（1–2 週）+ Phase 3 基礎（1–2 週）= **約 7–11 週**，假設全力投入。

**第一個付費客戶的驗收標準**：一個不認識的 BNI 分會管理員，自己透過 `/signup` 開通帳號、匯入會員、跑完一次例會管理、並且成功用 Stripe 付款訂閱，全程不需要 Fish 介入。
