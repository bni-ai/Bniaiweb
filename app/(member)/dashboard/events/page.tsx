import { Card } from "../../../../components/ui/card";
import { getMemberEvents, registerEventAction } from "../../../../lib/actions/events";

export default async function MemberEventsPage() {
  const events = await getMemberEvents();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-2">Chapter Events</p>
        <h1 className="text-3xl font-black">活動</h1>
        <p className="mt-2 text-sm text-text-2">查看近期活動、剩餘名額與報名狀態。</p>
      </div>

      <div className="grid gap-4">
        {events.map((event) => {
          const full = event.remaining !== null && event.remaining <= 0;
          const disabled = Boolean(event.memberRegistration) || full || event.isClosed;
          return (
            <Card key={event.id} className="rounded-[24px] p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-text-1">{event.title}</h2>
                  <p className="mt-1 text-sm text-text-2">{event.date} · 報名截止 {event.registration_deadline || "未設定"}</p>
                  <p className="mt-3 text-sm text-text-2">{event.description || "尚未提供活動說明。"}</p>
                </div>
                <div className="rounded-2xl bg-surface-2 px-4 py-3 text-sm text-text-1">
                  <p>已報名 {event.registrationCount}</p>
                  <p className="mt-1">{event.remaining === null ? "不限名額" : `剩餘 ${event.remaining} 位`}</p>
                  <p className="mt-1 text-text-2">{event.memberRegistration ? `你的狀態：${event.memberRegistration.status}` : event.isClosed ? "已截止" : full ? "已額滿" : "可報名"}</p>
                </div>
              </div>
              <div className="mt-4">
                <form action={registerEventAction}>
                  <input type="hidden" name="event_id" value={event.id} />
                  <button
                    type="submit"
                    disabled={disabled}
                    className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {event.memberRegistration ? "已報名" : event.isClosed ? "報名已截止" : full ? "已額滿" : "立即報名"}
                  </button>
                </form>
              </div>
            </Card>
          );
        })}
        {events.length === 0 ? <Card className="rounded-[24px] p-6 text-sm text-text-2">目前沒有可報名活動，請等待幹部建立活動。</Card> : null}
      </div>
    </div>
  );
}
