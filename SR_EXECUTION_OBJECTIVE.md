# Bniaiweb SR 執行目標與對齊圖（基地 + UI 先行）

日期：2026-06-02

## 1) 總目標（你要的版本）

在不互相打架的前提下，分階段完成：
- 基地層（Next.js + Supabase + Auth + RBAC + 路由骨架）
- 前台（member）
- 後台（admin）
- 公開簡報（presentation）
- 可驗收、可回歸、可持續擴充

> 說明：無法保證「零 bug」，但可以做到「每階段可控、可驗收、出 bug 可快速定位並開新 SR 修復」。

---

## 2) SR 排程（先後順序，不互踩）

1. `app-foundation`
2. `bni-chapter-platform`（只做 shared schema，例如 2.13/2.14）
3. `landing-page`
4. `member-module`（先 profile/one-on-one）
5. `member-portal`（dashboard/report/directory）
6. `admin-backend`
7. `presentation-engine`
8. `bni-chapter-platform`（最後只做 integration/E2E/rollout 驗收）

---

## 3) 分工邊界（避免 SR 互相覆寫）

| 範圍 | Owner SR | 非 Owner SR 原則 |
|---|---|---|
| auth / RBAC / middleware / route skeleton | app-foundation | 不改底層規則，只 consume |
| shared schema | bni-chapter-platform（前段） | 功能 SR 不另開同名 schema |
| member profile/1on1/training/events/ai | member-module | 其他 SR 不重做同頁 |
| member dashboard/report/directory | member-portal | 其他 SR 僅串接，不重實作 |
| admin 全區（submission/presentation/...） | admin-backend | 其他 SR 不重做 admin page |
| presentation viewer/builder/components | presentation-engine | 其他 SR 不重做 slide engine |
| cross-module 驗收 | bni-chapter-platform（後段） | 只做整合，不回頭搶 owner |

---

## 4) 圖解對焦（執行流程）

```text
[Phase A 地基]
app-foundation
   -> bni-chapter-platform (schema-only)
   -> landing-page

[Phase B UI 殼]
member-module (profile/1on1先)
   -> member-portal (dashboard/report/directory)
   -> admin-backend (admin全區)

[Phase C 功能引擎]
presentation-engine

[Phase D 整合驗收]
bni-chapter-platform (integration/E2E/rollout)
```

```text
前台 (Member) ------------------------------+
 app-foundation -> member-module -> member-portal
                                            \
後台 (Admin) ------------------------------- +--> integration/E2E
 app-foundation -> admin-backend            /
                                            /
公開簡報 (Public) -------------------------+
 app-foundation -> presentation-engine
```

---

## 5) 每階段驗收 Gate（避免「做完但不能交付」）

### Gate 1：基地完成
- 能登入/登出
- role 導向正確（admin/member）
- `/dashboard`、`/admin`、`/presentation/[week-date]` 骨架可進入

### Gate 2：UI 殼完成
- member v3 導航頁都能進
- admin v3 導航頁都能進
- 路由 alias 正常轉址（舊連結不壞）

### Gate 3：核心功能完成
- 週報提交、admin submission/publish、presentation viewer 連通
- schema 與 UI 欄位一致（無斷欄）

### Gate 4：整合驗收
- `spectra analyze` 四維度為 0
- 關鍵 E2E 流程全綠
- 問題清單留痕（若有 bug，開新 SR）

---

## 6) Bug 策略（你提的做法）

可以。策略如下：
- 先交付主線可用版本（基地 + UI + 核心流程）
- 非阻斷 bug：記錄到 bug backlog，另開 SR 修
- 阻斷 bug：當下 hotfix SR，修完再回主線

這樣可保證節奏不被單點 bug 卡死。
