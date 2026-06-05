## Context

目前本機已有一版 `presentation-visual-editor-parity`，但那版本質上只是把 `slide_order` 延伸成固定欄位編輯，並沒有建立真正的版面文件、元素級編輯、或共享 renderer。實際結果是：後台能改少量文字，但前台簡報仍以固定模板拼裝，編輯內容與公開 viewer 之間也存在資料斷裂風險，無法滿足「像 open-slide demo 那樣可排版、可上圖、可改大小、前台直接看到 HTML 投影片」的需求。

`open-slide` 提供了重要對標：每張投影片有固定 1920x1080 畫布、以 React/DOM 呈現、具有 inspector、assets panel、present mode 與靜態發布能力。這些能力證明高質感簡報的核心是「共享畫布 renderer + 可視化編輯模型」，而不是單純加幾個表單欄位。另一方面，`open-slide` 的正式資料來源是 slide 檔案本身，這和本專案需要的 Supabase 後台資料流不同，所以不能直接整包搬進來。

## Goals / Non-Goals

**Goals:**

- 建立一套可持久化的 `presentation layout document`，讓簡報從排序資料升級為版面資料。
- 提供管理端可視化畫布編輯器，讓使用者在固定舞台上調整文字、圖片、底圖、位置、尺寸與顯示狀態。
- 讓前台 viewer、預覽、發布共用同一個 renderer 與同一份已儲存文件，消除後台與公開頁的內容落差。
- 保留既有 BNI 會員 / 來賓 / 短講 / 獎項 / VP 資料來源，但讓它們轉成可編排的模板區塊。
- 將會員端自行填寫的個人資料、每週簡報、自介與素材變成投影片模板的正式資料來源，讓會員不需要進後台也能更新將出現在簡報中的內容。
- 修正目前公開 viewer 可能只顯示黑底空白的失敗狀態，並把「有文字、有底圖或 placeholder、可翻頁」列為本機驗收門檻。
- 全程先在本機完成開發、測試、E2E、畫面驗證，再決定是否部署。

**Non-Goals:**

- 不直接將 `open-slide` monorepo 或其 Vite 開發工作區嵌入主站。
- 不把營運中的簡報內容改成手寫 TSX 檔作為唯一資料來源。
- 不在本 change 內處理來賓分區、正式會員匯入、或其它 admin IA 調整。
- 第一波不追求 Figma 等級的多人協作、評論系統、或通用設計系統編輯器。

## Decisions

### Decision: 採用 open-slide 的模式，但不直接嵌入 open-slide runtime

- 原因：`open-slide` 已證明 1920x1080 DOM 畫布、inspector、assets panel、present mode 這條路是對的；但它的作者模型是編輯 slide 檔，而本專案需要的是非工程師可用、由 Supabase 儲存與發布的後台系統。
- 做法：保留 Next.js + Supabase 為產品骨架，自建簡報 authoring 層；設計語言、編輯體驗、present mode 與資產管理對齊 `open-slide` 的能力分層。
- 替代方案：
  - 直接把 `open-slide` 當子應用嵌入：部署與資料同步複雜，且無法自然對接 BNI 後台權限與資料。
  - 繼續擴充固定欄位工作台：無法達到可排版與質感要求，已被現況證明不足。

### Decision: 以 DOM-based 畫布加共享 block renderer 取代表單式工作台

- 原因：前台最終輸出就是 HTML；若編輯器與 viewer 共用同一組 DOM block renderer，所見即所得程度最高，樣式偏差最小。
- 做法：在 1920x1080 虛擬舞台上以絕對定位 block 呈現元素，後台使用拖拉 / resize handles 編輯 block frame，前台 viewer 使用相同 renderer 只關閉編輯能力。
- 替代方案：
  - Konva / canvas：前台 HTML 與後台 canvas 會變成兩套渲染模型，不利一致性。
  - 只做表單欄位：無法提供排版能力。

### Decision: 新增 layout document，而不是繼續把所有編輯內容塞進 slide_order

- 原因：`slide_order` 適合保存順序與顯示狀態，不適合保存元素樹、樣式、座標、資料綁定與發布快照。
- 做法：新增 `layout_document` 結構與 `published_layout_snapshot` 概念；`slide_order` 保留為投影片生成與排序來源，但 viewer 以 layout document 為主要輸入。
- 替代方案：
  - 繼續擴充 `slide_order` JSON：欄位會持續膨脹，無法明確表達版面生命週期與 schema 版本。

### Decision: 保留 BNI 業務資料，改用模板區塊與資料綁定注入

- 原因：會員簡報、來賓介紹、VP 報告等內容仍來自資料庫；真正要讓使用者可排版的是「這些資料怎麼被擺進投影片」，不是把每張 slide 都變成純自由排版空白頁。
- 做法：每種 slide type 先提供一組 template blocks，例如 `cover-hero`、`member-profile-card`、`guest-intro-card`、`vp-metric-grid`。block 可移動、可 resize、可切換顯示；區塊內文則由資料綁定或手動覆寫決定。
- 替代方案：
  - 全自由 block：彈性最高，但第一波導入成本過大，也容易破壞 BNI 一致性。
  - 固定整頁模板：無法達到你要的客製排版。

### Decision: 會員端資料是簡報內容來源，不只是後台資料

- 原因：BNI SaaS 的核心流程是會員自己維護個人資料、專業、需求與素材；若簡報只讀後台手動輸入，資料會重複、過期，也無法支援每週自動產生。
- 做法：member / keynote / team 類投影片的 template block 必須支援綁定會員資料欄位，例如 `chinese_name`、`specialty_title`、`specialty_description`、`company_name`、`photo_url`、`weekly_briefs.have_this_week`、`weekly_briefs.want_this_week`、`keynote_talks.topic`、`keynote_talks.outline`、會員上傳圖片。後台 editor 只決定版面、顯示欄位與必要覆寫。
- 替代方案：
  - 只在簡報後台手動填資料：短期快，但會讓會員端填寫失去價值，也會造成資料不同步。
  - 完全自動生成不可編輯模板：資料同步乾淨，但無法滿足底圖與排版需求。

### Decision: 資產管理走 Supabase Storage + presentation_assets manifest

- 原因：現有系統已使用 Supabase，且底圖、照片、Logo 需要後台可追蹤、可替換、可重用。
- 做法：圖片檔案仍存放在 Storage；新增可查詢 manifest，記錄資產 id、路徑、尺寸、用途、建立者、所屬 presentation / chapter。
- 替代方案：
  - 只存 URL 字串：難以管理重用、替換與清理。

### Decision: 發布流程以已儲存 layout document 快照為準

- 原因：目前已觀察到後台編輯內容和發布內容可能不一致；發布必須有明確快照，才能保證 preview / public / present mode 使用同一份資料。
- 做法：`儲存` 更新 draft layout；`預覽` 讀 draft layout；`發布` 生成 `published_layout_snapshot` 與 viewer metadata；public route 只讀 published snapshot。
- 替代方案：
  - 發布時再臨時組裝：容易產生版本漂移與 race condition。

## Implementation Contract

### Observable Behavior

- 管理員在 `/admin/presentations/[id]` 看到的是 1920x1080 畫布式編輯器，而非純表單工作台。
- 每張投影片至少可編輯：底圖、文字區塊、圖片區塊、位置、尺寸、顯示狀態、排序。
- 會員 / 來賓 / 短講 / 獎項 / VP 等資料型投影片，會以預設模板出現在畫布上，管理員可調整版面並覆寫部分顯示文字。
- `/presentation/[week-date]`、預覽頁、公開頁、present mode 都讀取相同的 published layout snapshot。
- 會員在自己的頁面更新個人資料或每週簡報後，後台重新產生或同步投影片時，對應的 member / keynote / team template block 必須可顯示最新資料。
- 公開 viewer 首頁不得只顯示黑色背景；若沒有底圖，也必須顯示 template 文字或 placeholder。

### Interface / Data Shape

- `PresentationLayoutDocument`
  - `version: number`
  - `presentationId: string`
  - `themeId: string`
  - `slides: SlideLayoutDocument[]`
- `SlideLayoutDocument`
  - `id: string`
  - `sourceType: "cover" | "agenda" | "member" | "guest" | "keynote" | "award" | "vp_report" | "team" | "closing"`
  - `sourceId?: string`
  - `visible: boolean`
  - `backgroundAssetId?: string`
  - `blocks: LayoutBlock[]`
  - `overrides?: { title?: string; body?: string; fields?: Record<string, string> }`
- `LayoutBlock`
  - `id: string`
  - `kind: "text" | "image" | "template" | "shape"`
  - `frame: { x: number; y: number; width: number; height: number; zIndex: number }`
  - `style: Record<string, unknown>`
  - `binding?: { source: string; field: string }`
  - `content?: Record<string, unknown>`
- `PresentationAsset`
  - `id: string`
  - `chapterId: string`
  - `presentationId?: string`
  - `path: string`
  - `mimeType: string`
  - `width?: number`
  - `height?: number`
  - `usage: "background" | "inline" | "logo"`

### Failure Modes

- 若 layout document schema 驗證失敗，viewer MUST 阻止發布並在後台顯示可修復的錯誤訊息。
- 若某個資產不存在，viewer MUST 以佔位狀態渲染該區塊並記錄錯誤，不得整份 deck 白屏。
- 若資料綁定來源不存在，例如 member/guest row 被刪除，editor MUST 顯示失效綁定提示，viewer MUST 使用最後一次 published snapshot 中的安全 fallback 文案。
- 若 member / weekly brief / keynote 資料為空，template block MUST 顯示清楚的空狀態或可覆寫 placeholder，不得造成公開簡報黑屏或整張投影片無內容。

### Acceptance Criteria

- 單元測試覆蓋：layout schema 解析、block renderer mapping、publish snapshot builder、asset binding fallback。
- 整合測試覆蓋：後台儲存 draft layout 後，預覽 viewer 立即可見相同版面；發布後 public viewer 與 preview 一致。
- E2E 覆蓋：拖拉 / resize / 改字 / 換底圖 / 發布 / 翻頁 / 重新開啟後資料持久存在。
- 視覺驗證覆蓋：桌機與手機至少各一組 screenshot，比對文字不消失、底圖存在、單頁不會串成長頁。

### Scope Boundaries

- In scope：簡報 authoring、layout document、assets、viewer、publish snapshot、present mode 對齊。
- Out of scope：全站 IA、來賓 portal、正式資料匯入、多人即時協作。

## Risks / Trade-offs

- [畫布編輯器複雜度高於現行工作台] → 先限制 block 種類與 template 範圍，第一波不做完全自由設計工具。
- [資料遷移會讓既有 presentation 失去預覽能力] → 提供 default layout backfill，把舊 slide_order 轉成初始 layout document。
- [DOM block renderer 若沒有強約束，容易壞版] → 以 1920x1080 舞台、有限 block library、字級 token、safe area 規則約束。
- [直接採用 open-slide 程式碼的整合成本可能過高] → 先借用模式與交互概念；只有在某個模組明顯可重用時才局部引入。
- [本機與部署結果可能出現字體 / 圖片差異] → 把資產、字體、截圖驗證都納入本機驗收。
