## Context

目前產品的基礎架構與主要功能線已建立：

- auth + role routing 已可用
- admin backend 已可操作 weekly brief、guests、keynote、VP、awards、presentation
- member portal 已可操作 dashboard、weekly brief、directory
- guest portal 已可操作 public/authenticated guest flow

但 mockup v3 描述的，不只是「有沒有頁面」，而是：

- 頁面順序與資訊架構
- 每頁應顯示哪些摘要資訊
- 哪些入口是主入口、哪些是次入口
- 哪些功能若尚未完工，UI 應如何明確標示
- 每個 UI 區塊背後是否真的有資料來源與可驗證的寫入路徑

如果不先把這些關係整理成 SR，後續繼續補 `presentation-engine`、`member-module`、`bni-chapter-platform` 時，很容易在 UI 對齊過程中重複造輪子或破壞既有 flow。

## Goals / Non-Goals

**Goals**

- 用 v3 mockup 當 UI 參考基準，整理 admin/member 兩端的落差
- 明確標記每一頁目前屬於：
  - fully wired
  - partially wired
  - missing
- 將每個頁面的前端入口、server action、資料表、驗收案例對齊
- 為未完成功能設計安全的 UI 狀態，避免使用者誤認為功能已壞掉
- 補一組可驗證的 E2E / smoke cases，確保 UI 對齊不破壞既有功能

**Non-Goals**

- 不在本 SR 完成所有未完成產品能力
- 不重構整個資料模型
- 不做純視覺重畫而忽略資料與行為

## Decisions

### D1 — 以「功能級對齊」為主，不做像素級還原

本 SR 以資訊架構、欄位、狀態、入口與接線為驗收核心。  
色彩、卡片、間距可以接近 mockup，但不把 pixel-perfect 當硬需求。

原因：

- 目前最大的風險不是顏色不一樣，而是 UI 暗示某功能存在，但後端其實沒接完
- 後續仍有未完成主線，若先做重視覺高仿，會增加重工

### D2 — 對每個 mockup 頁面做「三態分類」

每個 admin/member 頁面都必須被分類為：

- `wired`: 前端入口、資料讀取、提交/更新、權限與驗收案例都存在
- `partial`: 頁面或入口存在，但功能只完成一部分，需要明確標示限制
- `missing`: mockup 有，但目前產品還沒有，需先在 UI 中標示開發中，並對接後續 SR

這個分類會直接寫入 tasks 與驗收矩陣。

### D3 — 未完成主線不直接混入已完成 SR

已完成的 `app-foundation`、`landing-page`、`admin-backend`、`member-portal`、`guest-portal`、`debug-e2e-acceptance-failures` 應封存。  
新的 UI 對齊工作不回頭污染這些已完成 SR，而是用新的 `uiux-v3-alignment` 承接。

未完成主線保留：

- `bni-chapter-platform`
- `presentation-engine`
- `member-module`

原因：

- 這三個 change 仍是後續功能增量的主體
- 若把 UI 對齊直接散寫回舊 SR，未來會失去決策邊界

### D4 — 以前端頁面為中心做端口接線審核

每個對齊頁面都要有接線表：

```text
UI page
  -> server action / route handler
  -> table / derived state
  -> acceptance test
```

這個接線表是本 SR 的 SSOT，用來回答：

- 前後端有沒有接在一起
- 接的是哪條線
- 驗收如何證明

### D5 — 未完成功能要顯式顯示「受限 / 開發中」

對於 mockup 已經有入口、但底層主線還沒完成的頁面，例如：

- member: profile、one-on-one、events、training、ai
- admin: import、settings

本 SR 要求不能留壞連結或假功能。  
必須擇一：

- 顯示 read-only skeleton / coming soon
- 顯示 disabled CTA + 說明
- 或導向一個明確的受限頁

### D6 — 不得破壞既有已驗證流程

以下流程已被本機與 production E2E 驗證，本 SR 實作不得破壞：

- member email / guest email / unknown email callback routing
- admin route guard
- member dashboard/report/directory
- guest portal public/authenticated split
- admin weekly operations
- presentation publish / public view 基本鏈路

## Mockup Gap Map

### Member v3

```text
Mockup 頁面
  dashboard      -> 已有 route，需補摘要卡 / 待辦 / 活動區塊 UI
  report         -> 已有 route，需補截止時間 / 狀態提示 / mockup 欄位節奏
  profile        -> 目前缺 route，需補基本頁與欄位邊界
  directory      -> 已有 route，需補 card grid / profile modal / CTA 狀態
  onetone        -> 底層屬 member-module，先做受限入口
  events         -> 底層屬 bni-chapter-platform，先做受限入口
  training       -> 底層屬 bni-chapter-platform，先做受限入口
  ai             -> 底層屬 bni-chapter-platform，先做受限入口
```

### Admin v3

```text
Mockup 頁面
  overview       -> 已有 route，需補 v3 dashboard 摘要與未提交列表呈現
  submission     -> 已有 route，需補概況卡 / 提醒入口 / 更接近 mockup 的資料節奏
  presentation   -> 已有 route，需補 slide list / 預覽 / 連結操作入口
  keynote        -> 已有 route，需補 mockup 中排程感與編輯入口
  guests         -> 已有 route，需補本週/下週 card 呈現與更多狀態
  members        -> 已有 route，但 member-module 未完成，先補安全版列表與限制
  import         -> route 缺失，需明確接到後續主線或顯示開發中
  settings       -> route 缺失，需明確接到後續主線或顯示開發中
```

## Integration Risks

### R1 — `bni-chapter-platform` 與現況重疊

`bni-chapter-platform` 是舊 umbrella change，內含大量已被後續拆分實作的任務。  
風險是未來有人繼續照它原 tasks 直接做，會重複覆蓋現有 `admin-backend`、`member-portal`、`guest-portal` 結果。

處理方式：

- 在本 SR 明確標記：目前 admin/member 已完成部分應以已封存 changes 與現況 code 為準
- `bni-chapter-platform` 只保留未拆出的主線任務

### R2 — `presentation-engine` 與既有 presentation route 重疊

目前 `/admin/presentation` 與 `/presentation/[week-date]` 已存在，但還不是完整 typed slide engine。  
UI 對齊時不可把 presentation engine 的完整需求偷塞進本 SR。

處理方式：

- 本 SR 只處理現有 presentation UI 對齊與入口明確化
- 真正的 slide typed rendering、viewer frame、builder 邏輯仍由 `presentation-engine` 承接

### R3 — `member-module` 與 member UI 深度耦合

profile、GAINS、top clients、contacts circle、one-on-one 都會直接影響 member v3 mockup。  
UI 對齊必須先定義「現在顯示到哪裡」，不能假裝功能已完成。

處理方式：

- 對未完成模組提供受限頁 / 開發中狀態
- 所有未完功能按鈕必須可預期，不可壞掉

## Implementation Contract

**Behavior**

- member/admin 兩端的現有 UI 要整理成和 v3 mockup 相同的主導航語意與資訊結構
- 已接好的功能要有對應資料顯示與明確狀態
- 尚未完成的功能要以安全、清楚的受限狀態呈現
- 前後端接線需要能在 SR 裡被逐頁追蹤與驗證

**Interface**

- 新增 `uiux-v3-alignment` specs，描述 admin/member parity 與接線審核
- 補齊必要頁面 route 或 placeholder route
- 補齊 E2E cases 驗證 nav、guard、placeholder、wired flows

**Failure modes**

- 若某 route 尚未完成卻仍出現在 nav，頁面不得 404 或直接空白
- 若某 UI 卡片顯示某狀態，必須有實際資料來源，不可是假資料冒充已接線
- 若對齊過程破壞既有 callback / RBAC / submit / publish flow，視為 regression

**Acceptance criteria**

1. member/admin v3 mockup 中的主入口都有對應頁面或明確受限狀態
2. 每個已接功能頁面都有可追溯的前後端接線說明
3. UI 對齊不破壞既有 production E2E
4. 未完成主線的入口不再表現為壞連結或假功能

## Rollout

1. 先封存所有已完成 SR
2. 建立本 SR 作為新的 UI 對齊主線
3. 先做 admin/member 的 gap audit 與接線矩陣
4. 再分批補 route、placeholder、UI 狀態與已接頁面的 parity
5. 每完成一批就重跑 test/build/E2E，避免做 A 壞 B
