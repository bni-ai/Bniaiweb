# Bniaiweb 共同開發守則

這份文件是給共同開發者看的。

目標只有三件事：

1. 不要互相蓋掉彼此的修改
2. 不要讓 GitHub 跟正式站不同步
3. 任何人都能快速知道「現在到底有沒有上線」

## 專案事實

- GitHub Repo：`https://github.com/bni-ai/Bniaiweb`
- 正式站：`https://bni-ai-web.vercel.app/`
- Vercel Project：`bni-ai-web`
- 正式發佈分支：`main`

## 標準協作流程

請固定照這個流程走：

1. 從最新 `main` 拉下來
2. 開自己的 branch
3. 在 branch 上開發
4. 本機先驗證
5. Push branch 到 GitHub
6. 開 Pull Request 到 `main`
7. Review 完再 merge
8. Merge 後等 Vercel 自動部署 production
9. 檢查正式站是否已切到該版本

## Branch 規則

- 不要把日常開發直接做在 `main`
- 功能、修 bug、文件更新，都開 branch
- branch 名稱建議：
  - `feat/...`
  - `fix/...`
  - `docs/...`
  - `chore/...`

例子：

- `feat/member-invite-flow`
- `fix/password-reset`
- `docs/collaboration-guardrails`

## Commit 規則

- 請寫清楚 commit message
- 建議用 conventional commits

例子：

- `feat(auth): add member invite signup flow`
- `fix(auth): repair password reset callback`
- `docs(repo): add collaboration rules`

## Pull Request 規則

每個 PR 至少要說清楚：

- 這次改了什麼
- 為什麼要改
- 怎麼驗證
- 會不會影響正式站

不要只寫：

- `update`
- `fix bug`
- `misc changes`

## 發佈規則

正常情況下，production 只接受這條路：

`GitHub main -> Vercel 自動部署 -> 正式站`

這是標準路徑。

### 不建議的做法

不要把「本機還沒 commit / 還沒 push 的 dirty code」直接手動 deploy 到 production 當成常態。

原因很簡單：

- 線上版本會和 GitHub 不一致
- 其他人不知道現在正式站是哪個版本
- 之後回查 bug 很痛苦

### 什麼時候可以手動 deploy

只有在明確知道自己在做什麼時才可以，例如：

- 緊急 hotfix
- GitHub 自動部署故障
- 需要先驗證 Vercel 環境問題

如果有手動 deploy，執行的人必須補做兩件事：

1. 把相同內容 commit 到 GitHub
2. 再讓 GitHub `main` 重新觸發一次正式部署，收斂回一致狀態

## 上線完成怎麼判斷

不要靠感覺，要看 3 個條件：

1. GitHub `main` 已經有目標 commit
2. Vercel 最新 production deployment 狀態是 `READY`
3. 那筆 deployment 的 commit SHA 跟 GitHub `main` 最新 commit 一樣

三個都成立，才叫「真的已上線」。

## 最小檢查清單

在你說「好了，可以上線」之前，至少檢查：

1. `git status --short`
2. `git branch --show-current`
3. GitHub PR 已 merge 到 `main`
4. Vercel deployment 狀態是 `READY`
5. `https://bni-ai-web.vercel.app/` 打得開

## 出問題時先看哪裡

### 情況 1：GitHub 有新 code，但網站沒變

先看：

- Vercel 最新 deployment 是否還在 `BUILDING`
- Vercel 是否 `ERROR`
- latest deployment commit SHA 是否真的是你剛 merge 的那筆

### 情況 2：網站變了，但 GitHub 找不到對應 commit

這通常代表有人做了手動 production deploy。

處理方式：

1. 先確認是哪個 deployment
2. 確認那次 deploy 的內容是否要保留
3. 把相同內容補回 GitHub
4. 再從 GitHub `main` 重新部署一次

### 情況 3：多人同時改同一區塊

做法：

1. 不要各自直接推 `main`
2. 用 PR 先看 diff
3. 先解決衝突，再 merge

## 建議分工

- UI / UX 改動：PR 內附截圖
- Auth / DB / 權限改動：PR 內寫驗證方式
- Production data 變更：PR 或說明裡寫清楚改了哪些資料
- 文件更新：同步更新 README / CONTRIBUTING / 相關 DOCS

## 共同開發的底線

- 不要偷偷改 production
- 不要讓正式站和 GitHub 長期不一致
- 不要把測試資料留在線上
- 不要 merge 自己都沒驗證過的改動

## 一句話版本

開 branch、發 PR、merge 到 `main`、等 Vercel `READY`、再說已上線。
