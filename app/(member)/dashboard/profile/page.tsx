import { Card } from "../../../../components/ui/card";
import { getCurrentMember } from "../../../../lib/actions/member-portal";

export default async function MemberProfilePage() {
  const member = await getCurrentMember();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-2">Public Profile</p>
        <h1 className="text-3xl font-black">個人資料</h1>
        <p className="mt-2 text-sm text-text-2">管理你的公開名片與引薦素材。更完整的 GAINS / top clients / contacts circle 會由後續 `member-module` 補齊。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_0.95fr]">
        <Card className="rounded-[24px] p-5">
          <h2 className="text-xl font-semibold">公開名片</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div><p className="text-xs uppercase tracking-[0.2em] text-text-2">姓名</p><p className="mt-2 text-lg font-semibold">{member?.chinese_name || "尚未綁定 member"}</p></div>
            <div><p className="text-xs uppercase tracking-[0.2em] text-text-2">登入 Email</p><p className="mt-2 text-sm">{member?.email || "—"}</p></div>
            <div><p className="text-xs uppercase tracking-[0.2em] text-text-2">專業</p><p className="mt-2 text-sm">{member?.specialty_title || "尚未填寫"}</p></div>
            <div><p className="text-xs uppercase tracking-[0.2em] text-text-2">LINE 名稱</p><p className="mt-2 text-sm">{member?.line_name || "未公開"}</p></div>
          </div>
          <div className="mt-5 rounded-2xl border border-border bg-surface-2 p-4 text-sm text-text-2">
            這一版先把已接資料欄位整理成可驗收 UI。真正的可編輯 profile CRUD 仍由 `member-module` 接手。
          </div>
        </Card>
        <Card className="rounded-[24px] p-5">
          <h2 className="text-xl font-semibold">後續會補的欄位</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-2xl border border-dashed border-border p-4">GAINS 收穫工作表</div>
            <div className="rounded-2xl border border-dashed border-border p-4">前十名客戶</div>
            <div className="rounded-2xl border border-dashed border-border p-4">業務人脈圈規劃</div>
            <div className="rounded-2xl border border-dashed border-border p-4">一對一可用時段與預約紀錄</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
