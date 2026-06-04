## Context

目前 `auth-login-hardening` 已把登入基線修到可用，但系統仍缺少完整帳號生命週期。使用者可以登入，卻還不能自助註冊、忘記密碼，Google OAuth 回跳也沒有被正式定義成依角色與狀態導向。結果是管理員仍要手動建立帳號、協助綁定、處理忘記密碼，營運上會多一層人工。

這次設計需要同時考慮三種身份：正式會員／管理員、已邀請來賓、以及剛自助註冊但尚未核准的人。使用者剛註冊後不能直接拿到正式會員權限，但也不該再被當成完全未知帳號導回錯誤頁。這代表 auth callback、middleware、後台成員管理與 guest/pending 的邊界都要一起被寫清楚。

## Goals / Non-Goals

**Goals:**

- 定義可自助完成的註冊、忘記密碼、重設密碼與重新登入流程。
- 定義新帳號的預設低權限狀態，讓使用者可先登入並看到待審核狀態。
- 定義管理員如何在後台審核並把低權限帳號升為 `member` 或 `admin`。
- 收斂 Google OAuth 與其他登入入口在 callback 後的統一 redirect 契約。

**Non-Goals:**

- 不在本次引入新的外部 auth provider 或改寫成 Better Auth。
- 不處理收費、邀請碼、分會同步、或跨組織帳號治理。
- 不把任何自助註冊者自動升為正式會員；升權仍由管理員決定。

## Decisions

### D1. 自助註冊後先落為低權限可登入狀態，而不是直接給 member

新帳號建立後，不直接寫入正式會員角色，而是先落在低權限狀態。這個狀態在產品語意上接近 `guest/pending`：可以登入、可以看見待審核說明與基礎入口，但不能進 `/dashboard` 或 `/admin`。

這樣做的理由是符合你現在的營運邏輯：使用者可以先自己建立帳號，但正式會員與管理員權限仍由後台核准。相比完全開放自動成為會員，這個方案風險較低，也較接近既有 guest boundary。

### D2. 忘記密碼走獨立 password recovery flow，不再假設 magic link 足以取代

既然登入頁已支援 email/password，系統就必須提供相對應的忘記密碼流程。這條流程包含：輸入 email 送出 reset 指示、使用 token 進入重設頁、設定新密碼、完成後返回登入頁。

不採用「叫使用者改用 magic link 登入」來取代忘記密碼，因為那會讓 password 登入名義上存在、實際上卻缺少必要恢復能力，產品體驗不完整。

### D3. OAuth callback 以身份解析結果決定 redirect，而不是回首頁

任何登入入口完成後，callback 都應先解析帳號狀態，再決定導向：

1. `admin` → `/admin`
2. `member` → `/dashboard`
3. `guest/pending` → `/guest` 或待審核說明頁
4. 完全未知且不屬於任何可接受低權限帳號 → `/error`

這樣做可以把目前「Google 登入後回首頁」的模糊行為收斂成正式契約，也讓 password、Google、GitHub、magic link 共用同一套路由結果。

### D4. 後台審核與升權沿用既有成員管理表面，而不是另開獨立營運系統

待審核帳號與角色升級先整合在既有 admin members surface，或其鄰近的 approvals surface，而不是另做一套新後台。管理員應能看到：帳號 email、註冊來源、目前狀態、是否已綁 member 資料、可升級為的角色。

這樣做可以把你要的「先自己註冊、後台再核權」落在現有營運路徑中，避免多養一套審核工具。

### D5. 待審核帳號採用 `pending_member` 作為獨立 role，而不是借用 `guest` 或加欄位

決定採用獨立 `pending_member` role 值。理由：語意清楚，不與受邀來賓（`guest`）混用；middleware 和 callback 可直接用 role 值判斷，不需額外狀態欄位。
DB 影響：`members.role` 新增 `pending_member` 枚舉值；後台審核動作將 role 從 `pending_member` 升級為 `member` 或 `admin`。

### D6. 會員與來賓走兩條完全獨立的註冊路徑

**來賓路徑**：公開頁面，任何人可直接填表，完成後取得 `guest` 身份，只能進 `/guest`。

**會員路徑**：由 admin 對特定 email 產生一次性邀請連結（含 token），收到連結的人才能看到會員申請表，完成後成為 `pending_member`，等待 admin 審核升權。

這個設計解決兩個問題：(1) 來賓和會員不會走同一入口造成身份衝突；(2) 即使會員申請連結外流，token 一次性 + 有期限，陌生人無法重複使用。
`/register` 頁面若無有效 token，SHALL 顯示無法申請的說明，不得暴露申請表單。

### D7. 來賓升級為會員由 admin 在後台直接操作，不需要來賓重新填表

若現有 `guest` 身份的使用者日後要成為正式會員，流程為：admin 在後台成員管理頁找到該來賓 → 直接升權為 `member` 或 `admin`。
來賓本人不需要點連結或重新填申請表。這與 D6 的會員邀請連結是兩條不同路徑，互不干擾。

## Implementation Contract

### Observable behavior

- 未登入使用者在 `/login` 可看見登入入口與註冊／忘記密碼入口。
- 新使用者完成註冊後，系統 SHALL 建立可登入帳號，但 SHALL NOT 直接授予 `member` 或 `admin` 權限。
- 低權限新帳號登入後，系統 SHALL 導向明確的待審核狀態，而不是首頁或錯誤頁。
- 已有帳號使用忘記密碼流程後，系統 SHALL 允許其設定新密碼並重新登入。
- Google OAuth、email/password、magic link、GitHub（若啟用）完成後，系統 SHALL 依角色／狀態導向正確入口。
- 管理員在後台核准後，使用者下一次登入或刷新授權狀態時 SHALL 進入對應的 `member` 或 `admin` 入口。

### Interface / data shape

- `/login` 保持為未登入入口，但 UI 將暴露 `signup` 與 `forgot password` 導向。
- 新增註冊與密碼恢復相關 route surface，例如 signup page、forgot password page、reset password handler。
- 角色解析 helper 除了 `admin`、`member`、`guest`，還需要能表達「可登入但待審核」的狀態，實作上可映射到低權限角色或附加審核欄位。
- 後台審核表面需能執行至少兩種動作：核准成 `member`、核准成 `admin`；若拒絕，也需保留可被解釋的狀態。

### Failure modes

- 註冊 email 已存在：系統 SHALL 顯示可讀錯誤，不得建立重複帳號。
- 忘記密碼 email 不存在或 token 無效：系統 SHALL 顯示可讀訊息，不丟 raw exception。
- OAuth 完成但身份無法解析：系統 SHALL 依契約導向待審核或錯誤頁，不得回首頁。
- 後台核權失敗或狀態不一致：系統 SHALL 保持原有低權限狀態，不得部分升權。

### Acceptance criteria

- spec 覆蓋註冊、忘記密碼、待審核導向、後台升權與 middleware 邊界。
- focused tests 能覆蓋 password recovery、signup success/failure、OAuth redirect、approval promotion。
- manual smoke 能確認：新帳號註冊後不直接成為會員；管理員核准後可導向正確入口。

### Scope boundaries

- In scope：會員邀請連結產生與 token 驗證、來賓公開註冊、忘記密碼、重設密碼、OAuth redirect、待審核狀態、後台升權（含來賓直接升為會員）。
- Out of scope：對外收費、CRM 同步、完全自動會員核准、社群登入 provider 後台教學、跨組織帳號治理。

## Risks / Trade-offs

- [Risk] 低權限狀態若直接借用 `guest`，可能混淆「受邀來賓」與「待審核會員」語意 → Mitigation：在 spec 中明確區分 invited guest 與 self-registered pending account 的文案與後台狀態欄位。
- [Risk] 後台成員管理表面若同時承擔審核功能，可能讓既有 members UI 變複雜 → Mitigation：允許使用專用 approvals 子頁，但仍維持在 admin members workflow 內。
- [Risk] 舊有 unknown-user error path 會和新 pending path 互相衝突 → Mitigation：先定義身份解析優先序，再由 callback 與 middleware 共用。

## Migration Plan

1. 先擴充 specs，明確定義 signup / reset / approval 契約。
2. 再決定低權限帳號在資料模型中的表達方式與 callback 解析優先序。
3. 實作登入頁入口、註冊與密碼恢復 surface。
4. 實作後台審核與升權動作。
5. 跑 focused tests、manual auth smoke，再決定是否推 preview。

## Open Questions

### 已關閉

**OQ1：待審核帳號資料模型** → 決定採用 `pending_member` 作為獨立 role 值（方案 B）。
理由：語意清楚，不與「受邀來賓（guest）」混用；middleware 和 callback 可直接用 role 值判斷，不需額外欄位。
DB 影響：`members.role` 新增 `pending_member` 枚舉值；後台審核動作將 role 從 `pending_member` 升級為 `member` 或 `admin`。

**OQ2：自助註冊 email 限制** → 由 D6 決策取代，不需要 email 白名單。
會員申請改走邀請連結制（token-gated），入口管控在連結本身而非 email 白名單；來賓公開頁面全面開放，admin 人工審核。

（所有 Open Questions 已關閉）
