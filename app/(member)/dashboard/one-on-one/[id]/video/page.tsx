import { Card } from '../../../../../../components/ui/card';
import { getOneOnOneVideoSession } from '../../../../../../lib/actions/one-on-ones';

export default async function OneOnOneVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const session = await getOneOnOneVideoSession(id);
    return (
      <div className="space-y-5">
        <div>
          <p className="text-sm text-text-2">One-on-One Video</p>
          <h1 className="text-3xl font-black">一對一視訊入口</h1>
          <p className="mt-2 text-sm text-text-2">只有已確認且在時間窗口內的預約可以進入同一個 Jitsi room。</p>
        </div>
        <Card className="rounded-[24px] p-5">
          <p className="text-sm text-text-2">與會者</p>
          <p className="mt-2 text-xl font-semibold">{session.inviter_name} × {session.invitee_name}</p>
          <p className="mt-2 text-sm text-text-2">預約時間：{new Date(session.scheduled_at || "").toLocaleString("zh-TW", { hour12: false })}</p>
          {session.notes ? <p className="mt-2 text-sm text-text-2">會議備註：{session.notes}</p> : null}
          <a href={session.meetUrl} target="_blank" className="mt-4 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">
            進入 Jitsi 視訊會議
          </a>
          <div className="mt-4 rounded-2xl border border-dashed border-border p-4 text-sm text-text-2">若你在會議時間前 30 分鐘或後 90 分鐘之外進入，系統會擋下，避免錯連舊會議。</div>
        </Card>
      </div>
    );
  } catch (error) {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-sm text-text-2">One-on-One Video</p>
          <h1 className="text-3xl font-black">一對一視訊入口</h1>
        </div>
        <Card className="rounded-[24px] border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error instanceof Error ? error.message : '無法進入視訊頁'}
        </Card>
      </div>
    );
  }
}
