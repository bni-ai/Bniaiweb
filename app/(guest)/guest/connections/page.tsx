import { getCurrentGuestContext } from "../../../../lib/actions/guest-portal";

export default async function GuestConnectionsPage() {
  const context = await getCurrentGuestContext();
  const contactName =
    context?.guest && "members" in context.guest ? context.guest.members?.chinese_name || "尚未指定聯繫窗口" : "尚未指定聯繫窗口";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="mb-2 text-sm text-text-2">來賓專區</p>
        <h1 className="text-3xl font-black text-text-1">請聯繫人協助引介</h1>
        <p className="mt-2 text-sm leading-6 text-text-2">
          若您希望認識其他會員，第一步請先透過邀約人或指定聯繫窗口協助安排。我們不會在來賓入口直接公開完整會員聯絡資料。
        </p>
      </div>

      <div className="space-y-4 rounded-[24px] border border-border bg-white p-6">
        <div className="rounded-2xl bg-surface p-4">
          <p className="text-sm text-text-2">目前聯繫窗口</p>
          <p className="mt-2 text-2xl font-bold text-text-1">{contactName}</p>
        </div>
        <div className="space-y-2 text-sm leading-6 text-text-2">
          <p>1. 先整理您希望認識的產業、職務或合作方向。</p>
          <p>2. 於例會後或下次聯繫時，請 {contactName} 協助安排引介。</p>
          <p>3. 若您尚未有指定窗口，請先回到來賓首頁查看邀約資訊。</p>
        </div>
      </div>
    </div>
  );
}
