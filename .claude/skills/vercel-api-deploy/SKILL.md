---
name: vercel-api-deploy
description: "Use Vercel REST API to inspect and deploy this repo without Vercel CLI"
license: MIT
compatibility: Requires curl, jq, and repo access.
---

# Vercel API Deploy

這個 skill 專門處理 **Bniaiweb 專案的 Vercel 查詢與部署**，而且**禁止走 Vercel CLI**。

## 何時使用

- 用戶要求查目前 Vercel project / deployment / alias 狀態
- 用戶要求確認某個 `*.vercel.app` 網址屬於哪個 project
- 用戶要求把目前 repo 內容部署到 Vercel
- 用戶明確說不要走 `Vercel CLI`

## 本 repo 的固定事實

- Vercel project link 在 `.vercel/project.json`
- API token 預設從 `.env.local` 讀 `VERCEL_TOKEN`
- 此 repo 目前 linked project 是 `bni-ai-web`
- `orgId` 可能是 team，不能因為 token 是 personal 就假設 project 也是 personal

## 安全規則

- 不要把 token 原文顯示在回覆中
- 不要把 `.env.local`、`.vercel`、`.next`、`node_modules`、`coverage`、`playwright-report`、`test-results` 上傳到 deployment source
- 預設先做 **preview deployment**
- 只有用戶明確說「production」或「正式上線」才可發 production
- 若要碰 production alias，先回報目前 project / target / alias 狀態，再執行

## 先決條件檢查

1. 確認 linked project：

```bash
sed -n '1,120p' .vercel/project.json
```

2. 確認 token 存在：

```bash
sed -n 's/^VERCEL_TOKEN=//p' .env.local | tail -n 1
```

3. 若 token 不存在，停止並請用戶設定 `.env.local`

## 查詢 workflow

### 1. 取得 project / deployment 基本資訊

```bash
TOKEN=$(sed -n 's/^VERCEL_TOKEN=//p' .env.local | tail -n 1)
PROJECT_ID=$(jq -r '.projectId' .vercel/project.json)
ORG_ID=$(jq -r '.orgId' .vercel/project.json)

curl -sS -H "Authorization: Bearer $TOKEN" \
  "https://api.vercel.com/v9/projects/$PROJECT_ID" | jq .
```

### 2. 依網址或 project 查 deployment

```bash
curl -sS -H "Authorization: Bearer $TOKEN" \
  "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&limit=20" | jq .
```

若用戶提供具體網址，例如 `bni-ai-i97z4mlfr-bniai-s-projects.vercel.app`，就在回傳 JSON 裡精確比對 `url`。

### 3. 查 alias

先拿 deployment id，再查：

```bash
curl -sS -H "Authorization: Bearer $TOKEN" \
  "https://api.vercel.com/v2/deployments/$DEPLOYMENT_ID/aliases" | jq .
```

## 部署 workflow

### 原則

- **不要**用 `vercel` CLI
- 直接用 `POST /v13/deployments`
- 預設部署目前 repo 的 source files
- 預設 target 是 `preview`
- 若要 production，必須是用戶明確要求

### Source 打包規則

只上傳 repo 需要的 source：

```bash
git ls-files -co --exclude-standard
```

並排除：

- `.env.local`
- `.env*`
- `.vercel/**`
- `.next/**`
- `node_modules/**`
- `coverage/**`
- `playwright-report/**`
- `test-results/**`
- `.git/**`

若 repo 內存在大型參考資料夾、外部範例、或不屬於正式 app 的資料夾，例如 `open-slide-main/`、`huashu-design-master/`，先判斷是否屬於這次部署所需；若不是，排除。

### 建議部署前檢查

先在本機驗證最小健康度：

```bash
npm run build
```

若這次要強調品質，再加：

```bash
npm test
```

但要注意：若測試失敗是因 repo 內額外資料夾污染測試邊界，要在回報中說清楚，不可假裝 app 本體壞掉。

### 實作步驟

1. 列出要上傳的檔案
2. 為每個檔案計算 digest / size
3. 先用 `POST /v2/files` 上傳檔案
4. 再用 `POST /v13/deployments` 建立 deployment
5. 輪詢 deployment 狀態直到 `READY` 或失敗
6. 回報 deployment URL、target、alias、失敗訊息

## 回覆格式

先給白話結論，再給技術細節：

- 有沒有成功連到 Vercel API
- 查到的是哪個 project / deployment
- 這次是 preview 還是 production
- 有沒有真的部署成功
- 若失敗，失敗在 upload / create / build / alias 哪一段

## 這個 repo 的已知注意事項

- 這個 project 名稱是 `bni-ai-web`
- linked `orgId` 目前可能是 team，不要誤判成 personal project
- 先前已確認 `bni-ai-i97z4mlfr-bniai-s-projects.vercel.app` 屬於同一個 `bni-ai-web` project
- repo 內有額外目錄可能污染測試或部署邊界，部署前要主動判斷是否排除
