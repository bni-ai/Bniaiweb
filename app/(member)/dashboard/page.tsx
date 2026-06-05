import Link from "next/link";

import { BriefIcon, CheckIcon, ClockIcon, MoneyIcon } from "../../../components/layout/bni-icons";
import { getMemberDashboardData, getMemberMonthlySignals } from "../../../lib/actions/member-portal";

function getWeekSubtitle(weekDate: string) {
  return `${weekDate} · 本週會員節奏`;
}

export default async function DashboardPage() {
  const [{ member, weekDate, brief, locked, deadlineAt }, signals] = await Promise.all([
    getMemberDashboardData(),
    getMemberMonthlySignals(),
  ]);
  const status = brief?.status === "submitted" ? "已提交" : brief ? "草稿" : "未開始";
  const completedTasks = [
    brief?.status === "submitted",
    Boolean(signals.monthlyReferrals),
    Boolean(signals.oneOnOnesCompleted),
    Boolean(signals.trainingCredits),
  ].filter(Boolean).length;
  const completion = Math.round((completedTasks / 4) * 100);
  const displayName = member?.chinese_name || "會員";

  return (
    <>
      <div className="od-content-header">
        <div>
          <div className="od-section-label">會員入口</div>
          <h1>{`早安，${displayName}`}</h1>
          <div className="od-subtle text-sm">{getWeekSubtitle(weekDate)}</div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-2">
            {member?.specialty_title || "登入 Email 尚未在會員名冊中。"}
            {member?.company_name ? ` · ${member.company_name}` : ""}
          </p>
        </div>
        <div className="od-header-actions">
          <Link className="od-soft-button" href="/dashboard/report">新增本週投稿</Link>
          <Link className="od-primary-button" href="/dashboard/report">送出週報</Link>
          <Link className="od-ghost-button" href="/dashboard/one-on-one">安排一對一</Link>
        </div>
      </div>

      <section className="od-kpi-grid">
        <article className="od-metric-card">
          <div className="od-metric-meta">
            <span>本週任務完成率</span>
            <span className="od-icon-wrap"><CheckIcon /></span>
          </div>
          <div className="od-metric-value">{completedTasks} / 4</div>
          <div className="od-progress-line"><span style={{ width: `${completion}%` }} /></div>
          <div className="od-metric-foot">
            <span className={completedTasks >= 4 ? "od-status-pill ok" : "od-status-pill warn"}>{completedTasks >= 4 ? "已完成" : `尚缺 ${4 - completedTasks} 項`}</span>
            <span>每週簡報、一對一、引薦、訓練</span>
          </div>
        </article>

        <article className="od-metric-card">
          <div className="od-metric-meta">
            <span>本週簡報</span>
            <span className="od-icon-wrap"><BriefIcon /></span>
          </div>
          <div className="od-metric-value">{status}</div>
          <div className="od-metric-foot">
            <span className={status === "已提交" ? "od-status-pill ok" : "od-status-pill warn"}>{locked ? "本週已鎖定" : "截止前可修改"}</span>
            <span>{new Date(deadlineAt).toLocaleString("zh-TW", { dateStyle: "short", timeStyle: "short" })} 截止</span>
          </div>
        </article>

        <article className="od-metric-card">
          <div className="od-metric-meta">
            <span>本月引薦</span>
            <span className="od-icon-wrap"><MoneyIcon /></span>
          </div>
          <div className="od-metric-value">{signals.monthlyReferrals}</div>
          <div className="od-metric-foot">
            <span className="od-status-pill info">本月新增</span>
            <span>以邀約來賓資料估算</span>
          </div>
        </article>

        <article className="od-metric-card">
          <div className="od-metric-meta">
            <span>1-to-1 進度</span>
            <span className="od-icon-wrap"><ClockIcon /></span>
          </div>
          <div className="od-metric-value">{signals.oneOnOnesCompleted ?? 0}</div>
          <div className="od-metric-foot">
            <span className="od-status-pill info">本月完成</span>
            <span>培訓學分 {signals.trainingCredits ?? 0}</span>
          </div>
        </article>
      </section>

      <section className="od-cta-grid">
        <article className="od-cta-card">
          <div className="od-cta-top">
            <div className="od-cta-title">
              <strong>本週提交中心</strong>
              <span>把會員每週最常做的動作集中在一張卡，不再四處找入口。</span>
            </div>
            <span className={status === "已提交" ? "od-status-pill ok" : "od-status-pill warn"}>{status}</span>
          </div>
          <div className="od-split-stat">
            <div className="od-sub-stat">
              <strong>週報草稿</strong>
            <span>{brief?.have_this_week || "尚未填寫本週成果與需求。"}</span>
            </div>
            <div className="od-sub-stat">
              <strong>想要的引薦</strong>
              <span>{brief?.want_this_week || "尚未填寫本週希望取得的引薦。"}</span>
            </div>
          </div>
          <div className="od-inline-actions">
            <Link className="od-primary-button" href="/dashboard/report">完成週報並送出</Link>
            <Link className="od-ghost-button" href="/dashboard/profile">查看會員資料</Link>
          </div>
        </article>

        <article className="od-cta-card">
          <div className="od-cta-top">
            <div className="od-cta-title">
              <strong>本週提醒</strong>
              <span>把真正要處理的事情排在前面。</span>
            </div>
          </div>
          <div className="od-list">
            <Link className="od-list-row" href="/dashboard/report">
              <span className={status === "已提交" ? "od-status-pill ok" : "od-status-pill warn"}>{status === "已提交" ? "完成" : "待辦"}</span>
              <div className="od-list-copy">
                <strong>完成本週簡報</strong>
                <span>{locked ? "本週已鎖定，只能檢視。" : "截止前仍可修改與送出。"}</span>
              </div>
              <span className="od-mini-note od-mono">今天</span>
            </Link>
            <Link className="od-list-row" href="/dashboard/one-on-one">
              <span className="od-status-pill info">提醒</span>
              <div className="od-list-copy">
                <strong>安排本週一對一</strong>
                <span>目前本月完成 {signals.oneOnOnesCompleted ?? 0} 次，從預約頁補上紀錄。</span>
              </div>
              <span className="od-mini-note od-mono">18:00</span>
            </Link>
            <Link className="od-list-row" href="/dashboard/directory">
              <span className="od-status-pill ok">入口</span>
              <div className="od-list-copy">
                <strong>查看會員通訊錄</strong>
                <span>尋找本週可引薦對象與會談機會。</span>
              </div>
              <span className="od-mini-note od-mono">本週</span>
            </Link>
          </div>
        </article>
      </section>

      <section className="od-two-col">
        <article className="od-table-card">
          <div className="od-table-top">
            <div className="od-table-title">
              <strong>本週工作流</strong>
              <span>讓會員照例會前後順序完成必要動作。</span>
            </div>
            <div className="od-inline-actions">
              <Link className="od-ghost-button" href="/dashboard/events">活動</Link>
              <Link className="od-ghost-button" href="/dashboard/training">訓練</Link>
            </div>
          </div>
          <div className="od-table-wrap">
            <table className="od-table">
              <thead>
                <tr>
                  <th>項目</th>
                  <th>狀態</th>
                  <th>入口</th>
                  <th>備註</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="od-cell-main">
                      <strong>本週簡報</strong>
                      <span>成果、需求、想要的引薦</span>
                    </div>
                  </td>
                  <td><span className={status === "已提交" ? "od-status-pill ok" : "od-status-pill warn"}>{status}</span></td>
                  <td><Link className="od-ghost-button" href="/dashboard/report">填寫</Link></td>
                  <td>{locked ? "本週已鎖定" : "截止前可修改"}</td>
                </tr>
                <tr>
                  <td>
                    <div className="od-cell-main">
                      <strong>一對一會談</strong>
                      <span>預約、確認與會後紀錄</span>
                    </div>
                  </td>
                  <td><span className="od-status-pill info">{signals.oneOnOnesCompleted ?? 0} 次完成</span></td>
                  <td><Link className="od-ghost-button" href="/dashboard/one-on-one">安排</Link></td>
                  <td>確認後產生站內視訊入口</td>
                </tr>
                <tr>
                  <td>
                    <div className="od-cell-main">
                      <strong>會員資料與引薦</strong>
                      <span>專長、GAINS、前十名客戶、人脈圈</span>
                    </div>
                  </td>
                  <td><span className="od-status-pill ok">已接資料流</span></td>
                  <td><Link className="od-ghost-button" href="/dashboard/profile">維護</Link></td>
                  <td>{member?.specialty_title || "請補齊專業職稱"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article className="od-panel">
          <div className="od-panel-top">
            <div className="od-panel-title">
              <strong>功能狀態</strong>
              <span>維持功能真實，不用靜態假資料。</span>
            </div>
          </div>
          <div className="od-list">
            <Link className="od-list-row" href="/dashboard/profile">
              <span className="od-status-pill ok">資料</span>
              <div className="od-list-copy">
                <strong>會員身份已串接</strong>
                <span>右上角與 sidebar 會使用登入者資料顯示姓名、角色與頭像。</span>
              </div>
            </Link>
            <Link className="od-list-row" href="/dashboard/ai">
              <span className="od-status-pill info">AI</span>
              <div className="od-list-copy">
                <strong>AI 助手入口</strong>
                <span>摘要、投稿潤稿與講稿整理維持輔助角色。</span>
              </div>
            </Link>
          </div>
        </article>
      </section>

      <section className="od-three-col">
        <article className="od-agenda-card">
          <div className="od-panel-title">
            <strong>會前準備</strong>
              <span>例會前優先完成每週簡報與引薦更新</span>
          </div>
          <div className="od-timeline">
            <div className="od-timeline-row">
              <div className="od-timeline-time">D-2</div>
              <div className="od-timeline-body">
                <strong>填寫本週簡報</strong>
                <span>讓幹部能整理簡報包。</span>
              </div>
            </div>
            <div className="od-timeline-row">
              <div className="od-timeline-time">D-1</div>
              <div className="od-timeline-body">
                <strong>確認一對一與來賓</strong>
                <span>補齊會前追蹤資料。</span>
              </div>
            </div>
          </div>
        </article>

        <article className="od-agenda-card">
          <div className="od-panel-title">
            <strong>分會資源</strong>
            <span>活動、訓練與會員成長</span>
          </div>
          <div className="od-list">
            <Link className="od-list-row" href="/dashboard/events">
              <span className="od-status-pill info">活動</span>
              <div className="od-list-copy">
                <strong>近期活動</strong>
                <span>查看分會與跨分會活動。</span>
              </div>
            </Link>
            <Link className="od-list-row" href="/dashboard/training">
              <span className="od-status-pill ok">訓練</span>
              <div className="od-list-copy">
                <strong>培訓紀錄</strong>
                <span>目前累積 {signals.trainingCredits ?? 0} 學分。</span>
              </div>
            </Link>
          </div>
        </article>

        <article className="od-agenda-card">
          <div className="od-panel-title">
            <strong>人脈工具</strong>
            <span>把引薦準備接到會員資料</span>
          </div>
          <div className="od-list">
            <Link className="od-list-row" href="/dashboard/gains">
              <span className="od-status-pill info">GAINS</span>
              <div className="od-list-copy">
                <strong>更新 GAINS</strong>
                <span>讓其他會員更容易理解你的需求。</span>
              </div>
            </Link>
            <Link className="od-list-row" href="/dashboard/top-clients">
              <span className="od-status-pill ok">客戶</span>
              <div className="od-list-copy">
                <strong>前十名客戶</strong>
                <span>沉澱可引薦樣貌與對象。</span>
              </div>
            </Link>
          </div>
        </article>
      </section>
    </>
  );
}
