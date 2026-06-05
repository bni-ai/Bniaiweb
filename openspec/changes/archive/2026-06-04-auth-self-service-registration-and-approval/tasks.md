## 1. 帳號生命週期基線

- [x] 1.1 落實 `Self-service registration creates a low-privilege account` 與 `D1. 自助註冊後先落為低權限可登入狀態，而不是直接給 member`，補齊 signup 與 pending 狀態模型，讓新帳號建立後可登入但不直接進 `/dashboard` 或 `/admin`；驗證：focused tests 覆蓋 signup success、duplicate email、pending redirect，並對照 `Observable behavior`、`Interface / data shape`、`Failure modes`、`Acceptance criteria` 與 `Scope boundaries`。
- [x] 1.2 落實 `Google OAuth Login`、`Route Access Control` 與 `D3. OAuth callback 以身份解析結果決定 redirect，而不是回首頁`，收斂 callback 與角色解析流程，讓 Google / password / magic link / GitHub（若啟用）都依 `admin/member/pending/unknown` 導向；驗證：callback tests 覆蓋首頁誤跳修正與未知帳號分支，並對照 `Observable behavior`、`Interface / data shape`、`Failure modes`、`Acceptance criteria` 與 `Scope boundaries`。

## 2. 密碼恢復與登入入口

- [x] 2.1 落實 `Users can request a password reset`、`Users can set a new password from a valid recovery session` 與 `D2. 忘記密碼走獨立 password recovery flow，不再假設 magic link 足以取代`，補齊 forgot-password 與 reset-password surface，讓 password 使用者可自助恢復登入；驗證：focused tests 覆蓋 reset request、invalid token、successful password reset，並對照 `Observable behavior`、`Failure modes` 與 `Acceptance criteria`。
- [x] 2.2 調整登入頁入口，讓 `/login` 同時暴露 signup、forgot password、enabled provider 入口與可讀錯誤狀態，並保留 `Logout` 的返回契約；驗證：login page tests 覆蓋入口可見性與 recovery/signup 導向，logout test 維持回到 `/login`。

## 3. 後台審核與權限升級

- [x] 3.1 落實 `Admin can approve and promote a pending account` 與 `D4. 後台審核與升權沿用既有成員管理表面，而不是另開獨立營運系統`，建立 admin approvals/member promotion surface，讓管理員可核准 pending 帳號並升成 `member` 或 `admin`；驗證：focused action tests 覆蓋 approve-as-member、approve-as-admin、failed approval，並對照 `Interface / data shape`、`Failure modes` 與 `Scope boundaries`。
- [x] 3.2 落實 `Authenticated guest dashboard`，更新低權限登入者在 guest/pending surface 的待審核文案與路由，明確區分 invited guest 與 self-registered pending account；驗證：manual smoke 與 focused route tests 覆蓋兩種低權限狀態與不同 status messaging。

## 4. 驗證與收尾

- [x] 4.1 補齊 `self-service-account-approval`、`password-recovery`、`supabase-auth`、`guest-auth-portal`、`rbac-middleware` 的 focused tests；驗證：auth focused suite 全綠且 failure message 可對應各分支。
- [x] 4.2 執行 `npm run build`、`spectra analyze auth-self-service-registration-and-approval --json`、`spectra validate auth-self-service-registration-and-approval`；驗證：build 與 Spectra checks 通過。
