# Active SR Triage 2026-06-05

## 目的

這份文件只做 SR 整理，不代表功能已完成。它的用途是把目前 active changes 分成：

- 應繼續保留的主線
- 建議合併的重疊 changes
- 建議暫停或拆小的 changes
- 狀態需要校正的 changes

## 主線保留

### `presentation-canvas-authoring-parity`

- 原因：這是簡報系統主線，仍涵蓋 layout document、asset library、viewer、publish、migration 等核心能力。
- 結論：保留 active，不與 UI 細修或 timer 合併。

### `platform-code-review-hardening`

- 原因：處理 server action 授權、publish redirect、viewer/runtime 風險，屬於安全與資料正確性硬化。
- 結論：保留 active，不與 presentation UX SR 混合。

### `presentation-meeting-timer`

- 原因：屬於 presenter/runtime 工具能力，和 editor layout 或 publish flow 不同線。
- 結論：保留 active，獨立開發。

### `bni-core-tools`

- 原因：屬於中長期產品能力（引薦單、一對一、Chapter Hub），不是目前 auth/presentation 整理主題。
- 結論：可保留，但暫時不建議與眼前簡報/auth 工作並行推進。

## 建議合併或收斂

### `presentation-editor-ui-bugs`

- 範圍：搜尋框、每週例會導航、重複使用者資訊、新增空白頁、屬性面板問題。
- 已整合：桌面 workspace 擴寬需求已併入這條 change。
- 結論：保留，並視為 editor polish 主 change。

### `presentation-editor-desktop-workspace-expansion`

- 範圍：桌面版三欄 workspace、右側大空白、container 過窄。
- 結論：與 `presentation-editor-ui-bugs` 高度重疊，內容已併入 `presentation-editor-ui-bugs`。
- 已處理：此 change 已 park，不再列為 active 主線。

## 建議暫停或拆小

### `segment-admin-member-guest-portals`

- 問題：目前把 portal segmentation、guest portal content、feedback、contact ownership、import contract 混成一條。
- 結論：先不要直接 apply。
- 建議：之後拆成較小 SR，例如：
  - `guest-portal-feedback-and-introductions`
  - `portal-navigation-segmentation`
  - `member-import-contract`

## 狀態校正

### `presentation-editor-desktop-workspace-expansion`

- 問題：這條 change 只有 proposal/design/specs/tasks，尚未實作，但 tasks 曾被誤勾成全完成，導致 `spectra list` 顯示 `done`。
- 已處理：先恢復為未完成，再把需求合併進 `presentation-editor-ui-bugs`，最後 park。
- 後續：若未來需要恢復，應先確認 `presentation-editor-ui-bugs` 是否已消化相同需求，避免再開雙主線。

## 額外備註

### `auth-self-service-registration-and-approval`

- 目前狀態：active change 目錄已不存在，且有 archive 痕跡。
- 結論：若未來要做自助註冊／待審核升權，應視為重新建立或從 archive 恢復，不應假設它仍是 active。
