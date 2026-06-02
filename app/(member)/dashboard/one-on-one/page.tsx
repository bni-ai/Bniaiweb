import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { weekdayLabels } from "../../../../lib/one-on-one";
import { createOneOnOneBookingAction, getOneOnOneDashboardData, saveMyAvailabilityAction, updateOneOnOneStatusAction } from "../../../../lib/actions/one-on-ones";

function toDateTimeLocalValue(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default async function OneOnOnePage({ searchParams }: { searchParams?: Promise<{ invitee?: string; error?: string; saved?: string }> }) {
  const params = await searchParams;
  const { member, availability, bookings, members, selectedInviteeId } = await getOneOnOneDashboardData(params?.invitee);
  const availabilityRows = [
    ...availability,
    { id: "new-0", member_id: "", day_of_week: 1, start_time: "", end_time: "" },
    { id: "new-1", member_id: "", day_of_week: 3, start_time: "", end_time: "" },
  ];
  const upcoming = bookings.filter((booking) => ["pending", "confirmed"].includes(booking.status)).slice(0, 3);
  const selectedInvitee = members.find((item) => item.id === selectedInviteeId) || null;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-2">One-on-One</p>
        <h1 className="text-3xl font-black">一對一預約</h1>
        <p className="mt-2 text-sm text-text-2">先設定自己的可用時段，再針對其他會員建立預約。系統會自動產生 Jitsi 會議連結。</p>
      </div>
      {params?.error ? (
        <Card className="rounded-[24px] border-red-200 bg-red-50 p-4 text-sm text-red-700">{params.error}</Card>
      ) : null}
      {params?.saved ? (
        <Card className="rounded-[24px] border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">已完成：{params.saved}</Card>
      ) : null}

      <Card className="rounded-lg p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">即將進行</h2>
            <p className="text-sm text-text-2">確認後的會議會在時間窗口內顯示站內 Jitsi 入口。</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {upcoming.map((booking) => {
            const counterparty = booking.inviter_id === member?.id ? booking.invitee_name : booking.inviter_name;
            return (
              <div key={booking.id} className="rounded-2xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">{counterparty.slice(-1)}</div>
                  <div>
                    <p className="font-semibold text-text-1">{counterparty}</p>
                    <p className="text-xs text-text-2">{booking.scheduled_at ? toDateTimeLocalValue(booking.scheduled_at).replace("T", " ") : "未排程"} · Jitsi Meet</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="rounded bg-surface-2 px-2 py-1 text-xs text-text-2">{booking.status}</span>
                  {booking.status === "confirmed" ? <a className="text-sm font-medium text-primary" href={`/dashboard/one-on-one/${booking.id}/video`}>進入會議</a> : null}
                </div>
              </div>
            );
          })}
          {upcoming.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-text-2 md:col-span-3">目前沒有即將進行的一對一。</div> : null}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-lg p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">我的可預約時段</h2>
              <p className="text-sm text-text-2">每筆預設代表可接受 60 分鐘的一對一時段。</p>
            </div>
          </div>
          <form action={saveMyAvailabilityAction} className="mt-5 space-y-3">
            <input type="hidden" name="availability_total" value={String(availabilityRows.length)} />
            {availabilityRows.map((row, index) => (
              <div className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-[0.9fr_1fr_1fr]" key={`${row.id}-${index}`}>
                <select name={`availability_day_of_week_${index}`} defaultValue={String(row.day_of_week)} className="rounded-lg border border-border px-3 py-2.5">
                  {weekdayLabels.map((label, day) => <option key={label} value={String(day)}>{label}</option>)}
                </select>
                <input name={`availability_start_time_${index}`} type="time" defaultValue={row.start_time} className="rounded-lg border border-border px-3 py-2.5" />
                <input name={`availability_end_time_${index}`} type="time" defaultValue={row.end_time} className="rounded-lg border border-border px-3 py-2.5" />
              </div>
            ))}
            <Button type="submit" className="rounded-full px-5">儲存可預約時段</Button>
          </form>
        </Card>

        <Card className="rounded-lg p-5">
          <h2 className="text-xl font-semibold">建立新預約</h2>
          {selectedInvitee ? (
            <div className="mt-4 rounded-lg border border-primary/20 bg-[#fff8f5] p-4">
              <p className="text-sm text-text-2">已選擇會員</p>
              <p className="mt-1 font-semibold text-text-1">{selectedInvitee.chinese_name} {selectedInvitee.specialty_title ? `· ${selectedInvitee.specialty_title}` : ""}</p>
            </div>
          ) : null}
          <form action={createOneOnOneBookingAction} className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm">
              <span className="font-medium">選擇會員</span>
              <select name="invitee_id" defaultValue={selectedInviteeId || ""} className="rounded-lg border border-border px-3 py-2.5">
                <option value="">請選擇</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.chinese_name} {member.specialty_title ? `· ${member.specialty_title}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium">預約時間</span>
              <input name="scheduled_at" type="datetime-local" className="rounded-lg border border-border px-3 py-2.5" />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium">備註</span>
              <textarea name="notes" className="min-h-24 rounded-lg border border-border px-3 py-2.5" placeholder="想談的主題、目標或準備資料" />
            </label>
            <div className="rounded-lg border border-dashed border-border p-4 text-sm text-text-2">
              只允許預約對方已公開的可用時段。若同時間已有人預約，系統會拒絕重疊建立。
            </div>
            <Button type="submit" className="rounded-full px-5">建立一對一預約</Button>
          </form>
        </Card>
      </div>

      <Card className="rounded-lg p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">預約紀錄</h2>
            <p className="text-sm text-text-2">可以確認、完成或取消既有預約，Jitsi 連結會保留同一組 room。</p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {bookings.map((booking) => {
            return (
              <div key={booking.id} className="rounded-2xl border border-border p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm text-text-2">對象：{booking.inviter_id === member?.id ? booking.invitee_name : booking.inviter_name}</p>
                    <p className="mt-1 text-lg font-semibold">{booking.scheduled_at ? toDateTimeLocalValue(booking.scheduled_at).replace("T", " ") : "未排程"}</p>
                    <p className="mt-2 text-sm text-text-2">狀態：{booking.status}</p>
                    {booking.notes ? <p className="mt-2 text-sm text-text-2">備註：{booking.notes}</p> : null}
                    {booking.jitsi_room ? (
                      <a className="mt-3 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline" href={`https://meet.jit.si/bni-huaai-${booking.jitsi_room}`} target="_blank">
                        開啟 Jitsi：bni-huaai-{booking.jitsi_room}
                      </a>
                    ) : null}
                    {booking.status === "confirmed" ? (
                      <a className="mt-2 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline" href={`/dashboard/one-on-one/${booking.id}/video`}>
                        進入視訊入口頁
                      </a>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["confirmed", "completed", "cancelled"] as const).map((status) => (
                      <form action={updateOneOnOneStatusAction} key={status}>
                        <input type="hidden" name="booking_id" value={booking.id} />
                        <input type="hidden" name="next_status" value={status} />
                        <Button type="submit" variant={booking.status === status ? "primary" : "secondary"} className="rounded-full px-4">
                          {status}
                        </Button>
                      </form>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          {bookings.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-text-2">目前還沒有一對一預約。</div> : null}
        </div>
      </Card>
    </div>
  );
}
