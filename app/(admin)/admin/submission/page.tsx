/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { parseWeekDate } from "../../../../lib/actions/admin-common";
import { sendBulkReminderAction } from "../../../../lib/actions/settings";
import { approveBriefAction, getWeeklyBriefRows, saveBriefAction } from "../../../../lib/actions/weekly-briefs";

export default async function SubmissionPage({ searchParams }: { searchParams?: Promise<{ week?: string; reminded?: string }> }) {
  const params = await searchParams;
  const weekDate = parseWeekDate(params?.week);
  const data = await getWeeklyBriefRows(weekDate);
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="text-sm text-text-2">{weekDate}</p><h1 className="text-3xl font-black">簡報提交狀況</h1><p className="mt-2 text-sm text-text-2">目前已接 `weekly_briefs`、late 狀態與 reminder logs，幹部可直接修訂與核准內容。</p></div><div className="flex items-center gap-3"><div className="rounded-full bg-[#fff1ea] px-4 py-2 text-sm text-primary">{data.submittedCount}/{data.totalCount} 已提交</div><form action={sendBulkReminderAction}><input type="hidden" name="week_date" value={weekDate} /><Button type="submit" variant="secondary" className="rounded-full px-5">提醒未提交會員</Button></form></div></div>
      {params?.reminded ? <Card className="rounded-[20px] border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">已建立 {params.reminded} 筆 reminder 紀錄。</Card> : null}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-[22px] p-4"><p className="text-sm text-text-2">已提交</p><p className="mt-3 text-3xl font-bold text-emerald-700">{data.submittedCount}</p></Card>
        <Card className="rounded-[22px] p-4"><p className="text-sm text-text-2">未提交</p><p className="mt-3 text-3xl font-bold text-primary">{data.totalCount - data.submittedCount}</p></Card>
        <Card className="rounded-[22px] p-4"><p className="text-sm text-text-2">逾期提交</p><p className="mt-3 text-3xl font-bold text-amber-700">{data.lateCount}</p></Card>
        <Card className="rounded-[22px] p-4"><p className="text-sm text-text-2">已提醒</p><p className="mt-3 text-3xl font-bold">{data.remindedCount}</p></Card>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-surface-2 text-left"><tr><th className="p-3">會員</th><th className="p-3">狀態</th><th className="p-3">本週可提供</th><th className="p-3">本週需求</th><th className="p-3">操作</th></tr></thead><tbody>
          {data.rows.map(({ member, brief, remindedAt }: any) => (
            <tr className="border-t border-border align-top" key={member.id}>
              <td className="p-3"><b>{member.chinese_name}</b><p className="text-xs text-text-2">{member.specialty_title || member.email}</p></td>
              <td className="p-3">{brief?.status === "submitted" ? "已提交" : brief ? "草稿" : "未提交"}{brief?.submitted_late ? " / 逾期" : ""}{brief?.approved_at ? " / 已核准" : ""}{remindedAt ? " / 已提醒" : ""}</td>
              <td className="p-3">{brief?.have_this_week || "-"}</td><td className="p-3">{brief?.want_this_week || "-"}</td>
              <td className="p-3 space-y-2">
                <form action={saveBriefAction} className="grid gap-2">
                  <input type="hidden" name="week_date" value={weekDate} /><input type="hidden" name="member_id" value={member.id} />
                  <textarea name="have_this_week" className="rounded border border-border p-2" defaultValue={brief?.have_this_week || ""} placeholder="本週可提供" />
                  <textarea name="want_this_week" className="rounded border border-border p-2" defaultValue={brief?.want_this_week || ""} placeholder="本週需求" />
                  <select name="status" className="rounded border border-border p-2" defaultValue={brief?.status || "draft"}><option value="draft">草稿</option><option value="submitted">已提交</option></select>
                  <Button type="submit" className="w-full">儲存</Button>
                </form>
                {brief?.id ? <form action={approveBriefAction}><input type="hidden" name="brief_id" value={brief.id} /><Button type="submit" variant="secondary" className="w-full">核准</Button></form> : null}
              </td>
            </tr>
          ))}
        </tbody></table>
      </Card>
    </div>
  );
}
