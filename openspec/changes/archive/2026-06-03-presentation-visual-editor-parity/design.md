## Context

現有簡報系統已經有 `presentations.slide_order`、公開 viewer、present mode 與管理端發布流程，但編輯面只支援排序與顯示切換。這個 change 的第一階段不追求 open-slide 等級的拖拉編輯，而是先做穩定可用的固定欄位編輯模型：幹部在後台改內容，前台就能以 HTML 投影片播放。

## Goals / Non-Goals

**Goals**

- 管理端可直接編輯投影片標題、內文、底圖、字級。
- 前台 `/presentation/[week-date]` 呈現 HTML 投影片，支援翻頁與頁碼。
- 保留既有週次、發布、公開網址與 present mode 基線。
- 全程先在本機開發與驗證，不部署到正式站。

**Non-Goals**

- 不做拖拉定位、resize 手把、自由畫布。
- 不引入新的簡報 CMS 或 open-slide 整合。
- 第一階段不新增資料表欄位；先沿用 `slide_order` 作為持久化載體。

## Decisions

### D1. 第一階段用固定欄位編輯，不做視覺化拖拉

每張投影片第一階段至少支援：`title`、`body`、`backgroundImageUrl`、`fontSize`、`visible`、`sort_order`。這組欄位能直接對應管理端表單，也能穩定輸出前台 HTML deck。

### D2. 編輯資料先附掛在 `slide_order` entry 上

第一階段不加資料表欄位，避免本機階段先卡在 migration 與遠端資料同步。`slide_order` entry 允許攜帶 `editor` 物件，內含標題、內文、底圖與字級。這維持現有發布與 viewer 資料源單一化。

### D3. 前台播放層採 Reveal.js

公開簡報 route 改用 Reveal.js 作為 HTML 投影片播放器，提供翻頁、頁碼與鍵盤操作。present mode 仍可沿用既有 route，但 slide 顯示內容要與新的 editor 內容一致。

### D4. 先從現有 runtime deck 推出預設編輯內容

對 member / keynote / guest / award / vp_report 等投影片，若尚未自訂 editor 內容，就從現有 runtime deck 的 title / subtitle / summary 推出預設內容。這讓第一階段不必重新設計所有業務資料來源。

## Implementation Contract

- `/admin/presentations/[id]` 不再只是排序工具；頁面要能直接編標題、內文、底圖、字級。
- 儲存後，重新開啟同一工作台時要看到剛剛儲存的內容。
- 已發布簡報的 `/presentation/[week-date]` 要顯示儲存後內容，而不是只顯示 builder 預設文字。
- 前台 viewer 一次只顯示一張 slide，可翻頁，不能退化成長頁面。
- present mode 要維持可用，並讀到同一份 slide 內容。
- 本輪驗證只做本機 `npm run test`、`npm run build`、必要的本機 e2e；不部署。

## Risks / Trade-offs

- [Risk] 把 editor 內容掛在 `slide_order` 會讓 entry 結構變大。→ Mitigation：只加最小固定欄位，維持 parser 嚴格驗證。
- [Risk] Reveal.js 與既有 viewer/ present mode 並存時出現內容分叉。→ Mitigation：所有顯示面都讀同一份 runtime editor state。
- [Risk] 本輪不做拖拉編輯，使用者仍會覺得不夠像 open-slide。→ Mitigation：先完成可編內容與 HTML 播放，再把 canvas editor 留給下一階段 SR。
