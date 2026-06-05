import { Card } from "../../../../components/ui/card";
import { createEventAction, getAdminEvents, markEventAttendanceAction } from "../../../../lib/actions/events";

const registrationStatusLabels: Record<string, string> = {
  registered: "已報名",
  attended: "已出席",
  cancelled: "已取消",
};

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const params = await searchParams;
  const events = await getAdminEvents();

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-text-2">活動營運</p>
          <h1 className="text-3xl font-black">活動管理</h1>
          <p className="mt-2 text-sm text-text-2">建立活動、追蹤報名人數、標記出席率。</p>
        </div>
      </div>
      {params?.saved ? <Card className="rounded-[20px] border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">活動已建立。</Card> : null}
      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[24px] p-5">
          <h2 className="text-xl font-semibold">新增活動</h2>
          <form action={createEventAction} className="mt-4 grid gap-3">
            <input name="title" className="rounded-2xl border border-border px-3 py-2.5" placeholder="活動名稱" required />
            <input name="date" type="date" className="rounded-2xl border border-border px-3 py-2.5" required />
            <input name="registration_deadline" type="date" className="rounded-2xl border border-border px-3 py-2.5" />
            <input name="max_participants" type="number" min="1" className="rounded-2xl border border-border px-3 py-2.5" placeholder="名額上限" />
            <textarea name="description" className="min-h-32 rounded-2xl border border-border px-3 py-2.5" placeholder="活動說明" />
            <button type="submit" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">建立活動</button>
          </form>
        </Card>

        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="rounded-[24px] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-text-1">{event.title}</h2>
                  <p className="mt-1 text-sm text-text-2">{event.date} · 截止 {event.registration_deadline || "未設定"} · 已報名 {event.registeredCount}{event.max_participants ? ` / ${event.max_participants}` : ""}</p>
                  {event.description ? <p className="mt-3 text-sm text-text-2">{event.description}</p> : null}
                </div>
                <div className="rounded-2xl bg-surface-2 px-4 py-3 text-right text-sm">
                  <p className="text-text-2">出席率</p>
                  <p className="mt-1 text-lg font-black text-text-1">
                    {event.registeredCount > 0 ? `${Math.round((event.attendedCount / event.registeredCount) * 100)}%` : "0%"}
                  </p>
                </div>
              </div>
              {event.registrations.length > 0 ? (
                <div className="mt-4 grid gap-2">
                  {event.registrations.map((registration) => (
                    <form key={registration.id} action={markEventAttendanceAction} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium text-text-1">{registration.memberName}</p>
                        <p className="text-text-2">目前狀態：{registrationStatusLabels[registration.status] || registration.status}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="hidden" name="registration_id" value={registration.id} />
                        <button type="submit" name="status" value="registered" className="rounded-full border border-border px-3 py-2 text-xs font-medium text-text-1">未出席</button>
                        <button type="submit" name="status" value="attended" className="rounded-full bg-primary px-3 py-2 text-xs font-medium text-white">已出席</button>
                      </div>
                    </form>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-text-2">目前尚無報名紀錄。</p>
              )}
            </Card>
          ))}
          {events.length === 0 ? <Card className="rounded-[24px] p-6 text-sm text-text-2">目前還沒有活動，先建立第一筆活動即可讓會員端出現報名入口。</Card> : null}
        </div>
      </div>
    </div>
  );
}
