## Context

你最後定下來的 timer 需求，不是主持人手動切 preset，也不是只在 present mode 顯示。第一版的產品定義是：

- timer 在簡報編輯系統先設定
- 每頁可勾選是否顯示 timer
- 勾選後輸入整數秒數
- present mode 與 public viewer 都會顯示
- 只有 present mode 可控制
- public viewer 只同步顯示
- 倒數結束後只提示，不自動跳頁
- 位置固定右上角，圓形、小尺寸

因此這次設計要把「slide config」與「runtime countdown state」分清楚，而不是再把 timer 當成單純 present-only widget。

## Goals / Non-Goals

**Goals**

- 在 slide editor data 中新增每頁 timer config
- 在 editor UI 補上 timer 開關與秒數欄位
- 在 present mode 依據當前 slide 的 timer config 自動建立 countdown
- 在 public viewer 顯示同一份 session timer 的只讀狀態
- 在同一瀏覽器 session 內同步 present mode 與 viewer 的 timer 狀態

**Non-Goals**

- 不做跨裝置同步
- 不做排程 queue / preset library / 浮動視窗
- 不做每頁 timer 位置自訂
- 不做自動跳頁

## Decisions

### D1. 每頁 timer 設定寫入 slide editor data

timer 的「是否顯示」與「秒數」屬於這張 slide 的播放設定，應該跟著 slide editor data 一起存。這樣 admin 在編輯簡報時就能先決定哪幾頁有 timer。

第一版資料形狀：

- `editor.timerEnabled?: boolean`
- `editor.timerSeconds?: number | null`

### D2. countdown state 不寫回 slide content

雖然每頁 timer config 會存在 slide editor data 中，但 countdown 過程本身屬於 runtime state，不應寫回 published slide content。

換句話說：

- `timerEnabled` / `timerSeconds` 是 content config
- `remainingSeconds` / `running` / `overtime` 是 runtime session state

### D3. 同一瀏覽器 session 內用本地同步通道共享 timer state

第一版不做後端同步，因此 present mode 與 public viewer 的同步以同一瀏覽器 session 為範圍。可接受的實作包括：

- `BroadcastChannel`
- `localStorage` + `storage` event fallback

public viewer 不控制 timer，只被動接收當前 slide 與 timer countdown 狀態。

### D4. slide 切換時依該頁設定重建 timer

當 active slide 改變時：

- 若該頁未啟用 timer：overlay 不顯示
- 若該頁啟用 timer：runtime 以該頁秒數建立 countdown

第一版預設在進入該頁後自動開始倒數，因為你已明確說播放時不適合再手動切換 timer 顯示。

### D5. present mode 保留 pause / resume / reset；viewer 只讀

present mode 仍應提供最小控制：

- pause / resume
- reset（重置到該頁設定秒數）

viewer 只顯示 countdown / overtime，不顯示控制按鈕。

## Implementation Contract

### Observable behavior

- admin 在 `/admin/presentations/[id]` 可對單一 slide 勾選是否顯示 timer，並輸入整數秒數
- published deck 轉成 runtime deck 後，active slide 可暴露 `timerEnabled` 與 `timerSeconds`
- viewer 開啟啟用 timer 的 slide 時，右上角顯示圓形 countdown
- present mode 開啟同一份 deck 時，右上角顯示同一個 countdown，並有 pause / resume / reset 控制
- present mode 換到下一張啟用 timer 的 slide 時，timer 依該頁秒數重新開始
- countdown 到 0 後進入 overtime 顯示，但不自動換頁

### Interface / data shape

- `SlideEditorPatch` 新增：
  - `timerEnabled?: boolean`
  - `timerSeconds?: number | null`
- `PresentationRuntimeSlide["editor"]` 新增：
  - `timerEnabled: boolean`
  - `timerSeconds: number | null`
- runtime session state 至少包含：
  - active slide key
  - timer visibility
  - configured seconds
  - remaining seconds
  - running
  - overtime seconds
  - updated at / source mode

### Failure modes

- `timerEnabled=true` 但 `timerSeconds` 缺值或非正數：runtime 視為不顯示 timer，不能 crash
- viewer 沒收到同步訊號：仍可顯示該頁靜態初始秒數或本地 countdown fallback，不能白屏
- `BroadcastChannel` 不支援：退回 `storage` event 或等價本地 fallback
- 切頁過快：新 slide 的 timer state 必須覆蓋舊 slide，不能殘留上一頁倒數

### Acceptance criteria

- focused tests 覆蓋：
  - slide_order 解析 timer config
  - runtime slide 保留 timer config
  - runtime session helper 對 slide 切換、pause/reset、overtime 的處理
- Playwright 覆蓋：
  - present mode 啟用 timer 的 slide 顯示 countdown
  - public viewer 顯示只讀 timer
  - present mode 切頁後 timer 依新頁秒數重建
- `spectra analyze presentation-meeting-timer --json`
- `spectra validate presentation-meeting-timer`

### Scope boundaries

- In scope：
  - 每頁 timer config
  - countdown
  - present/viewer 同瀏覽器 session 同步
  - overtime 顯示
- Out of scope：
  - preset buttons
  - 浮動 PiP 視窗
  - 跨裝置同步
  - 自動跳頁
