## Context

目前 Bniaiweb 的 Auth callback 只處理正式會員：email 在 `members` 表內就進 `/admin` 或 `/dashboard`，不在 `members` 內就進 `/error`。但 BNI 實務上有第三種人：受邀來賓。來賓不是正式會員，不能被放進 `members` 當會員，也不能使用正式會員功能；但來賓需要在會前看到分會介紹、BNI 說明、受邀資訊、邀約人、15 秒介紹準備，以及後續可瀏覽的文章與影片。

這個 SR 新增「來賓專區」，將非會員登入後的路徑從單純錯誤頁擴充為：若 email 可對應到 `guests.email` 或 `guest_visits` 所屬來賓，則進入受限來賓入口；若完全無法識別，才顯示未加入/未受邀錯誤。

## Goals / Non-Goals

**Goals:**

- 建立公開可瀏覽的來賓資訊入口，介紹分會、BNI、來賓須知、文章與影片。
- 建立登入後的來賓專區，顯示來賓自己的邀約資料、邀約會員、拜訪週次與 15 秒內容準備。
- 允許登入後來賓查看部分會員資訊，但不開放正式會員功能。
- 讓 auth callback 能根據 email 判斷正式會員、受邀來賓、未知使用者三種導向。
- 明確切出來賓權限邊界，避免來賓進入後台、會員 dashboard、一對一預約與開發中功能。

**Non-Goals:**

- 不做正式入會申請、付款、審核或會員升級流程。
- 不把來賓寫進 `members` 表作為正式會員。
- 不做完整 CMS 後台；內容管理先允許資料模型與基礎列表/顯示，後續可再擴充。
- 不開放來賓修改會員資料、預約一對一、提交週報或進入 admin。

## Decisions

### D1 — guest identity remains separate from members

來賓身份以 `guests` 與 `guest_visits` 為 SSOT，不新增 `members.role='guest'`。原因是來賓不是體制內會員，若混入 `members` 會污染會員名冊、RBAC、週報與簡報邏輯。Auth callback 會用 email 查 `members`；查不到再查 `guests`。若查到 guest，設定 `sb-role=guest` 並導向 `/guest`。

替代方案：把來賓也建立成 `members`。放棄原因：會讓來賓出現在正式會員列表、週報覆蓋率與一對一功能，後續需要大量排除條件。

### D2 — public and authenticated guest states share one portal shell

來賓入口分成公開狀態與登入後狀態：公開頁不需要 session，可看分會與 BNI 介紹；登入後頁需要 `sb-role=guest`，可看個人化邀約資料。Route 建議：公開 `/guest`，登入後仍在 `/guest` 顯示個人面板；內容列表 `/guest/content`；受限會員資訊 `/guest/members`；15 秒準備 `/guest/prepare`。

替代方案：公開頁與登入後頁完全分開。放棄原因：會讓來賓動線跳躍，且公開/登入後內容多數共享品牌與導覽結構。

### D3 — guest content uses structured records but not full CMS

文章與影片先定義 `guest_content_items`：title、summary、body、video_url、visibility、status、published_at。這讓後續可以由後台上傳或管理內容，但本 SR 只需要列表與詳情顯示，不建立完整 CMS 編輯器。

替代方案：硬編碼內容在頁面。放棄原因：之後上傳文章/影片會需要改程式碼，和需求「後續上傳」不符。

### D4 — guest member directory is intentionally limited

來賓登入後可看部分會員資訊，例如姓名、公司、專業、簡短介紹與公開聯絡方式；不可看會員 private 欄位、不可啟動一對一預約、不可進會員資料頁。UI 必須清楚標示「來賓可見資訊」。

替代方案：重用正式會員 directory。放棄原因：正式會員 directory 可能包含會員互動操作，會造成權限越界。

### D5 — guest access boundary is enforced in callback and middleware

Auth callback 負責判斷 user email 屬於 member、guest 或 unknown，middleware 負責阻擋 guest 進 `/admin`、`/dashboard`、會員互動功能。guest 可進 `/guest/*` 與公開頁；member/admin 也可進 `/guest/*` 供測試，但來賓不能反向進會員/後台。

替代方案：只靠 UI 隱藏按鈕。放棄原因：URL 直連仍會繞過 UI，權限不能只靠畫面。

## Flow Diagram

```text
公開訪客
  ↓
/guest 公開介紹頁
  ├─ 看分會介紹 / BNI 說明 / 來賓須知
  ├─ 看公開文章與影片
  └─ 點登入 Email / Google / GitHub
          ↓
      Supabase Auth
          ↓
      /auth/callback
          ↓
  ┌──────────────────────────────┐
  │ email 在 members?             │
  └──────────────┬───────────────┘
                 │是
                 ↓
          admin/member 既有流程
                 │否
                 ↓
  ┌──────────────────────────────┐
  │ email 在 guests?              │
  └──────────────┬───────────────┘
                 │是
                 ↓
          設定 sb-role=guest
                 ↓
             /guest
                 ↓
  ┌──────────────────────────────┐
  │ 來賓登入後專區                │
  ├──────────────────────────────┤
  │ 邀約人 / 拜訪週次             │
  │ 15 秒介紹準備                 │
  │ 受限會員資訊                  │
  │ 文章與影片                    │
  └──────────────────────────────┘
                 │
                 ├─ 禁止 /admin
                 ├─ 禁止 /dashboard
                 └─ 禁止 一對一預約 / 會員功能
```

## Implementation Contract

**Behavior:**

- 未登入使用者可以開啟 `/guest` 與公開內容，看到分會介紹、BNI 說明、來賓須知、公開文章與影片。
- 使用 email、Google 或 GitHub 登入後，若 email 對應 `members.email`，沿用正式會員流程。
- 若 email 不在 `members.email` 但存在於 `guests.email`，系統導向 `/guest`，顯示該來賓的邀約會員、最近/下一次拜訪日期、15 秒介紹準備提示。
- 若 email 不在 `members` 也不在 `guests`，系統導向錯誤頁，說明尚未加入或尚未受邀。
- 來賓登入後可看受限會員資訊，但不可使用 admin、member dashboard、一對一預約、週報提交或會員資料編輯。

**Interface / data shape:**

- `guest_content_items` stores public and guest-only article/video content.
- `guests.email` is the lookup key for guest auth mapping.
- `guest_visits.referrer_id` or `guests.referrer_id` identifies the inviting member.
- `sb-role=guest` cookie represents guest session access in middleware.
- `lib/actions/guest-portal.ts` loads public content, guest profile context, and limited member directory data.

**Failure modes:**

- Guest has no email: admin guest management must show that the guest cannot login until email is added.
- Guest email duplicates multiple guest rows: portal should prefer the most recent active visit and surface a warning in admin later; this SR should not silently merge identities.
- Guest has no scheduled visit: portal still shows general preparation content and asks them to contact inviter.
- Guest attempts `/admin` or `/dashboard`: middleware redirects to `/guest`.
- Content record is draft or guest-only: public users cannot see it.

**Acceptance criteria:**

1. Public `/guest` renders without login and displays BNI/分會/來賓須知 sections.
2. A guest email in `guests.email` can login and lands on `/guest` instead of `/error`.
3. Guest dashboard shows inviter, visit week, and 15 秒準備提示 when data exists.
4. Guest can open limited member directory but cannot access admin/member routes.
5. Article/video content respects public vs guest-only visibility.
6. Spectra analyze for `guest-portal` is Clean before implementation starts.

**Scope boundaries:**

- In scope: guest portal routes, guest auth mapping, guest access boundary, guest content read/display, limited member info.
- Out of scope: paid membership conversion, formal application workflow, full CMS editor, one-on-one booking, member profile editing.

## Risks / Trade-offs

- Guest email may not be collected during invitation → Admin guest flow must make email visible as a required login readiness field.
- Social login email mismatch → Portal should explain that the login email must match the invited guest email.
- Guest/member overlap → Member lookup runs before guest lookup, so a formal member always receives formal member access.
- Content scope creep → Keep content management minimal in this SR; full CMS can be a later SR.
- Cookie role drift → Middleware and callback must treat `guest` as a first-class limited role, not as anonymous.

## Migration Plan

1. Add guest content table and any needed guest metadata columns through Supabase migration.
2. Update callback role routing: member first, guest second, unknown last.
3. Update middleware to recognize guest role and guard protected routes.
4. Add guest portal pages and actions.
5. Add admin guest readiness indicators for email/login status.
6. Verify with one seeded guest email and one formal member email.

Rollback: remove guest route exposure, revert callback guest branch, keep guest data tables harmless because they do not alter `members` records.

## Open Questions

- 來賓登入是否允許 Google/GitHub，只要 provider email 等於 `guests.email` 即可，還是初期只開 Email magic link？
- 來賓可見的會員資訊欄位是否包含 email/LINE，或只顯示姓名、公司、專業？
- 文章與影片內容初期由工程直接建資料，還是後台需要簡易建立表單？
