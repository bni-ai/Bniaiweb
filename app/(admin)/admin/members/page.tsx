import { Card } from "../../../../components/ui/card";
import { getMembers } from "../../../../lib/actions/admin-common";

export default async function AdminMembersPage() {
  const members = await getMembers();
  return <div className="space-y-4"><div><h1 className="text-2xl font-semibold">會員管理</h1><p className="text-sm text-text-2">目前資料來源為 Supabase `members`，正式 CRUD 會在 member-module 完成。</p></div><Card className="overflow-hidden"><table className="w-full text-sm"><thead className="bg-surface-2 text-left"><tr><th className="p-3">姓名</th><th className="p-3">Email</th><th className="p-3">角色</th><th className="p-3">專業</th><th className="p-3">公司</th></tr></thead><tbody>{members.map((m) => <tr className="border-t border-border" key={m.id}><td className="p-3 font-medium">{m.chinese_name}</td><td className="p-3">{m.email}</td><td className="p-3">{m.role}</td><td className="p-3">{m.specialty_title || "-"}</td><td className="p-3">{m.company_name || "-"}</td></tr>)}</tbody></table></Card></div>;
}
