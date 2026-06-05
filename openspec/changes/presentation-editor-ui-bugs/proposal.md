## Problem

簡報編輯器與管理介面存在多個 UI/UX 與功能缺陷，影響管理員日常使用：

1. **重複內容**：左側全域側邊欄已顯示登入者資訊，但簡報工作台與簡報管理頁右上角又出現第二份使用者資訊，造成視覺重複與畫面凌亂。
2. **搜尋框無法使用**：頂部導航列的搜尋區只有靜態 chip 文案（「搜尋會員、引薦、簡報、會議紀錄」），沒有可提交的輸入欄位與導向邏輯。
3. **屬性面板桌機可用性不足**：右側「背景與文字」屬性面板在桌機版雖已改為較寬欄位，但內部仍缺少穩定的最小寬度與排版收斂，容易被整體工作區壓縮。
4. **桌面版工作區寬度浪費**：簡報編輯器在桌機版仍把可用空間保守分配給左欄與右欄，畫布沒有充分吃到寬螢幕空間，右側觀感仍偏空。

## Root Cause

- 重複內容：簡報頁沿用共用 shell，但 shell 沒有針對 presentation surfaces 關閉頂部身份卡。
- 搜尋框：頂部導航列目前只是樣式化 chip，不是表單，沒有輸入、提交或導向邏輯。
- 屬性面板桌機可用性：workspace 三欄已存在，但 inspector 欄寬與內容排版仍偏保守，沒有以「桌機可長時間編輯」為優先。
- 桌面版工作區浪費：presentation workbench 已脫離一般 container，但三欄寬度分配仍沒有把大螢幕多出來的空間優先回饋給畫布與 inspector。

## Proposed Solution

- 在簡報工作台與簡報管理頁面關閉頂部導航列的重複用戶資訊，只保留側邊欄身份卡。
- 把頂部搜尋區改為可輸入、可提交的表單，先提供簡單的 admin 關鍵字導向與 fallback 搜尋結果頁。
- 收斂 inspector 欄的最小寬度、內部 grid 與輸入元件尺寸，確保桌機版欄位可穩定操作。
- 重新分配 `/admin/presentations/[id]` 的桌面三欄比例，讓左欄、畫布、右欄更符合 workbench。

## Non-Goals

- 不實作全文搜尋引擎或跨資料域即時搜尋索引。
- 不重寫整個 admin shell，只做 presentation surfaces 與 topbar search 的局部收斂。
- 不處理簡報資料模型或播放邏輯。

## Success Criteria

- 簡報工作台與簡報管理頁不再同時顯示兩組用戶資訊。
- 搜尋框可輸入關鍵字並按 Enter 導向對應 admin 頁面或搜尋結果頁。
- 屬性面板內所有輸入框在桌機版保持完整、可讀、可操作。
- 桌面版 editor 在常見寬螢幕下不再保留明顯右側大空白，左欄/畫布/右欄可同屏操作。

## Impact

- Affected code:
  - Modified: `components/presentation/canvas-editor.tsx`, `app/(admin)/layout.tsx`, `components/layout/bni-portal-shell.tsx`, `app/globals.css`, topbar search route/page
  - Removed: none
