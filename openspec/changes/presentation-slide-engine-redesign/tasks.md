## 1. Runtime Model 與 Slide Components

- [x] 1.1 落實 `D1. 採用 BNI 內建 slide runtime，不直接包 open-slide` 與 `Runtime receives a serializable slide model`：建立 `PresentationRuntimeDeck`，server loader 可輸出 `id/type/label/title/subtitle/summary/notes/payload` 的 serializable slides；驗證：新增 `lib/presentation/runtime.test.ts` 並用 `npm run test -- lib/presentation/runtime.test.ts` 通過。
- [x] 1.2 落實 `Slide builder`：`buildSlideOrder` 產生 `cover -> agenda -> data-driven slides -> team -> closing` 的完整 meeting flow，固定 slide entry 不含 `id/visible`，資料驅動 slide 保留 `visible=true`；驗證：更新 `lib/presentation-logic.test.ts` 或 builder unit tests 通過。
- [x] 1.3 落實 `D3. Slide component 契約固定為 1920x1080` 與 `Slide components`：所有 slide type 在固定 1920x1080 canvas 內渲染，包含 Cover、Agenda、Team、Member、Guest、Keynote、Award、VP Report、Closing，且長內容會 clamp 或摘要；驗證：runtime/unit tests 檢查 slide metadata，E2E viewer 截圖區塊只存在一個 active slide。

## 2. Public Slide Viewer

- [x] 2.1 落實 `D2. Viewer 以 controlled single-slide runtime 取代長頁渲染` 與 `Slide viewer`：`/presentation/[week-date]` 顯示單一 active slide、頁碼、上一張/下一張、全螢幕入口，不再長頁渲染全部 slides；驗證：`npm run test:e2e -- --grep "published presentation viewer"` 可看到 `1 / N` 且 active slide 數為 1。
- [x] 2.2 落實 `Viewer supports keyboard navigation` 與 `Viewer supports previous navigation`：ArrowRight/Space 前進、ArrowLeft 後退，且首尾邊界不越界；驗證：新增或更新 presentation E2E 覆蓋鍵盤導覽。
- [x] 2.3 落實 `Viewer requests a missing presentation`、`Viewer requests an unpublished presentation`、`Viewer encounters malformed slide entries`：missing/draft/malformed deck 繼續 blocked/not-found，不暴露草稿；驗證：既有 presentation blocking E2E 維持通過。

## 3. Present Mode

- [x] 3.1 落實 `D5. Present mode 從同一份 deck view model 衍生` 與 `Presentation present mode`：新增 `/presentation/[week-date]/present`，使用同一份 published runtime deck，無 admin/member shell；驗證：E2E 開啟 present route 可見 present mode heading 或 test id。
- [x] 3.2 落實 `Present mode shows current and next slide`、`Present mode reaches final slide`、`Present mode displays timer`、`Present mode displays speaker notes fallback`：present mode 顯示 current slide、next preview、timer `00:00` 起算、notes fallback，最後一張顯示結束提示；驗證：E2E 覆蓋 first slide、next preview、timer 與最後一張狀態。

## 4. Admin Presentation 管理面

- [x] 4.1 落實 `D4. 管理端 thumbnail grid 只管理 deck 狀態，不做完整視覺編輯器` 與 `Presentation publishing`：`/admin/presentation` 顯示狀態列、公開連結、更新時間、投影片數量、thumbnail grid、Preview/Publish/Unpublish；驗證：`npm run test:e2e -- --grep "presentation"` 覆蓋 thumbnail labels 與主要 action。
- [x] 4.2 落實 `Officer sees presentation thumbnail grid` 與 `Officer previews presentation`：thumbnail grid 依真實 `slide_order` 與 runtime slide metadata 產生，Preview 指向 `/presentation/[week-date]`；驗證：E2E 建立 deck 後可在 admin grid 看到 `首頁`、`演講`、`會員` 等 labels 並開啟 viewer。
- [x] 4.3 落實 `Officer publishes a presentation` 與 `Officer unpublishes a presentation`：Publish 設為 published 並顯示公開 URL，Unpublish 設回 draft 並移除可分享狀態；驗證：E2E 或 integration helper 檢查 status/published_url readback。

## 5. 驗收與交付

- [x] 5.1 完成 TDD 與 regression：`npm run test`、`npm run build`、`npm run test:e2e` 全綠；驗證：三個指令成功。
- [x] 5.2 完成 SR 自身驗收：`spectra analyze presentation-slide-engine-redesign --json` 無 findings，`spectra validate presentation-slide-engine-redesign` 成功；驗證：兩個指令成功。
- [ ] 5.3 完成 production 交付：commit、push、Vercel production deploy，並對 `https://bni-ai-web.vercel.app` 跑 live E2E；驗證：`E2E_BASE_URL=https://bni-ai-web.vercel.app npm run test:e2e` 全綠。
