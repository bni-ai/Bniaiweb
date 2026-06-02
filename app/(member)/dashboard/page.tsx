import Link from "next/link";

import { Card } from "../../../components/ui/card";
import { getMemberDashboardData } from "../../../lib/actions/member-portal";

export default async function DashboardPage() {
  const { member, weekDate, brief } = await getMemberDashboardData();
  const status = brief?.status === "submitted" ? "已提交" : brief ? "草稿" : "未開始";
  return <div className="space-y-4"><div><p className="text-sm text-text-2">{weekDate}</p><h1 className="text-2xl font-semibold">會員儀表板</h1></div><div className="grid gap-4 md:grid-cols-3"><Card className="p-4 md:col-span-2"><p className="text-sm text-text-2">我的資料</p><h2 className="mt-2 text-xl font-semibold">{member?.chinese_name || "尚未對應會員"}</h2><p className="text-sm text-text-2">{member?.specialty_title || "登入 email 尚未在 members 名冊中"}</p><p className="mt-2 text-sm">{member?.company_name || ""}</p></Card><Card className="p-4"><p className="text-sm text-text-2">本週 Brief</p><p className="mt-2 text-3xl font-semibold text-primary">{status}</p></Card></div><Card className="p-4"><h2 className="mb-3 font-semibold">快速操作</h2><div className="grid gap-2 md:grid-cols-3"><Link className="rounded border border-border px-3 py-2 text-sm hover:bg-surface-2" href="/dashboard/report">填寫本週 Brief</Link><Link className="rounded border border-border px-3 py-2 text-sm hover:bg-surface-2" href="/dashboard/directory">查看成員名冊</Link><Link className="rounded border border-border px-3 py-2 text-sm hover:bg-surface-2" href="/dashboard/profile">更新個人資料</Link></div></Card></div>;
}
