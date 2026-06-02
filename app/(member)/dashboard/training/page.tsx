import { Card } from "../../../../components/ui/card";
import { getMemberTrainingDashboard } from "../../../../lib/actions/training";

export default async function MemberTrainingPage() {
  const data = await getMemberTrainingDashboard();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-2">Training Credits</p>
        <h1 className="text-3xl font-black">培訓紀錄</h1>
        <p className="mt-2 text-sm text-text-2">查看已完課課程、累積學分與剩餘課程數。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[24px] p-5"><p className="text-sm text-text-2">總學分</p><p className="mt-3 text-3xl font-black text-text-1">{data.totalCredits}</p></Card>
        <Card className="rounded-[24px] p-5"><p className="text-sm text-text-2">已完成課程</p><p className="mt-3 text-3xl font-black text-text-1">{data.records.length}</p></Card>
        <Card className="rounded-[24px] p-5"><p className="text-sm text-text-2">剩餘課程</p><p className="mt-3 text-3xl font-black text-text-1">{data.remainingCourses}</p></Card>
      </div>
      <Card className="rounded-[24px] p-5">
        <h2 className="text-xl font-semibold">已完成課程</h2>
        <div className="mt-4 space-y-2 text-sm">
          {data.records.map((record) => (
            <div key={record.id} className="rounded-2xl border border-border px-4 py-3">
              <p className="font-medium text-text-1">{record.courseName}</p>
              <p className="mt-1 text-text-2">{record.completed_at} · {record.credits_earned || 0} 學分{record.provider ? ` · ${record.provider}` : ""}</p>
            </div>
          ))}
          {data.records.length === 0 ? <p className="text-text-2">目前還沒有完課紀錄。</p> : null}
        </div>
      </Card>
    </div>
  );
}
