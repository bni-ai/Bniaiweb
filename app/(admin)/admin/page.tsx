import Link from "next/link";

import { AlertIcon, BriefIcon, PlusIcon, UserIcon } from "../../../components/layout/bni-icons";
import { getAwards } from "../../../lib/actions/awards";
import { getMembers, parseWeekDate } from "../../../lib/actions/admin-common";
import { getGuestVisits } from "../../../lib/actions/guests";
import { getWeeklyBriefRows } from "../../../lib/actions/weekly-briefs";
import { getVpReport } from "../../../lib/actions/vp-report";

const adminLinks = [
  ["/admin/submission", "提交狀況"],
  ["/admin/guests", "來賓管理"],
  ["/admin/keynote", "8 分鐘短講"],
  ["/admin/vp-report", "VP 報告"],
  ["/admin/awards", "獎項"],
  ["/admin/presentation", "簡報管理"],
  ["/admin/members", "會員管理"],
];

function percent(done: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}

export default async function AdminHomePage({ searchParams }: { searchParams?: Promise<{ week?: string }> }) {
  const params = await searchParams;
  const weekDate = parseWeekDate(params?.week);
  const [members, briefs, guests, awards, vpReport] = await Promise.all([
    getMembers(),
    getWeeklyBriefRows(weekDate),
    getGuestVisits(weekDate),
    getAwards(weekDate),
    getVpReport(weekDate),
  ]);

  const unsubmittedRows = briefs.rows.filter((row) => row.brief?.status !== "submitted");
  const readiness = percent(briefs.submittedCount, briefs.totalCount);
  const missingProfileCount = members.filter((member) => !member.specialty_title && !member.company_name).length;

  return (
    <>
      <div className="od-content-header">
        <div>
          <div className="od-section-label">管理入口</div>
          <h1>總覽儀表板</h1>
          <div className="od-subtle text-sm">{weekDate} · 先掃描本週會務，再處理投稿、簡報與資料品質</div>
        </div>
        <div className="od-header-actions">
          <Link className="od-soft-button" href="/admin/import">匯入會員名單</Link>
          <Link className="od-primary-button" href="/admin/presentation">發布本週會議包</Link>
        </div>
      </div>

      <section className="od-kpi-grid">
        <article className="od-metric-card">
          <div className="od-metric-meta">
            <span>本週會議就緒度</span>
            <span className="od-icon-wrap"><PlusIcon /></span>
          </div>
          <div className="od-metric-value">{readiness}%</div>
          <div className="od-progress-line"><span style={{ width: `${readiness}%` }} /></div>
          <div className="od-metric-foot">
            <span className={readiness >= 80 ? "od-status-pill ok" : "od-status-pill warn"}>{unsubmittedRows.length} 位未提交</span>
            <span>{briefs.submittedCount} / {briefs.totalCount} 份 brief</span>
          </div>
        </article>

        <article className="od-metric-card">
          <div className="od-metric-meta">
            <span>投稿審核</span>
            <span className="od-icon-wrap"><BriefIcon /></span>
          </div>
          <div className="od-metric-value">{briefs.submittedCount} / {briefs.totalCount}</div>
          <div className="od-metric-foot">
            <span className="od-status-pill warn">{briefs.lateCount} 件逾期</span>
            <span>已提醒 {briefs.remindedCount} 位</span>
          </div>
        </article>

        <article className="od-metric-card">
          <div className="od-metric-meta">
            <span>來賓與 VP 報告</span>
            <span className="od-icon-wrap"><UserIcon /></span>
          </div>
          <div className="od-metric-value">{guests.length}</div>
          <div className="od-metric-foot">
            <span className="od-status-pill info">來賓確認</span>
            <span>VP 引薦 {vpReport?.total_referrals ?? 0} 筆</span>
          </div>
        </article>

        <article className="od-metric-card">
          <div className="od-metric-meta">
            <span>會員資料品質</span>
            <span className="od-icon-wrap"><AlertIcon /></span>
          </div>
          <div className="od-metric-value">{missingProfileCount}</div>
          <div className="od-metric-foot">
            <span className={missingProfileCount > 0 ? "od-status-pill warn" : "od-status-pill ok"}>需補齊欄位</span>
            <span>會員總數 {members.length}</span>
          </div>
        </article>
      </section>

      <section className="od-cta-grid">
        <article className="od-cta-card">
          <div className="od-cta-top">
            <div className="od-cta-title">
              <strong>本週營運總覽</strong>
              <span>會前 24 小時最重要的三件事：未提交追蹤、來賓名單、簡報包發布。</span>
            </div>
            <span className="od-status-pill info">例會準備中</span>
          </div>
          <div className="od-list">
            <div className="od-list-row">
              <span className="od-status-pill warn">待確認</span>
              <div className="od-list-copy">
                <strong>尚未提交：{unsubmittedRows.length} 位</strong>
                <span>先從提交狀況追未完成會員，避免簡報包缺頁。</span>
              </div>
              <Link className="od-ghost-button" href="/admin/submission">查看</Link>
            </div>
            <div className="od-list-row">
              <span className="od-status-pill info">來賓</span>
              <div className="od-list-copy">
                <strong>本週來賓：{guests.length} 位</strong>
                <span>確認介紹人、聯絡資訊與現場座位安排。</span>
              </div>
              <Link className="od-ghost-button" href="/admin/guests">補資料</Link>
            </div>
            <div className="od-list-row">
              <span className="od-status-pill ok">獎項</span>
              <div className="od-list-copy">
                <strong>本週獎項：{awards.length} 筆</strong>
                <span>獎項、VP 報告與簡報發布都接在同一個例會流程。</span>
              </div>
              <Link className="od-ghost-button" href="/admin/awards">開啟</Link>
            </div>
          </div>
        </article>

        <article className="od-cta-card">
          <div className="od-cta-top">
            <div className="od-cta-title">
              <strong>幹部快動作</strong>
              <span>高頻行政動作不再藏在深層設定。</span>
            </div>
          </div>
          <div className="od-inline-actions">
            <Link className="od-primary-button" href="/admin/presentation">發布本週簡報</Link>
            <Link className="od-ghost-button" href="/admin/guests">匯入來賓名單</Link>
            <Link className="od-ghost-button" href="/admin/submission">寄送提醒</Link>
            <Link className="od-ghost-button" href="/admin/members">下載出席表</Link>
          </div>
          <div className="od-split-stat">
            <div className="od-sub-stat">
              <strong>資料匯入</strong>
              <span>會員名單、備註與專長欄位由匯入頁維護。</span>
            </div>
            <div className="od-sub-stat">
              <strong>自動提醒</strong>
              <span>本週已提醒 {briefs.remindedCount} 位未投稿會員。</span>
            </div>
          </div>
        </article>
      </section>

      <section className="od-two-col">
        <article className="od-table-card">
          <div className="od-table-top">
            <div className="od-table-title">
              <strong>投稿與簡報發布狀態</strong>
              <span>把審核、修正、發布放在同一個掃描區，不切三個頁面。</span>
            </div>
            <div className="od-inline-actions">
              <Link className="od-ghost-button" href="/admin/submission">投稿規格</Link>
              <Link className="od-ghost-button" href="/admin/presentation">發布紀錄</Link>
            </div>
          </div>
          <div className="od-table-wrap">
            <table className="od-table">
              <thead>
                <tr>
                  <th>項目</th>
                  <th>狀態</th>
                  <th>負責資料</th>
                  <th>備註</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="od-cell-main">
                      <strong>本週 60 秒簡報包</strong>
                      <span>{briefs.totalCount} 位會員 / {briefs.submittedCount} 位已提交</span>
                    </div>
                  </td>
                  <td><span className="od-status-pill warn">{unsubmittedRows.length} 位待處理</span></td>
                  <td>提交狀況</td>
                  <td>未提交會員會影響週會簡報包完整度</td>
                </tr>
                <tr>
                  <td>
                    <div className="od-cell-main">
                      <strong>主題講者與 VP 報告</strong>
                      <span>VP 引薦、獎項與短講資料</span>
                    </div>
                  </td>
                  <td><span className="od-status-pill info">待最後確認</span></td>
                  <td>VP 報告 / 8 分鐘短講</td>
                  <td>本週 VP 引薦 {vpReport?.total_referrals ?? 0} 筆</td>
                </tr>
                <tr>
                  <td>
                    <div className="od-cell-main">
                      <strong>來賓與會員資料</strong>
                      <span>來賓接待、會員名冊、資料品質</span>
                    </div>
                  </td>
                  <td><span className="od-status-pill ok">已接資料流</span></td>
                  <td>來賓管理 / 會員管理</td>
                  <td>{guests.length} 位來賓，{missingProfileCount} 筆會員資料需補</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article className="od-panel">
          <div className="od-panel-top">
            <div className="od-panel-title">
              <strong>本週未提交成員</strong>
              <span>優先追蹤會影響簡報包的人。</span>
            </div>
          </div>
          <div className="od-list">
            {unsubmittedRows.slice(0, 5).map((row) => (
              <div className="od-list-row" key={row.member.id}>
                <span className="od-status-pill warn">待辦</span>
                <div className="od-list-copy">
                  <strong>{row.member.chinese_name}</strong>
                  <span>{row.member.specialty_title || row.member.email}</span>
                </div>
                <span className="od-mini-note od-mono">{row.remindedAt ? "已提醒" : "未提醒"}</span>
              </div>
            ))}
            {unsubmittedRows.length === 0 ? (
              <div className="od-list-row">
                <span className="od-status-pill ok">完成</span>
                <div className="od-list-copy">
                  <strong>本週全員已提交</strong>
                  <span>可以進入簡報包發布與會議流程確認。</span>
                </div>
              </div>
            ) : null}
          </div>
        </article>
      </section>

      <section className="od-three-col">
        <article className="od-agenda-card">
          <div className="od-panel-title">
            <strong>會議節奏板</strong>
            <span>用時間軸掃描例會營運是否到位</span>
          </div>
          <div className="od-timeline">
            <div className="od-timeline-row">
              <div className="od-timeline-time">06:45</div>
              <div className="od-timeline-body">
                <strong>報到與來賓接待</strong>
                <span>來賓名單與介紹人確認完成。</span>
              </div>
            </div>
            <div className="od-timeline-row">
              <div className="od-timeline-time">07:18</div>
              <div className="od-timeline-body">
                <strong>60 秒簡報輪播</strong>
                <span>依提交狀況整理發布版本。</span>
              </div>
            </div>
          </div>
        </article>

        <article className="od-agenda-card">
          <div className="od-panel-title">
            <strong>訓練與活動</strong>
            <span>教育與會員成長由同一區承接</span>
          </div>
          <div className="od-list">
            <Link className="od-list-row" href="/admin/training">
              <span className="od-status-pill info">本週</span>
              <div className="od-list-copy">
                <strong>培訓管理</strong>
                <span>維護課程與學分紀錄。</span>
              </div>
            </Link>
            <Link className="od-list-row" href="/admin/events">
              <span className="od-status-pill ok">已排</span>
              <div className="od-list-copy">
                <strong>活動管理</strong>
                <span>上架活動頁與提醒訊息。</span>
              </div>
            </Link>
          </div>
        </article>

        <article className="od-agenda-card">
          <div className="od-panel-title">
            <strong>AI 與匯入紀錄</strong>
            <span>AI 放在營運輔助，不壓過主要會務</span>
          </div>
          <div className="od-list">
            {adminLinks.slice(0, 4).map(([href, label]) => (
              <Link className="od-list-row" href={href} key={href}>
                <span className="od-status-pill info">入口</span>
                <div className="od-list-copy">
                  <strong>{label}</strong>
                  <span>已接後台路由，可直接進入操作。</span>
                </div>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
