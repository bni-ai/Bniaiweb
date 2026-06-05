## Context

目前簡報編輯器只有兩種元素：
1. **底圖**（backgroundImageUrl）：整頁背景，每頁一張，透過檔案上傳。
2. **文字框**（textLayers）：絕對定位的文字區塊，可拖拉、resize、改樣式。

管理員需要在投影片內放置獨立的圖片（例如產品照片、Logo），這些圖片不應該是底圖，而應該是可以自由定位、調整大小的元素。同時，文字框內也需要支援簡單的圖文混排（圖片占一行）。

## Goals / Non-Goals

**Goals:**

- 讓管理員在畫布上插入圖片元素，像文字框一樣拖拉和 resize
- 讓文字框內支援插入圖片區塊（block-level）
- 圖片儲存至 Supabase Storage，與底圖共用 bucket
- 公開 viewer 正確渲染圖片元素與文字框內圖片

**Non-Goals:**

- 不支援圖片旋轉
- 不支援文字繞圖
- 不支援圖片裁切、濾鏡、遮罩
- 不處理圖片 CDN 或壓縮優化

## Decisions

### Decision: 圖片元素採用獨立的 `imageLayers` 陣列，不混入 `textLayers`

- 原因：圖片與文字是不同的元素類型，獨立陣列讓型別更清晰，編輯器互動邏輯也更好分離。
- 做法：在 `SlideEditorPatch` 新增 `imageLayers?: SlideImageLayer[]`，結構類似 `textLayers`（id, x, y, width, height, imageUrl, style）。
- 替代方案：把圖片當成 `textLayers` 的一種（在 text 裡放圖片標記）：會讓型別混亂，拖拉邏輯也變複雜。

### Decision: 圖片上傳走獨立 server action，不經由 `saveSlideOrderAction`

- 原因：圖片檔案較大，若塞進 FormData 與 `saveSlideOrderAction` 一起提交，會造成表單過大、上傳時間長，且無法做即時預覽。
- 做法：前端點擊「插入圖片」後，先呼叫 `uploadLayerImageAction(presentationId, file)` 上傳圖片，取得 URL 後，在畫布上建立 `imageLayer`（類似 addTextLayer 的即時體驗），最後按「儲存簡報內容」時才把 imageLayers 寫入 slide_order。
- 替代方案：所有圖片經由 `saveSlideOrderAction` 一起上傳：會讓儲存動作變慢，且無法即時預覽。

### Decision: 文字框圖文混排採用「圖片占一行」的簡單模式

- 原因：實作簡單、行為可預期、不需要處理複雜的 inline 圖片定位。
- 做法：在文字框的編輯介面中，新增一個「插入圖片」按鈕，點擊後在 textarea 的游標位置插入一個特殊標記（例如 `![圖片](url)`），渲染時把這個標記轉成 `<img>` 區塊（display: block）。
- 替代方案：使用 contentEditable + rich text editor：複雜度高，且與現有 textarea 編輯模式衝突。

### Decision: 圖片元素使用 object-fit: cover，並提供圓角與陰影開關

- 原因：圖片比例不一定符合設定的 width/height，需要統一的縮放策略。圓角和陰影是最常用的圖片樣式。
- 做法：圖片元素預設 `object-fit: cover`，可切換為 `contain`。樣式控制項提供 `borderRadius`（0 / 8 / 16 / 999px）與 `shadow`（無 / 小 / 中）開關。
- 替代方案：自由設定 object-fit 與任意 CSS：過度複雜，且容易破壞簡報一致性。

## Implementation Contract

### Observable Behavior

- 管理員在畫布編輯器按「插入圖片」後，可選擇本機圖片檔案，圖片立即出現在畫布中央（x=720, y=360, width=480, height=360）。
- 圖片元素可像文字框一樣拖拉位置、拉右下角 resize。
- 選取圖片元素後，右側屬性面板顯示：寬、高、圓角、陰影、object-fit 切換、替換圖片按鈕、刪除按鈕。
- 文字框編輯區域上方新增「插入圖片」按鈕，點擊後在游標位置插入 `![描述](url)` 標記，textarea 即時顯示標記文字。
- 公開 viewer 渲染圖片元素時，圖片以 `object-fit: cover` 填滿設定的寬高區域。
- 公開 viewer 渲染文字框時，遇到 `![描述](url)` 標記，轉為 `<img>` 區塊（display: block, width: 100%）。

### Interface / Data Shape

- `SlideImageLayer`:
  ```ts
  {
    id: string;
    imageUrl: string;
    x: number;
    y: number;
    width: number;
    height: number;
    borderRadius: 0 | 8 | 16 | 999;
    shadow: "none" | "sm" | "md";
    objectFit: "cover" | "contain";
  }
  ```
- `SlideEditorPatch` 擴充：`imageLayers?: SlideImageLayer[] | null`
- Server Action：`uploadLayerImageAction(presentationId: string, file: File): Promise<{ url: string }>`
- 圖片儲存路徑：`presentations/{presentationId}/layers/{layerId}-{filename}`

### Failure Modes

- 若圖片上傳失敗（檔案過大、非圖片格式），顯示錯誤提示且不建立 imageLayer。
- 若圖片 URL 失效（被刪除），viewer 顯示「圖片無法載入」灰色佔位區塊，不造成白屏。
- 若文字框內的 `![描述](url)` 標記 URL 無效，viewer 顯示「圖片無法載入」佔位文字。

### Acceptance Criteria

- Playwright E2E：管理員插入圖片元素、拖拉、resize、儲存後重新載入，圖片位置與大小正確。
- Playwright E2E：文字框插入圖片標記，viewer 正確渲染圖片區塊。
- 單元測試：textarea 的 `![描述](url)` 標記解析正確轉為 img 元素。

### Scope Boundaries

- In scope：圖片元素、文字框圖文混排、圖片上傳、viewer 渲染、屬性面板控制項。
- Out of scope：圖片旋轉、文字繞圖、圖片裁切、CDN 優化、批量上傳。

## Risks / Trade-offs

- [圖片上傳可能會讓 editor state 變大] → imageLayers 只存 URL，實際檔案在 Storage。
- [文字框內特殊標記語法可能與用戶輸入衝突] → 使用 `![` 開頭的 markdown-like 語法，衝突機率低；若衝突可改用轉義。
- [圖片元素與文字框的拖拉邏輯重複] → 提取共用的 drag/resize hook 或共用函數。
