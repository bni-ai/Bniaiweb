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
      <div>
        <p className="text-sm text-text-2">{weekDate}</p>
        <h1 className="text-2xl font-semibold">後台總覽</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4"><p className="text-sm text-text-2">會員</p><p className="text-3xl font-semibold">{members.length}</p></Card>
        <Card className="p-4"><p className="text-sm text-text-2">週報提交</p><p className="text-3xl font-semibold">{briefs.submittedCount}/{briefs.totalCount}</p></Card>
        <Card className="p-4"><p className="text-sm text-text-2">來賓</p><p className="text-3xl font-semibold">{guests.length}</p></Card>
        <Card className="p-4"><p className="text-sm text-text-2">VP 引薦</p><p className="text-3xl font-semibold">{vpReport?.total_referrals ?? 0}</p></Card>
      </div>
      <Card className="p-4">
        <h2 className="mb-3 font-semibold">快速進入</h2>
        <div className="grid gap-2 md:grid-cols-3">
          {adminLinks.map(([href, label]) => (
            <Link className="rounded-md border border-border px-3 py-2 text-sm hover:bg-surface-2" href={href} key={href}>{label}</Link>
          ))}
        </div>
      </Card>
      <Card className="p-4"><p className="text-sm text-text-2">本週獎項：{awards.length} 筆。資料已接 Supabase，可直接測試新增與編輯。</p></Card>
    </div>
  );
}
