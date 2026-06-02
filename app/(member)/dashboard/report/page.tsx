import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { parseWeekDate } from "../../../../lib/actions/admin-common";
import { getMemberDashboardData, saveMyBriefAction } from "../../../../lib/actions/member-portal";

export default async function MemberReportPage({ searchParams }: { searchParams?: Promise<{ week?: string }> }) {
  const params = await searchParams;
  const { member, weekDate, brief, locked, lockReason } = await getMemberDashboardData(parseWeekDate(params?.week));
  return <div className="space-y-4"><div><p className="text-sm text-text-2">{weekDate}</p><h1 className="text-2xl font-semibold">每週 Brief</h1><p className="text-sm text-text-2">{member ? `${member.chinese_name} / ${brief?.status || "未開始"}` : "找不到會員資料"}</p></div>{locked ? <Card className="border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><p className="font-semibold">此週已鎖定，Brief 只能檢視，不能修改。</p>{lockReason ? <p className="mt-1">{lockReason}</p> : null}</Card> : null}<Card className="p-4"><form action={saveMyBriefAction} className="grid gap-3"><input type="hidden" name="week_date" value={weekDate} /><label className="grid gap-1 text-sm"><span>本週可提供</span><textarea name="have_this_week" disabled={locked} className="min-h-32 rounded border border-border p-2 disabled:bg-surface-2 disabled:text-text-2" defaultValue={brief?.have_this_week || ""} /></label><label className="grid gap-1 text-sm"><span>本週需要</span><textarea name="want_this_week" disabled={locked} className="min-h-32 rounded border border-border p-2 disabled:bg-surface-2 disabled:text-text-2" defaultValue={brief?.want_this_week || ""} /></label><div className="flex gap-2"><Button type="submit" name="intent" value="draft" variant="secondary" disabled={locked}>儲存草稿</Button><Button type="submit" name="intent" value="submit" disabled={locked}>提交</Button></div></form></Card></div>;
}
