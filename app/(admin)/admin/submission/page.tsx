/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { parseWeekDate } from "../../../../lib/actions/admin-common";
import { approveBriefAction, getWeeklyBriefRows, saveBriefAction } from "../../../../lib/actions/weekly-briefs";

export default async function SubmissionPage({ searchParams }: { searchParams?: Promise<{ week?: string }> }) {
  const params = await searchParams;
  const weekDate = parseWeekDate(params?.week);
  const data = await getWeeklyBriefRows(weekDate);
  return (
    <div className="space-y-4">
      <div><p className="text-sm text-text-2">{weekDate}</p><h1 className="text-2xl font-semibold">提交狀況 <span className="text-primary">{data.submittedCount}/{data.totalCount} 已提交</span></h1></div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-surface-2 text-left"><tr><th className="p-3">會員</th><th className="p-3">狀態</th><th className="p-3">本週可提供</th><th className="p-3">本週需求</th><th className="p-3">操作</th></tr></thead><tbody>
          {data.rows.map(({ member, brief }: any) => (
            <tr className="border-t border-border align-top" key={member.id}>
              <td className="p-3"><b>{member.chinese_name}</b><p className="text-xs text-text-2">{member.specialty_title || member.email}</p></td>
              <td className="p-3">{brief?.status === "submitted" ? "已提交" : brief ? "草稿" : "未提交"}{brief?.approved_at ? " / 已核准" : ""}</td>
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
