## Why

目前簡報系統的播放層只有 present mode 的 elapsed timer，而且 public viewer 完全看不到 timer。這不符合你剛對焦後的需求：

- timer 要在簡報編輯時先設定，而不是播放時臨時切
- 每一頁可決定要不要顯示 timer
- 如果該頁啟用 timer，要能填整數秒數
- present mode 負責控制，public viewer 只讀同步顯示
- 倒數到 0 只提示，不自動跳頁

也就是說，這次不是再做一個主持人小工具，而是要把 timer 收斂成「slide-level config + runtime session state」。

## What Changes

- 在 slide editor data 中新增每頁 timer 設定：
  - 是否顯示 timer
  - timer 秒數（整數秒）
- 在 admin presentation editor 的每頁屬性欄新增 timer 開關與秒數輸入
- 將 present mode 的 timer 從 elapsed timer 改成讀取當前 slide 設定的 countdown
- public viewer 在有啟用 timer 的頁面上顯示只讀 timer overlay
- present mode 與 public viewer 透過同一個 presentation session state 同步 timer 倒數結果
- 倒數結束後只顯示時間到 / overtime，不自動切頁

## Non-Goals

- 本次不做跨裝置、跨瀏覽器、多人遠端主持同步
- 本次不做 agenda queue、講者排程、自動輪播
- 本次不做每頁可拖拉 timer 位置；第一版固定右上角
- 本次不做持久化的主持偏好設定（聲音、提醒點等）

## Capabilities

### New Capabilities

- `presentation-meeting-timer`: 每頁 timer 設定、countdown、present/viewer 同步顯示、到時提示

### Modified Capabilities

- `presentation-present-mode`: 從 elapsed timer 改成 slide-aware countdown controller
- `presentation-html-runtime`: public viewer 可在啟用 timer 的頁面顯示只讀 timer overlay
- `presentation-canvas-authoring`: editor 需要支援每頁 timer 開關與秒數輸入

## Impact

- Affected specs:
  - `presentation-meeting-timer`
  - `presentation-present-mode`
  - `presentation-html-runtime`
  - `presentation-canvas-authoring`
- Affected code:
  - Modified: `components/presentation/canvas-editor.tsx`, `components/slides/deck-runtime.tsx`, `lib/presentation/types.ts`, `lib/presentation/runtime.ts`, `lib/presentation/slide-order.ts`, `lib/presentation/workbench.ts`, related tests and e2e seeds
  - New: timer session/state helper(s), focused timer tests
  - Removed: none
