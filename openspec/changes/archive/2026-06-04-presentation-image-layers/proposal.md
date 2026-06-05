## Why

目前簡報編輯器僅支援「底圖」和「文字框」兩種元素，但實際使用時經常需要在投影片內插入獨立的圖片元素（例如：產品照片、會員大頭貼、圖表、Logo）。底圖只能覆蓋整頁背景，無法滿足「在特定位置放一張圖片」的需求。同時，文字框內也無法插入圖片，無法做到圖文混排的簡單排版。

這個 change 要讓管理員可以在畫布上插入圖片元素（可拖拉、可 resize），並在文字框內插入圖片區塊（圖片占一行）。

## What Changes

- **圖片元素（Image Layer）**：新增類似文字框的圖片層，可上傳本機圖片、拖拉位置、拉右下角改大小。與文字框共用同一套畫布互動機制（選取、拖拉、resize handles）。
- **文字框圖文混排**：文字框內支援插入圖片區塊，圖片占一行（block-level），與文字上下排列。
- **資產儲存**：圖片元素上傳至 Supabase Storage（與底圖共用 `bniai-media` bucket），路徑為 `presentations/{presentationId}/layers/{layerId}-{filename}`。
- **Viewer 渲染**：公開 viewer 與 present mode 正確渲染圖片元素與文字框內的圖片。

## Non-Goals

- 不支援圖片旋轉（保持 0deg）。
- 不支援文字繞圖（文字框內圖片為 block-level，不與文字並排）。
- 不支援圖片濾鏡、遮罩、複雜樣式（僅支援圓角、邊框寬度、陰影開關）。
- 不處理圖片裁切（上傳後直接以完整圖片顯示，以 object-fit: contain 或 cover 控制）。

## Capabilities

### New Capabilities

- `presentation-image-layers`: 投影片圖片元素的建立、編輯、渲染與儲存

### Modified Capabilities

- `presentation-canvas-authoring`: 畫布編輯器增加圖片上傳、圖片層拖拉/resize、文字框圖文混排
- `slide-viewer`: viewer 渲染圖片元素與文字框內圖片

## Impact

- Affected specs: `presentation-image-layers`, `presentation-canvas-authoring`, `slide-viewer`
- Affected code:
  - New: `lib/actions/presentations.ts` (uploadLayerImageAction), `lib/media-storage.ts` (layer image path builder)
  - Modified: `components/presentation/canvas-editor.tsx`, `lib/presentation/types.ts`, `lib/presentation/runtime.ts`, `lib/presentation/slide-order.ts`, `lib/presentation/viewer.tsx`, `app/presentation/[week-date]/page.tsx`
  - Removed: none
