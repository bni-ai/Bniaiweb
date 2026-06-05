## Context

▋ 審查範圍

審查時間：2026-06-03。對象為工作區未提交變更（約 61 檔、+2527 / -620 行），主軸包含：`uiux-v3-final-alignment`、簡報 canvas 引擎（`presentation-canvas-authoring-parity` / `presentation-visual-editor-parity`）、三入口分割（`segment-admin-member-guest-portals`）。

▋ 驗證基線（審查當下）

• `npm run test`（vitest）：18 files、72 tests，全部通過

• `npm run build`：通過

• `npm run lint`：無 error，僅多處 `@next/next/no-img-element` warning

▋ 系統整體判斷

這套系統已從「靜態簡報頁」演進為三入口（幹部 / 會員 / 來賓）+ Supabase 資料 + 可編輯 canvas 簡報引擎。本輪最有價值的架構決策是把 `slide_order.editor`（底圖、文字層）接到公開播放：`toRuntimeDeck` → `EditorSlideFrame`，讓後台編輯與前台播放共用同一版面。

同時存在多個並行 Spectra change 與大量未提交 diff，功能方向合理，但 review / rollback 成本高——應把本輪視為「簡報引擎 v2 + UI v3」而非單純換皮。

## Goals / Non-Goals

**Goals:**

• 把 code review 發現項收斂成 Spectra 契約與可驗證任務

• 優先修復安全與資料正確性（Server Action 授權、`return_to`、靜默少頁）

• 降低簡報雙軌渲染與破壞性操作風險

**Non-Goals:**

• 不在本 change 內完成 `presentation-canvas-authoring-parity` 的全部功能缺口

• 不重寫整套 auth（例如全面改 JWT `app_role` claim）；先補 Server Action 防線

• 不處理 `globals.css` +756 行的設計系統重構（僅記技術債）

• 不強制本 change 內跑完整 e2e（除非任務明確要求）

## Code Review Findings（SSOT）

以下為 2026-06-03 review 原文結構化版本，apply 時以此為準。

▋ 高風險

**1. Server Actions 幾乎沒做授權，全靠 middleware + `sb-role` cookie**

`lib/actions/presentations.ts` 等大量使用 `createAdminClient()`（service role），未呼叫 `getSessionRole()` 或驗證 Supabase session。Middleware 只擋 `/admin/*` 頁面導航；Server Action 仍可能被直接 POST 觸發（Next.js 有 origin 檢查，但不是完整 RBAC）。

`sb-role` 在 `app/auth/callback/route.ts` 設定且 httpOnly，但 `middleware.ts` 完全信任此 cookie，未與 Supabase JWT 綁定。DevTools 手動改 cookie 在實務上仍可能繞過（尤其內部環境）。

建議：每個 destructive action 開頭 `assertAdminSession()`——驗 Supabase user + `members.role`，不要只信 cookie。

**2. `returnTo` 開放重導向**

`publishPresentationAction` / `unpublishPresentationAction` 對 `formData.get("return_to")` 直接 `redirect(returnTo)`，無白名單。表單被篡改時可能 open redirect。

建議：限制同 origin 且路徑以 `/admin/` 開頭。

**3. 公開簡報路徑對所有人開放（by design，需知情）**

`lib/access-control.ts` 對 `/presentation/*` 設 `allow: true`。已發布週次簡報本應公開；草稿預覽在 `/admin/presentations/[id]/preview`，靠 admin middleware。若 Server Action 未補授權，預覽資料仍可能經 action 被拉取。

▋ 中風險

**4. 兩套 slide 渲染並存**

公開頁：`RevealRuntime` → `DeckRuntime` → `EditorSlideFrame`。`lib/presentation/viewer.tsx` 的 `renderPresentationSlides()` 仍用舊 `CoverSlide` / `MemberSlide` 等，目前 grep 無其他引用，屬死碼風險——改 A 顯示 B。

**5. 資料缺了會靜默少頁**

`resolveRuntimeSlide` 找不到 member/keynote 等回 `null`，`toRuntimeDeck` 的 `flatMap` 直接濾掉。幹部存完以為 20 頁，播放可能 15 頁且無 error。

**6. 「重新產生」會洗掉 canvas 編輯**

`regeneratePresentationAction` 整包重跑 `buildSlideOrder`，客製底圖/文字層可能全沒；按鈕旁確認不足。

**7. webp 前後不一致**

`canvas-editor.tsx` accept 含 webp，`assertImageFile` 只收 JPG/PNG——選 webp 會 server 500。

**8. publish 沒 `return_to` 時不 redirect**

有 `returnTo` 才 `redirect`；否則靜默結束，使用者可能以為沒存到。

▋ 低風險 / 技術債

• `globals.css` 一次 +756 行，token 集中單檔，長期維護成本高

• `JSON.parse` 在 `saveSlideOrderAction` / workbench 無 try/catch，壞 payload → 500

• Lint 僅 `<img>` 警告，非 blocker

• `createServerClient` 的 `setAll` try/catch 正確，修 Server Component cookie write 問題（值得保留）

▋ 建議修復優先序

1. Server Action admin session 驗證

2. `return_to` 白名單

3. 簡報 missing slide 儲存/預覽警告

4. webp 一致性、死碼清理、regenerate 確認（可下一輪）

## Decisions

▋ D1. 授權：Server Action 為第二道防線

• 選擇：新增 `assertAdminSession()`，在 `lib/actions/*` 寫入路徑開頭驗證 Supabase user + member role

• 不選：僅加強 middleware（無法擋直接 action 呼叫）

• 不選：全面改為 RLS + anon client（範圍過大）

▋ D2. `return_to`：路徑白名單

• 允許：同 origin、pathname 以 `/admin/` 開頭的相對路徑

• 拒絕：外部 URL、`//`、`\`、非 admin 敏感路徑

▋ D3. 簡報：單一 runtime 路徑

• 正式播放與預覽一律 `toRuntimeDeck` + `EditorSlideFrame`

• `renderPresentationSlides` 標 deprecated 後移除或僅測試保留

▋ D4. Missing slide：可觀測失敗

• 儲存後或預覽頁列出 `slide_order` 中無法 resolve 的 entry（type + id）

• 不阻擋儲存（避免例會前卡住），但必須可見

## Implementation Contract

▋ Behavior

• 未登入或非 admin 呼叫 admin Server Action 時，必須拒絕（throw 或 redirect 至 `/login`），且不得執行 service role 寫入

• `return_to` 僅能導向 `/admin/*` 同站路徑；非法值 fallback 至當前簡報編輯頁

• `publishPresentationAction` 成功後一律 redirect（有合法 `return_to` 用其值，否則 `/admin/presentations/{id}?published=1`）

• 簡報預覽/編輯 UI 在存在 unresolved slide 時顯示警告清單（至少 type、id、原因）

• 底圖上傳：前端 accept 與 server `assertImageFile` 一致

▋ Interface / data shape

• 新增 `assertAdminSession(): Promise<{ email: string; memberId: string }>`（或等價），供 actions 共用

• 新增 `sanitizeAdminReturnTo(value: string | null, fallback: string): string`

• 新增 `collectUnresolvedSlides(slideOrder, deck): Array<{ type, id?, reason }>`（名稱可調，行為固定）

▋ Failure modes

• 授權失敗：明確錯誤訊息，不洩漏 DB 細節

• 非法 `return_to`：silent fallback 至 fallback 路徑，不 open redirect

• unresolved slide：warning 非 blocking error

▋ Acceptance criteria

• 單元測試：`sanitizeAdminReturnTo` 拒絕 `https://evil.com`、`//evil`、`/dashboard`

• 單元測試：`collectUnresolvedSlides` 對缺 member id 回傳項目

• `npm run test`、`npm run build` 通過

• 手動：非 admin session 無法透過 publish action 改 status（需實測或 e2e）

▋ Scope boundaries

**In scope:** 上述四類修復 + 死碼標記/移除 + regenerate 確認 UX

**Out of scope:** canvas 全功能 parity、三入口完整分割、CSS 拆分、全面 JWT claim 重構

## Risks / Trade-offs

• [Risk] `assertAdminSession` 每 action 多一次 DB 查詢 → [Mitigation] 共用 helper、僅寫入 action 呼叫

• [Risk] 移除 `renderPresentationSlides` 若有隱藏引用 → [Mitigation] grep + test 後再刪

• [Risk] warning 過多造成幹部焦慮 → [Mitigation] 文案說明可 regenerate 或補資料

## Migration Plan

1. 先合併 `assertAdminSession` 與 `return_to` 白名單（可獨立 PR）

2. 再加 missing slide warning 與 webp 對齊

3. 最後清理死碼與 regenerate 確認

Rollback：各項可獨立 revert，無 schema 變更。

## Open Questions

• 是否要在 middleware 同步驗證 Supabase session 與 `sb-role` 一致？（範圍較大，暫不納入本 change）

• `renderPresentationSlides` 是否仍有文件/測試依賴需保留？

• 多個並行 change（`presentation-canvas-authoring-parity` 等）與本硬化 change 的 merge 順序由老闆決定
