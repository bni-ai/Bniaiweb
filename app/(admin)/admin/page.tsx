import Link from "next/link";

import { Card } from "../../../components/ui/card";
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

  return (
    <div className="space-y-6">
      <section className="grid gap-5 rounded-[28px] bg-[#1e1d1a] px-6 py-7 text-white md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#f6c78f]">Officer Dashboard</p>
          <h1 className="mt-4 text-4xl font-black">總覽儀表板</h1>
          <p className="mt-3 text-sm text-white/70">{weekDate} · 例會準備中</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white" href="/admin/presentation">管理本週簡報</Link>
            <Link className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold" href="/admin/submission">查看提交狀況</Link>
          </div>
        </div>
        <Card className="border-white/10 bg-white/8 p-5 text-white">
          <h2 className="text-lg font-semibold">本週運營摘要</h2>
          <div className="mt-4 space-y-3 text-sm text-white/80">
            <div className="rounded-2xl bg-white/8 p-4">尚未提交：{briefs.totalCount - briefs.submittedCount} 位</div>
            <div className="rounded-2xl bg-white/8 p-4">來賓確認：{guests.length} 位</div>
            <div className="rounded-2xl bg-white/8 p-4">逾期提交：{briefs.lateCount} 位</div>
            <div className="rounded-2xl bg-white/8 p-4">VP 引薦：{vpReport?.total_referrals ?? 0} 筆</div>
          </div>
        </Card>
      </section>
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="rounded-[24px] p-4"><p className="text-sm text-text-2">會員總數</p><p className="mt-3 text-3xl font-bold">{members.length}</p><p className="mt-2 text-xs text-text-2">本期</p></Card>
        <Card className="rounded-[24px] p-4"><p className="text-sm text-text-2">本週簡報提交</p><p className="mt-3 text-3xl font-bold text-emerald-700">{briefs.submittedCount}</p><p className="mt-2 text-xs text-text-2">{briefs.totalCount} 位中</p></Card>
        <Card className="rounded-[24px] p-4"><p className="text-sm text-text-2">尚未提交</p><p className="mt-3 text-3xl font-bold text-primary">{briefs.totalCount - briefs.submittedCount}</p><p className="mt-2 text-xs text-text-2">請跟進提醒</p></Card>
        <Card className="rounded-[24px] p-4"><p className="text-sm text-text-2">本週來賓</p><p className="mt-3 text-3xl font-bold">{guests.length}</p><p className="mt-2 text-xs text-text-2">已確認</p></Card>
        <Card className="rounded-[24px] p-4"><p className="text-sm text-text-2">本週已提醒</p><p className="mt-3 text-3xl font-bold">{briefs.remindedCount}</p><p className="mt-2 text-xs text-text-2">reminder logs</p></Card>
      </div>
      <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[24px] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">快速進入</h2>
              <p className="text-sm text-text-2">這些頁面已經接上 Supabase，可直接驗收。</p>
            </div>
          </div>
          <div className="mt-5 grid gap-2 md:grid-cols-3">
          {adminLinks.map(([href, label]) => (
            <Link className="rounded-2xl border border-border bg-surface px-3 py-3 text-sm font-medium hover:border-primary/30 hover:bg-white" href={href} key={href}>{label}</Link>
          ))}
          </div>
        </Card>
        <Card className="rounded-[24px] p-5">
          <h2 className="text-xl font-semibold">本週未提交成員</h2>
          <div className="mt-4 space-y-3">
            {briefs.rows.filter((row) => row.brief?.status !== "submitted").slice(0, 5).map((row) => (
              <div className="rounded-2xl border border-border px-4 py-3 text-sm" key={row.member.id}>
                <p className="font-medium">{row.member.chinese_name}</p>
                <p className="text-text-2">{row.member.specialty_title || row.member.email}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-text-2">本週獎項 {awards.length} 筆，VP 報告與來賓資料都已接到同一批例會準備流程。</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
