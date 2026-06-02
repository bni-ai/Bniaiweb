import { Card } from "../../../../components/ui/card";
import { createTrainingCourseAction, getTrainingOverview, recordTrainingCompletionAction } from "../../../../lib/actions/training";

export default async function AdminTrainingPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const params = await searchParams;
  const { courses, records, memberSummaries, members } = await getTrainingOverview();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-2">Training Overview</p>
        <h1 className="text-3xl font-black">培訓管理</h1>
        <p className="mt-2 text-sm text-text-2">維護課程目錄、補登完課紀錄、查看分會學分排行。</p>
      </div>
      {params?.saved ? <Card className="rounded-[20px] border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">培訓資料已儲存。</Card> : null}
      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <Card className="rounded-[24px] p-5">
            <h2 className="text-xl font-semibold">新增課程</h2>
            <form action={createTrainingCourseAction} className="mt-4 grid gap-3">
              <input name="name" className="rounded-2xl border border-border px-3 py-2.5" placeholder="課程名稱" required />
              <input name="system_form_name" className="rounded-2xl border border-border px-3 py-2.5" placeholder="System 表單名稱" />
              <input name="desktop_form_name" className="rounded-2xl border border-border px-3 py-2.5" placeholder="Desktop 表單名稱" />
              <div className="grid gap-3 md:grid-cols-3">
                <input name="credits" type="number" min="0" className="rounded-2xl border border-border px-3 py-2.5" placeholder="學分" />
                <input name="first_fee" type="number" min="0" className="rounded-2xl border border-border px-3 py-2.5" placeholder="初訓費用" />
                <input name="repeat_fee" type="number" min="0" className="rounded-2xl border border-border px-3 py-2.5" placeholder="複訓費用" />
              </div>
              <input name="provider" className="rounded-2xl border border-border px-3 py-2.5" placeholder="主辦單位" />
              <button type="submit" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">建立課程</button>
            </form>
          </Card>

          <Card className="rounded-[24px] p-5">
            <h2 className="text-xl font-semibold">新增完課紀錄</h2>
            <form action={recordTrainingCompletionAction} className="mt-4 grid gap-3">
              <select name="member_id" className="rounded-2xl border border-border px-3 py-2.5" required>
                <option value="">選擇會員</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>{member.member_number || "--"} · {member.chinese_name}</option>
                ))}
              </select>
              <select name="course_id" className="rounded-2xl border border-border px-3 py-2.5" required>
                <option value="">選擇課程</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
              <div className="grid gap-3 md:grid-cols-2">
                <input name="completed_at" type="date" className="rounded-2xl border border-border px-3 py-2.5" required />
                <input name="credits_earned" type="number" min="0" className="rounded-2xl border border-border px-3 py-2.5" placeholder="實得學分" required />
              </div>
              <button type="submit" className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-text-1">新增完課</button>
            </form>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-[24px] p-5">
            <h2 className="text-xl font-semibold">會員學分排行</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-surface-2 text-text-2">
                  <tr><th className="px-4 py-3">會員</th><th className="px-4 py-3">總學分</th><th className="px-4 py-3">已完課</th></tr>
                </thead>
                <tbody>
                  {memberSummaries.map((member) => (
                    <tr key={member.id} className="border-t border-border">
                      <td className="px-4 py-3">{member.member_number || "--"} · {member.chinese_name}</td>
                      <td className="px-4 py-3 font-semibold">{member.totalCredits}</td>
                      <td className="px-4 py-3">{member.completedCourses}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card className="rounded-[24px] p-5">
            <h2 className="text-xl font-semibold">最近完課紀錄</h2>
            <div className="mt-4 space-y-2 text-sm">
              {records.slice(0, 8).map((record) => (
                <div key={record.id} className="rounded-2xl border border-border px-4 py-3">
                  <p className="font-medium text-text-1">{record.courseName}</p>
                  <p className="mt-1 text-text-2">{record.completed_at} · {record.credits_earned || 0} 學分</p>
                </div>
              ))}
              {records.length === 0 ? <p className="text-text-2">目前還沒有完課紀錄。</p> : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
