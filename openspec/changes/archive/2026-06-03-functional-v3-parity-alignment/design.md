## Context

目前產品已具備大部分功能基線，也已經有公開簡報 viewer、會員/管理端路由、設定資料存取與 E2E 驗證。但使用層的呈現仍有三個明顯斷點：

- 權限表面與資料 fallback 不一致，導致 admin 雖然可進 `/dashboard`，卻可能看到像壞掉的會員殼。
- 簡報系統底層已有 slide builder、viewer、publish flow，但後台編輯頁以 `slide_order` JSON 為主，與 v3 mockup 的工作台模式不一致。
- 系統設定頁功能已接線，但資訊架構偏工程視角，未對齊 `分會資訊 / AI 設定 / 例會設定` 的管理介面。
- member/admin shell 缺少 mockup 的使用者資訊卡，一對一/Jitsi、Media、AI 助手雖有後端基線，前端操作表面仍偏工程表單或查詢工具。

這次 change 不是新增模組，而是把既有功能重新整理成管理者與會員可理解、可驗收、可延續做 UI/UX 對齊的操作面。

## Goals / Non-Goals

**Goals:**

- 落實 admin/member/guest 三種身分的可見頁面與 fallback 行為。
- 讓簡報後台符合 `填資料 -> 預覽 HTML -> 發布` 的工作台模式。
- 讓系統設定後台符合 v3 mockup 的資訊架構，並清楚反映儲存後 effect。
- 讓 shell identity、Media UX、一對一 Jitsi Meet、AI assistant chat 與 mockup 的操作模型一致。
- 用前端 parity 與後端 wiring 兩條工作流拆分任務，避免功能與介面再次脫節。
- 把桌機、平板、手機的關鍵行為列入驗收邊界，而不是只看單一桌機畫面。

**Non-Goals:**

- 不在這次變更中做最終 pixel-perfect 視覺微調。
- 不重寫 Supabase schema、auth callback、slide engine 或既有功能模組。
- 不新增新的產品模組或全新資料流程。

## Decisions

### D1. 以前端 parity 與後端 wiring 雙工流拆解改版

這次 change 的任務會分成兩條：

- 前端 parity：頁面資訊架構、工作台布局、狀態卡、responsive 行為、empty/restricted state。
- 後端 wiring：route、server action、viewer payload、settings effect、RBAC fallback、E2E 證據。

這樣可以避免只改畫面卻沒有真接線，或只改接線卻仍讓使用者看到工程介面。

替代方案是單一 change 直接做 UI+code 混合修補；這會讓簡報、設定與權限三條線互相污染，不利於驗收。

### D2. 管理員可見所有表面，但 Dashboard 必須有可理解 fallback

角色模型改成：

- `admin` 可見 `/admin/*`、`/dashboard/*`、`/guest/*`
- `member` 可見 `/dashboard/*`、`/guest/*`
- `guest` 只可見 `/guest/*`

當 admin 切到 member surface 時，系統不得呈現像壞掉的空白殼。若 admin 缺少對應 member row，頁面必須明確顯示 `admin viewing member surface without member profile` 的 fallback 狀態，並保留返回管理端與來賓端的導覽。

替代方案是強制所有 admin 都必須有 member row。這在資料層可行，但不應作為唯一保護，因為它無法解決已登入但資料未同步時的操作體驗。

### D3. 簡報後台改成工作台，不再以 JSON 直編為主介面

`/admin/presentation` 與 `/admin/presentations/[id]` 會被定義成兩層：

- 清單層：選週次、看狀態、進入編輯、預覽、發布。
- 工作台層：投影片順序、HTML 預覽、狀態資訊、發布操作。

`slide_order` 仍可做為內部儲存格式，但不得再是主要操作 UI。工作台必須至少支援：

- 顯示 slide 清單與類型
- 重新產生 deck
- 切換 slide 可見性或順序
- 在同頁或新分頁預覽 HTML viewer
- 發布並取得公開連結

替代方案是保留 textarea JSON 編輯器再加一個預覽連結。這無法符合後台可操作性，也不符合 mockup 驗收。

### D4. 系統設定以三分區呈現，並對齊實際系統 effect

`/admin/settings` 會以三個分區組織：

- 分會資訊：分會名稱、地區、例會地點、例會時間、分會簡介
- AI 設定：provider 清單、active/backup/inactive 狀態、模型/API 設定入口
- 例會設定：提交截止時間、提醒週期、提醒文案、sync baseline 設定

每個區塊都必須對應真實儲存與 effect：

- 分會資訊影響頁面標題、viewer meta、分會簡介內容來源
- AI 設定影響 member AI baseline 的 active provider
- 例會設定影響 weekly brief deadline、reminder logs、manual sync baseline

替代方案是繼續用單頁表單堆欄位。這雖然功能可用，但對管理者不具可理解性，也不利於後續 UI 對齊。

### D5. 用 page-level wiring audit 維持可驗收性

簡報、設定、角色切換這三塊都需要明確記錄：

- route
- 主要 action / handler
- data source / table / storage
- public surface 或 preview surface
- 驗收案例與 E2E selector

這能避免後續做 UI/UX 對齊時重新發生「畫面像對了，但功能不確定是否真的接上」。

#### Page-level wiring audit

| Mockup / scope | Route | Action / handler | Data source | Preview / public surface | E2E proof |
| --- | --- | --- | --- | --- | --- |
| 管理總覽與左上使用者卡 | `/admin` | `getShellIdentity()`、admin layout render | Supabase auth user、`members`、session role cookie | Admin shell sidebar user card | `admin shell shows signed-in identity card` |
| 會員總覽與左上使用者卡 | `/dashboard` | `getShellIdentity()`、member layout render | Supabase auth user、`members`、session role cookie | Member shell sidebar user card | `member shell shows signed-in identity card` |
| 來賓專區 | `/guest`、`/guest/content`、`/guest/members`、`/guest/prepare` | route access gate、guest portal loaders | `guests`、`guest_visits`、public chapter content | Guest-only and public guest surfaces | `guest role can access guest-only content and is blocked from member/admin areas` |
| 簡報管理清單 | `/admin/presentation` | `getPresentationList()`、`generatePresentationAction()` | `presentations`、weekly source tables | HTML preview link and edit workbench link | `published presentation viewer renders and legacy id links redirect` |
| 簡報工作台 | `/admin/presentations/[id]` | `saveSlideOrderAction()`、`regeneratePresentationAction()`、`publishPresentationAction()` | `presentations.slide_order`、`weekly_briefs`、`keynote_talks`、`guest_visits`、`weekly_awards`、`weekly_vp_reports` | `/presentation/[week-date]` viewer | `admin presentation workbench hides raw JSON editor and exposes preview publishing controls` |
| 系統設定工作台 | `/admin/settings` | `saveSettingsAction()`、`triggerReminderAction()`、`runManualSyncAction()` | `chapters`、`chapter_settings`、`ai_settings`、`reminder_logs`、`sync_logs` | Settings readback, AI provider effect, reminder/sync logs | `admin settings drive late briefs, reminders, and manual sync baseline` |
| 設定 responsive 骨架 | `/admin/settings` | settings page render | same as settings workbench | Desktop/tablet/mobile critical controls | `admin settings critical controls remain usable across desktop tablet and mobile` |
| Media UX | `/dashboard/profile`、`/dashboard/directory`、`/admin/keynote` | `uploadMemberPhotoAction()`、`uploadMemberProductImagesAction()`、`saveKeynoteTalkAction()` | Supabase Storage bucket `bniai-media`、`members.photo_url`、`member_product_images`、`keynote_talks.product_images` | Profile photo, directory avatar, keynote material images | `member profile media and keynote materials upload flow works` |
| 一對一與 Jitsi | `/dashboard/one-on-one`、`/dashboard/one-on-one/[id]/video` | `saveAvailabilityAction()`、`createOneOnOneAction()`、`updateOneOnOneStatusAction()` | `member_availability`、`one_on_ones`、`members` | Stationed Jitsi entry page | `member can manage one-on-one availability, booking, conflict, and status`、`confirmed one-on-one can enter video page within allowed window` |
| AI 助手聊天表面 | `/dashboard/ai` | `submitAiQueryAction()` | `ai_settings`、`ai_conversations`、`members` | Chat bubbles with active provider and recent queries | `ai baseline uses active provider and answers member query` |

#### Mockup parity boundary

| Source mockup block | Implemented functional surface | Still deferred to UI/UX polish SR |
| --- | --- | --- |
| `ui-mockup-admin-v3.html` 左側導覽與登入者資訊 | Admin layout 有 user card、會員視角切換、管理端 nav | 最終視覺 spacing、字級、icon 與品牌細節 |
| `ui-mockup-admin-v3.html` 簡報管理 | Presentation list + workbench + HTML viewer preview/publish | Slide theme editor 與 pixel-perfect presentation layout |
| `ui-mockup-admin-v3.html` 系統設定 | 分會資訊、AI 設定、例會設定、同步紀錄四塊工作台 | 更完整的設定卡片視覺分層 |
| `ui-mockup-member-v3.html` 左側導覽與登入者資訊 | Member layout 有 user card、dashboard/guest/member routes | 最終手機 nav 手勢與 icon set |
| `ui-mockup-member-v3.html` 一對一 | 即將進行、發起預約、預約紀錄、Jitsi 入口 | Calendar-like micro interaction |
| `ui-mockup-member-v3.html` AI 助手 | Chat surface、prompt chips、provider/readback | 品牌化助理 avatar 與動畫 |
| `ui-mockup-member-v3.html` 會員媒體 | Profile photo/product upload、directory avatar、keynote images | R2 adapter 與圖片管理排序 UI |

### D6. Shell identity 以登入者與會員資料共同解析

admin 與 member shell 都要有左上角使用者卡。資料優先順序為：member profile 的照片與姓名、session role、登入 email。若缺少 member profile，仍顯示目前登入身分與 fallback，不讓左上區塊消失。

### D7. Media UX 保留 Supabase Storage，R2 留到 adapter phase

本輪不切換圖床 provider。頭像、產品圖、短講素材繼續走既有 Supabase Storage bucket 與 path convention，前端重點是把圖片放回 profile、directory、presentation、admin workbench 的可理解表面。R2 後續以 storage adapter 方式導入，不阻擋本次 E2E。

### D8. One-on-one 與 Jitsi Meet 以站內預約流程呈現

既有 `one_on_ones` 與 `jitsi_room` 仍是資料基礎。UI 改成 mockup 的 `即將進行 / 發起預約 / 預約紀錄` 結構，從會員卡可帶入 invitee，confirmed 且在時間窗口內才顯示站內 Jitsi 入口。

### D9. AI assistant 保留 provider backend，改為聊天表面

AI provider、query、reminder preview 的後端流程不重寫。前端改為聊天式 UI，包含 AI/user bubble、prompt chips、送出狀態與最近對話，讓 `/dashboard/ai` 看起來像助理，而不是工程查詢頁。

## Implementation Contract

**Behavior**

- 管理員登入後預設進 `/admin`，但可穩定切換到 `/dashboard` 與 `/guest`，且三者都能讀懂目前身分與限制。
- member/admin shell 左上角必須顯示使用者卡，包含頭像或姓名首字、姓名、角色或職務、會員編號或 email fallback。
- 會員登入後預設進 `/dashboard`，仍可進 `/guest`，不可進 `/admin`。
- 來賓登入後只可進 `/guest`，若打開 `/admin` 或 `/dashboard` 必須被明確導回 `/guest`。
- 管理端簡報工作台必須提供 `預覽簡報`、`發布簡報`、`投影片順序`、`簡報資訊` 等人可理解的操作區，而不是只露出 JSON textarea。
- 系統設定儲存後，對應的分會資訊、deadline/reminder、AI provider、sync baseline 必須能在相關頁面或 logs 中觀察到效果。
- 一對一頁必須提供 mockup 對齊的即將進行、發起預約、預約紀錄表面，Jitsi 入口必須從預約紀錄自然切入。
- AI 助手頁必須呈現聊天表面，並沿用 active provider 與查詢紀錄。
- Media UX 必須讓已上傳圖片出現在會員資料與相關列表，而不是只在上傳表單附近顯示。

**Interface / data shape**

- RBAC 以既有 session role 與 member/guest resolution 為基礎，不更改核心 claim 來源，但會調整 route gate 與 surface fallback。
- Presentation workbench 仍使用 `presentations.slide_order` 作為內部結構；前端工作台只讀寫受控欄位，例如順序、可見性、重新產生與發布，不直接要求管理者手寫 JSON。
- Settings workbench 仍透過既有 settings actions 儲存，但 UI 必須以三分區表面呈現，並保留 provider、chapter info、weekly settings 的清楚資料邊界。
- Media 仍使用 `bniai-media` Supabase Storage bucket，R2 不進入本次 runtime contract。
- Jitsi URL 仍由 `one_on_ones.jitsi_room` 組成，video page 不新增外部預約 provider dependency。

**Failure modes**

- 若 admin 缺少 member profile，`/dashboard` 必須顯示可理解 fallback，而不是空頁或無資料卡死。
- 若 presentation 無法生成 deck 或缺少資料，工作台必須阻止發布並明示資料不完整。
- 若 settings 儲存失敗，頁面必須保留原輸入與錯誤提示，不得默默失敗。
- 若媒體上傳失敗，表單必須回到可理解錯誤狀態，不得讓使用者以為素材已進簡報。
- 若 AI query 失敗，聊天表面必須保留 user message 並顯示錯誤回饋。

**Acceptance criteria**

- `spectra analyze functional-v3-parity-alignment --json` 對 proposal/design/specs/tasks 不得有 Critical 或 Warning。
- E2E 必須覆蓋：admin/member/guest route boundary、admin -> dashboard switch、presentation workbench preview/publish、settings save/effect 基線。
- E2E 必須覆蓋：shell identity、media upload readback、directory -> one-on-one booking -> Jitsi video page、AI chat query。
- 至少以桌機與手機寬度驗證簡報工作台與設定頁不會壞版；平板行為需在任務中列為驗證點。

**Scope boundaries**

- In scope：權限表面、簡報工作台、設定工作台、相關 wiring audit、必要 E2E。
- Out of scope：像素級視覺微調、全新簡報樣式引擎、auth 模型重構、非上述頁面的全面重設計。

## Risks / Trade-offs

- [Route gate 與資料 fallback 互相影響] → 先在 spec 裡鎖定 admin/member/guest 的可見矩陣，再補 middleware 與 surface fallback 驗證。
- [簡報工作台改動可能打壞既有 publish flow] → 保留 `slide_order` 為內部契約，只替換操作表面並補 preview/publish E2E。
- [設定頁資訊架構調整可能讓既有 actions 失效] → 不改 action 核心輸入語義，只重整表面與欄位分組，必要時補 adapter。
- [responsive 需求若不先寫入任務，實作會回到只修桌機] → 在 tasks 與 spec scenario 內明列手機/平板/桌機的驗收點。
