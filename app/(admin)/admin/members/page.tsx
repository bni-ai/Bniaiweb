import { Card } from "../../../../components/ui/card";
import { getMembers } from "../../../../lib/actions/admin-common";

export default async function AdminMembersPage() {
  const members = await getMembers();
  const committeeCount = new Set(members.map((m) => m.committee).filter(Boolean)).size;
  const officerCount = members.filter((m) => m.role !== "member").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-text-2">Members Registry</p>
          <h1 className="text-3xl font-black">會員管理</h1>
          <p className="mt-2 text-sm text-text-2">目前讀取 Supabase `members`，這一版先把名冊、角色與委員會資訊做成可驗收入口。</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-[24px] p-5"><p className="text-sm text-text-2">會員總數</p><p className="mt-3 text-3xl font-bold">{members.length}</p></Card>
        <Card className="rounded-[24px] p-5"><p className="text-sm text-text-2">幹部 / 主席群</p><p className="mt-3 text-3xl font-bold text-primary">{officerCount}</p></Card>
        <Card className="rounded-[24px] p-5"><p className="text-sm text-text-2">正式會員</p><p className="mt-3 text-3xl font-bold text-emerald-700">{members.length - officerCount}</p></Card>
        <Card className="rounded-[24px] p-5"><p className="text-sm text-text-2">委員會角色數</p><p className="mt-3 text-3xl font-bold">{committeeCount}</p></Card>
      </div>
      <Card className="overflow-hidden rounded-[24px]">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left">
            <tr>
              <th className="p-3">姓名</th>
              <th className="p-3">Email</th>
              <th className="p-3">角色</th>
              <th className="p-3">委員會</th>
              <th className="p-3">專業</th>
              <th className="p-3">公司</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr className="border-t border-border" key={m.id}>
                <td className="p-3 font-medium">{m.chinese_name}</td>
                <td className="p-3">{m.email}</td>
                <td className="p-3">{m.role}</td>
                <td className="p-3">{m.committee || m.position || "-"}</td>
                <td className="p-3">{m.specialty_title || "-"}</td>
                <td className="p-3">{m.company_name || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card className="rounded-[24px] border-dashed p-5 text-sm text-text-2">
        完整 CRUD、席次調整、GAINS 欄位與 member import merge 仍由後續 `member-module` 負責，這一版先確保名冊資料可查、可驗收、不中斷既有路由。
      </Card>
    </div>
  );
}
