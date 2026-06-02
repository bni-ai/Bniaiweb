## Context

現有簡報系統已有資料來源、`presentations.slide_order`、React slide components 與公開 `/presentation/[week-date]`，但目前 viewer 會把所有 slides 連續渲染成多段 HTML，管理端也只是資料工作台。這和 `ui-mockup-admin.html` 的 slide thumbnail grid、Preview / Publish / Export 操作，以及 open-slide 類型的 1920x1080 slide runtime 差距太大。

本 change 把現有資料基底升級為 BNI 內建 slide runtime。第一版只做「播放 + 管理」：固定比例 viewer、鍵盤導覽、present mode、管理端縮圖與發布狀態。不直接接 open-slide package，避免額外子 app、Vite runtime、部署和資料同步複雜度。

## Goals / Non-Goals

**Goals:**

- 讓公開 viewer 以單張 1920x1080 canvas 呈現，支援鍵盤、按鈕、頁碼與全螢幕入口。
- 讓 present mode 提供 current slide、next preview、timer 與 speaker notes fallback。
- 讓管理端簡報頁符合 `ui-mockup-admin.html` 的資訊架構：狀態列、公開連結、更新時間、投影片數量、slide thumbnail grid、Preview / Publish / Unpublish。
- 保留既有 `presentations.slide_order`、Supabase 資料來源與 server-side deck building。
- 以 TDD 補 runtime tests 與 E2E，避免再次只做表面 UI。

**Non-Goals:**

- 不做 PDF export。
- 不做完整 drag-and-drop 編輯器。
- 不做任意視覺編輯器或 code editor。
- 不直接引入 open-slide package。
- 不修改 Supabase schema。
- 不導入 R2 或新 assets manager。

## Decisions

### D1. 採用 BNI 內建 slide runtime，不直接包 open-slide

以 open-slide 的能力作為產品標準，但實作留在現有 Next app。核心原因是 BNI 簡報內容來自 Supabase server-side 資料聚合，直接包 open-slide 會引入子 app、build target、asset pipeline 與部署維護成本。

替代方案是直接接 open-slide package 或獨立簡報站。這更接近原專案，但第一版會把資料同步、runtime integration 與部署問題混在一起，無法快速修正目前「前台簡報不像簡報」的核心問題。

### D2. Viewer 以 controlled single-slide runtime 取代長頁渲染

`/presentation/[week-date]` 必須只顯示一張 active slide，runtime 管理目前 index、上一張、下一張、鍵盤事件、頁碼與全螢幕入口。Deck 資料仍由 server loader 建好，client runtime 只接收已序列化的 slide view model。

替代方案是保留 server render 全部 slides 再用 CSS scroll-snap。這仍像長頁，不符合投影操作，也難以提供 present mode next preview。

### D3. Slide component 契約固定為 1920x1080

每張 slide 的根容器必須是 1920x1080 canvas，透過 runtime 依 viewport scale，而不是依內容高度撐開。長文字或圖片數量過多時，slide component 必須 clamp、wrap 或摘要顯示。

替代方案是只用 aspect-video CSS。這能得到比例，但沒有固定 canvas 座標與縮放契約，容易在不同螢幕出現 overflow。

### D4. 管理端 thumbnail grid 只管理 deck 狀態，不做完整視覺編輯器

`/admin/presentation` 顯示週次、狀態、公開連結、slide count、thumbnail cards 與主要 actions。每張 thumbnail 使用 slide type、label、order 和簡化內容摘要；不做第一版 drag-and-drop，也不做 inline content editing。

替代方案是在本輪同時做拖拉排序與 slide form editing。這會超出「播放 + 管理」範圍，也會混入資料覆寫策略。

### D5. Present mode 從同一份 deck view model 衍生

`/presentation/[week-date]/present` 使用同一份 deck loader 與 slide renderer，但 UI 顯示 current slide、next preview、timer、speaker notes fallback。Speaker notes 第一版由 slide type 與 summary 產生，不新增資料表欄位。

替代方案是另建 notes schema。這更完整，但會產生 schema migration 與管理端 notes 編輯需求，第一版不採用。

## Implementation Contract

**Behavior**

- 公開 viewer 開啟已發布 deck 時，畫面只顯示一張 active slide，slide 位於置中的 1920x1080 canvas，頁面無 admin/member shell。
- Viewer 支援 ArrowRight、Space 前進，ArrowLeft 後退；第一張不能再往前，最後一張不能再往後。
- Viewer 顯示目前頁碼、總頁數、上一張/下一張按鈕與全螢幕入口。
- Viewer 開啟 missing、draft 或 malformed deck 時仍維持既有 not-found / blocked behavior，不暴露草稿。
- Present mode 顯示 current slide、next preview、timer 與 notes 區；沒有 next slide 時顯示結束提示。
- 管理端 `/admin/presentation` 顯示 `ui-mockup-admin.html` 對齊的狀態列與 thumbnail grid，Preview 進 viewer，Publish / Unpublish 使用既有 actions。
- Slide thumbnails 反映真實 `slide_order`、status、published_url、updated_at 與 slide count。

**Interface / data shape**

- `PresentationDeck` 保留 server-side model，但新增可序列化 `PresentationRuntimeDeck`，包含 `weekDate`、`chapterName`、`slides[]`。
- 每個 runtime slide 至少包含 `id`、`type`、`label`、`title`、`subtitle`、`summary`、`notes`、`payload`。
- Client runtime component 只接收 `PresentationRuntimeDeck`，不得在 slide component 內發 DB query。
- `presentations.slide_order` 仍是排序與可見性 SSOT。
- Public routes 維持 `/presentation/[week-date]`，新增 `/presentation/[week-date]/present`。

**Failure modes**

- Deck 沒有任何 visible slide 時，公開 route 必須 not-found。
- Runtime 收到空 slides array 時，必須顯示安全空狀態，不得 throw client error。
- Malformed slide entries 必須在 server loader 階段被拒絕，不能進入 client runtime。
- Fullscreen API 不可用時，全螢幕按鈕可保留但不得阻斷播放。

**Acceptance criteria**

- `npm run test` 通過，且包含 runtime unit tests。
- `npm run build` 通過。
- `npm run test:e2e -- --grep "presentation"` 覆蓋 admin thumbnail grid、viewer navigation、present mode。
- `npm run test:e2e` 全綠。
- `spectra analyze presentation-slide-engine-redesign --json` 無 findings。
- `spectra validate presentation-slide-engine-redesign` 成功。

**Scope boundaries**

- In scope：viewer runtime、present mode、admin thumbnail/status surface、slide canvas contract、tests。
- Out of scope：PDF export、drag-and-drop、visual editor、schema migration、R2/open-slide package integration。

## Risks / Trade-offs

- [Runtime 改成 client component 可能破壞 server-only資料載入] → server loader 先建立 serializable deck，再交給 client runtime。
- [固定 1920x1080 可能讓手機預覽太小] → runtime 用 scale-to-fit，手機仍可操作下一張/上一張。
- [Thumbnail grid 無拖拉可能仍不滿足完整創作工具] → 第一版明確鎖定播放 + 管理；排序仍保留在 detail workbench，後續可加 drag-and-drop。
- [Present mode 沒有真 speaker notes schema] → 第一版用 slide summary fallback；後續再開 schema SR。
