import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { parseWeekDate } from "../../../../lib/actions/admin-common";
import { getMemberDashboardData, saveMyBriefAction } from "../../../../lib/actions/member-portal";

function getWeekLabel(weekDate: string) {
  return `週次 ${weekDate}`;
}

export default async function MemberReportPage({ searchParams }: { searchParams?: Promise<{ week?: string }> }) {
  const params = await searchParams;
  const { member, weekDate, brief, locked, lockReason } = await getMemberDashboardData(parseWeekDate(params?.week));
  const status = brief?.status === "submitted" ? "已提交" : brief?.status === "draft" ? "草稿中" : "尚未開始";
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-text-2">{getWeekLabel(weekDate)}</p>
          <h1 className="text-3xl font-black">每週 Brief</h1>
          <p className="mt-2 text-sm text-text-2">{member ? `${member.chinese_name} / ${status}` : "找不到會員資料"}</p>
        </div>
        <div className="rounded-full bg-[#fff1ea] px-4 py-2 text-sm text-primary">截止時間：例會前請完成提交</div>
      </div>
      {locked ? <Card className="rounded-[22px] border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><p className="font-semibold">此週已鎖定，Brief 只能檢視，不能修改。</p>{lockReason ? <p className="mt-1">{lockReason}</p> : null}</Card> : null}
      <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[24px] p-5">
          <form action={saveMyBriefAction} className="grid gap-4">
            <input type="hidden" name="week_date" value={weekDate} />
            <label className="grid gap-2 text-sm">
              <span className="font-semibold text-text-1">本週可提供</span>
              <textarea name="have_this_week" disabled={locked} className="min-h-40 rounded-2xl border border-border bg-surface-2 p-3 disabled:bg-surface disabled:text-text-2" defaultValue={brief?.have_this_week || ""} placeholder="本週你可以提供哪些資源、引薦或協助？" />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-semibold text-text-1">本週需要</span>
              <textarea name="want_this_week" disabled={locked} className="min-h-40 rounded-2xl border border-border bg-surface-2 p-3 disabled:bg-surface disabled:text-text-2" defaultValue={brief?.want_this_week || ""} placeholder="這週最希望獲得哪一類引薦、合作或支援？" />
            </label>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" name="intent" value="draft" variant="secondary" disabled={locked} className="rounded-full px-5">儲存草稿</Button>
              <Button type="submit" name="intent" value="submit" disabled={locked} className="rounded-full px-5">提交本週簡報</Button>
            </div>
          </form>
        </Card>
        <Card className="rounded-[24px] p-5">
          <h2 className="text-xl font-semibold">填寫提示</h2>
          <div className="mt-4 space-y-3 text-sm text-text-2">
            <div className="rounded-2xl border border-border p-4">
              <p className="font-semibold text-text-1">狀態</p>
              <p className="mt-2">{status}</p>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <p className="font-semibold text-text-1">建議寫法</p>
              <p className="mt-2">用一句話講清楚你這週能幫誰，以及你最希望被轉介紹給誰。</p>
            </div>
            <div className="rounded-2xl border border-dashed border-border p-4">
              <p className="font-semibold text-text-1">後續模組</p>
              <p className="mt-2">逾期提醒、自動同步、進階引薦欄位會在後續主線補齊，這頁目前先確保提交鏈路穩定。</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
