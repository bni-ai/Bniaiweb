## 1. 對焦與接線盤點

- [x] 1.1 落實 `D1. 以前端 parity 與後端 wiring 雙工流拆解改版`：整理 `/admin`、`/dashboard`、`/guest`、`/admin/presentation`、`/admin/presentations/[id]`、`/admin/settings` 的現況矩陣，明確標示每頁的 route、action、data source、preview/public surface；驗證：`Frontend-backend wiring audit` 在 `tasks.md` 與 `design.md` 可對照，且 `spectra analyze functional-v3-parity-alignment --json` 無 coverage 警告。
- [x] 1.2 [P] 落實 `D5. 用 page-level wiring audit 維持可驗收性`：把 `ui-mockup-admin-v3.html` 與 `ui-mockup-member-v3.html` 的關鍵區塊映射到現有頁面與缺口，確認哪些是功能對齊、哪些留待後續視覺微調；驗證：change artifacts 內有 page-to-page 對照表，且不新增超出 proposal 的 scope。

## 2. 角色表面與 fallback 對齊

- [x] 2.1 落實 `D2. 管理員可見所有表面，但 Dashboard 必須有可理解 fallback`：實作 `Route Access Control` 讓 `admin` 可見 Admin + Dashboard + Guest、`member` 可見 Dashboard + Guest、`guest` 只可見 Guest；驗證：新增或更新 middleware/role tests，並用 `npm run test` 驗證 redirect matrix。
- [x] 2.2 實作 `Member v3 navigation parity` 與 `Member v3 wired pages expose real status`：當 admin 切入 `/dashboard` 時，頁面必須顯示真實 member 資料或明確 fallback 文案，不得出現空白殼；驗證：E2E 覆蓋 admin 切換會員視角後的可見內容，`npm run test:e2e -- --grep "member"` 通過。
- [x] 2.3 [P] 實作 guest surface 對齊 `Route Access Control`：member/admin 可進 `/guest`，guest 嘗試進 `/admin` 或 `/dashboard` 會被導回 `/guest`；驗證：E2E 覆蓋三種角色的 `/guest`、`/admin`、`/dashboard` 邊界行為。
- [x] 2.4 落實 `D6. Shell identity 以登入者與會員資料共同解析`、`Shell identity parity`、`Admin shell identity parity`：admin/member shell 左上角顯示頭像或姓名首字、中文姓名、角色或職務、會員編號或 email fallback；驗證：E2E 覆蓋 `/admin`、`/dashboard` 的 sidebar user card，且 profile 缺失時仍顯示 fallback。

## 3. 簡報工作台對齊

- [x] 3.1 落實 `D3. 簡報後台改成工作台，不再以 JSON 直編為主介面`：把 `Presentation publishing` 的列表頁整理成週次、狀態、預覽、編輯、發布入口齊全的清單層；驗證：`/admin/presentation` 手動檢查可直接找到某週 deck 的 preview/edit/publish 入口，且既有 E2E selector 不壞。
- [x] 3.2 落實 `Presentation publishing` 與 `Admin v3 navigation parity`：把 `/admin/presentations/[id]` 改成 workbench surface，至少提供投影片順序、HTML 預覽入口、簡報資訊、發布操作，不再以 JSON textarea 當主介面；驗證：E2E 能從管理端打開 deck workbench、操作排序或可見性後看到 preview 反映最新狀態。
- [x] 3.3 實作 `Frontend-backend wiring audit` for presentation：把 workbench 的 route、save/publish handlers、`presentations.slide_order`、`/presentation/[week-date]` viewer 與驗收案例寫回 artifacts；驗證：artifact review 可從 SR 直接追到 route/action/viewer/test，且 `spectra analyze` 無 consistency 警告。
- [x] 3.4 [P] 落實 `Admin wired pages expose real operational state`：presentation list 與 workbench 顯示的 slide count、status、published_url、資料不完整訊號都必須來自真實資料；驗證：本機建立一筆 deck 後，列表與 detail 的狀態一致，`npm run test:e2e -- --grep "presentation"` 通過。

## 4. 設定工作台對齊

- [x] 4.1 落實 `D4. 系統設定以三分區呈現，並對齊實際系統 effect`：實作 `Admin settings workbench`，把 `/admin/settings` 重組為 `分會資訊 / AI 設定 / 例會設定` 三個管理區塊；驗證：手動檢查頁面不再是單一工程表單，且三區都有對應可儲存欄位。
- [x] 4.2 實作 `Settings effects are observable`：分會資訊、active AI provider、weekly deadline/reminder、manual sync baseline 的儲存結果必須能在相關頁面或 logs 觀察到 effect；驗證：E2E 或整合測試覆蓋 settings save 後的 readback、AI provider read、sync log 顯示。
- [x] 4.3 [P] 落實 `Admin v3 navigation parity` 與 `Admin wired pages expose real operational state`：設定頁在桌機、平板、手機寬度下都保留主要儲存動作、狀態回饋與 critical controls；驗證：Playwright viewport case 驗證 `desktop/tablet/mobile` 三種寬度下 settings 主 CTA 可見且可操作。
- [x] 4.4 實作 `Frontend-backend wiring audit` for settings：把 `/admin/settings` 的 route、save action、chapter/provider/settings data source、effect proof 與驗收案例寫回 artifacts；驗證：artifact review 與 `spectra analyze functional-v3-parity-alignment --json` 無 gaps。

## 5. 會員媒體、一對一與 AI 對齊

- [x] 5.1 落實 `D7. Media UX 保留 Supabase Storage，R2 留到 adapter phase` 與 `Media UX parity`：保留 `bniai-media` Supabase Storage，重整 profile 頭像、產品圖與素材區，讓上傳圖片在 profile/directory/相關簡報表面可見；驗證：E2E 覆蓋 media upload readback，且不新增 R2 runtime dependency。
- [x] 5.2 落實 `D8. One-on-one 與 Jitsi Meet 以站內預約流程呈現` 與 `One-on-one Jitsi parity`：把 `/dashboard/one-on-one` 改成 `即將進行 / 發起預約 / 預約紀錄` 結構，從 directory 或 query invitee 帶入會員選擇，confirmed booking 可進站內 Jitsi video page；驗證：E2E 覆蓋 directory -> booking -> status -> video entry。
- [x] 5.3 落實 `D9. AI assistant 保留 provider backend，改為聊天表面` 與 `AI assistant chat parity`：把 `/dashboard/ai` 改成聊天式 UI，顯示 AI/user bubbles、prompt chips、query input、recent conversations，並保留 active provider backend；驗證：E2E 覆蓋 AI query 後 response 以 chat message 呈現。
- [x] 5.4 實作 `Frontend-backend wiring audit` for media、AI、one-on-one Jitsi：把 storage/provider/booking data source、visible UI surface、E2E proof 寫回 artifacts；驗證：`spectra analyze functional-v3-parity-alignment --json` 無 gaps。

## 6. 完整驗收與交接

- [x] 6.1 落實 `D5. 用 page-level wiring audit 維持可驗收性`：補齊 `admin/member/guest`、presentation、settings、media、one-on-one Jitsi、AI 的 E2E case，覆蓋正常流程、fallback、preview、publish、save effect、upload readback、chat response；驗證：`npm run test:e2e` 全綠。
- [x] 6.2 完成功能基線回歸：執行 `npm run test`、`npm run build`、`npm run test:e2e`，確認本 change 沒有造成既有功能回歸；驗證：三個指令皆成功。
- [x] 6.3 完成 SR 自身驗收：執行 `spectra analyze functional-v3-parity-alignment --json` 與 `spectra validate functional-v3-parity-alignment`，確認 artifacts 一致且可進入 apply；驗證：analyze 無 Critical/Warning，validate 成功。
- [ ] 6.4 完成嚴格交付：commit、push、Vercel production deploy，並對 `https://bni-ai-web.vercel.app` 跑 live E2E；驗證：live `E2E_BASE_URL=https://bni-ai-web.vercel.app npm run test:e2e` 全綠。
