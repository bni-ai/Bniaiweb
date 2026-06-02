import Link from "next/link";

import { Card } from "../../../components/ui/card";
import { getMemberDashboardData, getMemberMonthlySignals } from "../../../lib/actions/member-portal";

function getWeekSubtitle(weekDate: string) {
  return `${weekDate} · 本週會員節奏`;
}

export default async function DashboardPage() {
  const [{ member, weekDate, brief, locked }, signals] = await Promise.all([
    getMemberDashboardData(),
    getMemberMonthlySignals(),
  ]);
  const status = brief?.status === "submitted" ? "已提交" : brief ? "草稿" : "未開始";

  const statCards = [
    { label: "本週簡報", value: status, note: locked ? "本週已鎖定" : "截止前可繼續修改", tone: "text-primary" },
    { label: "本月引薦", value: String(signals.monthlyReferrals), note: "以本月新增邀約來賓估算", tone: "text-amber-700" },
    { label: "累積培訓學分", value: signals.trainingCredits === null ? "0" : String(signals.trainingCredits), note: signals.trainingCredits === null ? "尚無完課紀錄" : "已接 training_records", tone: "text-text-1" },
    { label: "本月一對一", value: signals.oneOnOnesCompleted === null ? "0" : String(signals.oneOnOnesCompleted), note: signals.oneOnOnesCompleted === null ? "尚無完成紀錄" : "已完成狀態的本月一對一數量", tone: "text-emerald-700" },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-5 rounded-[28px] bg-[#1f1b1c] px-6 py-7 text-white md:grid-cols-[1.35fr_0.65fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#f6c78f]">Member Dashboard</p>
          <h1 className="mt-4 text-4xl font-black">{member?.chinese_name ? `早安，${member.chinese_name}` : "會員儀表板"}</h1>
          <p className="mt-3 text-sm text-white/70">{getWeekSubtitle(weekDate)}</p>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-white/80">
            {member?.specialty_title || "登入 email 尚未在 members 名冊中。"}
            {member?.company_name ? ` · ${member.company_name}` : ""}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white" href="/dashboard/report">填寫本週簡報</Link>
            <Link className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-text-1" href="/dashboard/one-on-one">開始安排會談</Link>
            <Link className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold" href="/dashboard/directory">查看會員通訊錄</Link>
          </div>
        </div>
        <Card className="border-white/10 bg-white/8 p-5 text-white">
          <p className="text-sm text-white/65">本週提醒</p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-2xl bg-white/8 p-4">
              <p className="text-white/65">每週 Brief</p>
              <p className="mt-1 text-2xl font-bold">{status}</p>
            </div>
            <div className="rounded-2xl bg-white/8 p-4 text-white/75">
              <p>每週 Brief、一對一、會員通訊錄與個人資料都已建立可測入口。</p>
              <p className="mt-2">先完成本週 Brief，再安排本週一對一會談。</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label} className="rounded-[24px] p-5 shadow-[0_10px_30px_rgba(17,24,39,0.04)]">
            <p className="text-sm text-text-2">{card.label}</p>
            <p className={`mt-3 text-3xl font-bold ${card.tone}`}>{card.value}</p>
            <p className="mt-2 text-xs text-text-2">{card.note}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[24px] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">快速操作</h2>
              <p className="text-sm text-text-2">優先把本週例會需要的事情處理完。</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Link className="rounded-2xl border border-border bg-surface-2 px-4 py-4 text-sm font-medium hover:border-primary/30 hover:bg-white" href="/dashboard/report">填寫本週 Brief</Link>
            <Link className="rounded-2xl border border-border bg-surface-2 px-4 py-4 text-sm font-medium hover:border-primary/30 hover:bg-white" href="/dashboard/one-on-one">安排一對一</Link>
            <Link className="rounded-2xl border border-border bg-surface-2 px-4 py-4 text-sm font-medium hover:border-primary/30 hover:bg-white" href="/dashboard/profile">管理個人資料</Link>
            <Link className="rounded-2xl border border-border bg-surface-2 px-4 py-4 text-sm font-medium hover:border-primary/30 hover:bg-white" href="/dashboard/directory">查看會員通訊錄</Link>
          </div>
        </Card>
        <Card className="rounded-[24px] p-5">
          <h2 className="text-xl font-semibold">功能狀態</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-2xl border border-border p-4">
              <p className="font-semibold">已接資料流</p>
              <p className="mt-2 text-text-2">dashboard、weekly brief、directory、guest portal、admin backend。</p>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <p className="font-semibold">可驗收入口</p>
              <p className="mt-2 text-text-2">一對一會議會在確認後產生站內 Jitsi 入口；活動、培訓、AI 先維持安全入口與狀態說明。</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
