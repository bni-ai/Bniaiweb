# 交接檔：BNI 華AI分會管理平台

> 日期：2026-06-02
> 交接原因：context 用量 5%，開新 session 接手

## 專案位置

- 代碼：`/Users/fishtv/Development/knowledge/bni/Bniaiweb`
- GitHub：https://github.com/bni-ai/Bniaiweb（public）
- Vercel team：`bniai-s-projects`，專案名 `bni-ai-web`
- Supabase：透過 Vercel Integration 串接（`supabase-carmine-canvas`）
- `.env.local` 已建立，17 個環境變數已注入

## Spectra SDD 狀態

- Change name：`bni-chapter-platform`（已 parked）
- 執行 `spectra unpark bni-chapter-platform` 恢復
- Artifacts 全部完成：proposal.md + design.md + 12 specs + tasks.md
- Validation 通過
- **需要更新**：加入以下新需求（見下方「待更新」）

## 已完成

1. ✅ Git repo 初始化 + push 到 GitHub
2. ✅ Vercel + Supabase 串接完成
3. ✅ Spectra SDD 全套文件（proposal + design + 12 specs + tasks）
4. ✅ UI mockup v2（簡約白底風格）：
   - `ui-mockup-member.html`（會員端，7 頁）
   - `ui-mockup-admin.html`（幹部端，7 頁）
5. ✅ HTML 簡報 demo：`demo-presentation.html`（已部署到 bni-ai-presentation.vercel.app）
6. ✅ Open Slide 版簡報 demo：`bni-slide/slides/bni-meeting/index.tsx`

## 待更新到 SDD 和 mockup

### 1. 角色 vs 職掌分離

members 表需要三個欄位：
- `role`: `admin` | `member`（控制權限，admin 看得到後台）
- `position`: 主席/副主席/秘書財務/資訊組長/成長協調/活動協調/導師協調/教育協調/來賓接待/（無）
- `committee`: 導師群/接待組員/教育組員/秘財組員/資訊組員/成長組員/活動組員/會員委員/（無）

8 個職掌 + 其底下的組員 = admin 角色。其餘 = member。

### 2. 組織架構資料

```
主席：001 吳文凱
副主席：002 馬驊
秘書財務：010 何佳薇
資訊組長：027 余啟彰
成長協調：014 石惠瑩
活動協調：033 蔡晴羽
導師協調：003 林政翰
教育協調：021 康祐禎
來賓接待：029 朱展宏

導師群：006 黃郁茜、007 張泓奕
接待組員：019 林孟葦、031 陳佾
教育組員：020 許博宜、024 俞皓翔
秘財組員：012 廖人達、015 林揚軒、018 趙文聖、026 楊梓彤
資訊組員：011 鄭佑軒、023 曾亦菲、032 蘇宣齊
成長組員：030 傅菽駗、035 林渙恩
活動組員：008 周竹君、009 李銀珍、025 張喬閔、034 王丰怡
會員委員：004 林姿伶、005 王可信、013 黃華、017 陳瑄筑、016 林翰霆、022 周威武、028 何鎧伃、036 黃鈞彥
```

### 3. 會員通訊錄（前台新增功能）

- 前台 sidebar 新增「會員通訊錄」頁面
- 卡片 grid 顯示所有會員（頭像、姓名、專業、職掌 badge）
- 點進去看完整 profile（唯讀）+ [預約一對一] + [視訊通話] 按鈕
- 搜尋篩選功能

### 4. 一對一 + Jitsi 視訊

- 會員可用時段設定（member_availability 表）
- 預約流程：選人 → 比對雙方空閒 → 選時段 → 對方確認
- Jitsi Meet iframe 嵌入（Phase 1 用公開 server meet.jit.si，Phase 2 搬 Vultr VPS 自架）
- 視訊入口在：一對一預約頁 → 即將進行 → [開始視訊]
- 也可從會員通訊錄 → 某人 profile → [預約一對一]

### 5. UI mockup v2 反饋

Fish 確認的設計方向：
- 白底為主、紅色極少量點綴（logo、主要標記）
- 主按鈕：黑底白字（不是紅色）
- Sidebar：白底 + 右邊框，不用深色
- 留白大、邊框極淡 #EAEAEA
- 字型：Inter + Noto Sans TC
- 統計用橫條 progress bar，不用圓形
- Badge 用 pill 樣式 999px 圓角

Fish 說功能 OK，設計簡約方向對了。但 mockup 還需要：
- 加入會員通訊錄頁面
- 加入一對一視訊按鈕
- 會員管理加入職掌/委員會欄位
- 每個會員都要顯示自己的 position 和 committee

## 會員完整資料

Google Sheet 來源：https://docs.google.com/spreadsheets/d/14beOL_R1lyNtfPO701wUGoixTC0o9Y5hxHZlpCgjrtg/edit

已在本 session 讀取完整 36 位會員資料（含 6 位來賓 + 16 種培訓課程）。資料在 Spectra proposal.md 裡有引用。

## 技術決策摘要

| 決策 | 選擇 | 原因 |
|------|------|------|
| 框架 | Next.js 15 App Router | 獨立 SaaS，不綁 supastarter |
| DB | Supabase（透過 Vercel Integration） | 已串接完成 |
| Auth | Supabase Auth + Google OAuth | Gmail 登入 |
| 部署 | Vercel（bniai-s-projects team） | 已連結 |
| 視訊 | Jitsi Meet（Phase 1: 公開 server，Phase 2: Vultr VPS 自架） | 免費，無時間限制 |
| AI | 多 provider adapter（Claude/Gemini/OpenAI） | Fish 要求可切換 |
| 簡報 | React Server Component 渲染，公開 URL | Zoom 分享用 |
| 檔案存儲 | Supabase Storage | 照片、產品圖、演講素材 |

## 開發計劃

Fish 的流程：
1. 我出完整 UI mockup → Fish 確認
2. 更新 Spectra SDD（加新需求）
3. 開 PR
4. Fish 派 Codex 寫代碼
5. 我做驗收

## 下一步

1. 更新 mockup：加「會員通訊錄」頁面 + 職掌欄位 + 視訊按鈕
2. 更新 Spectra specs/tasks：加 member_availability 表、Jitsi 整合、通訊錄 spec
3. Fish 確認 mockup 後開始開發

## 相關檔案

- 簡報 demo（已上線）：https://bni-ai-presentation.vercel.app
- 品牌底板參考圖：`/Users/fishtv/Downloads/1/1.001.png`
- BNI 品牌設計：白底、紅色 #CC0000 點綴、灰色弧形裝飾
- Open Slide 專案：`bni-slide/`（dev server port 5175）
- Presentation Builder skill：`knowledge/6-GitHub參考/Presentation Builder.md`
