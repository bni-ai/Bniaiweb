/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card } from "../../../../components/ui/card";
import { getMembers, parseWeekDate } from "../../../../lib/actions/admin-common";
import { getGuestVisits } from "../../../../lib/actions/guests";
import { GuestVisitForm } from "./guest-visit-form";

function nextWeek(weekDate: string) { const d = new Date(`${weekDate}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 7); return d.toISOString().slice(0, 10); }

export default async function GuestsPage({ searchParams }: { searchParams?: Promise<{ week?: string; tab?: string }> }) {
  const params = await searchParams; const baseWeek = parseWeekDate(params?.week); const activeWeek = params?.tab === "next" ? nextWeek(baseWeek) : baseWeek;
  const [visits, members] = await Promise.all([getGuestVisits(activeWeek), getMembers()]);
  return <div className="space-y-4"><div><p className="text-sm text-text-2">{activeWeek}</p><h1 className="text-2xl font-semibold">來賓管理</h1></div>
    <div className="flex gap-2"><a className="rounded border border-border px-3 py-2" href={`/admin/guests?week=${baseWeek}`}>本週來賓</a><a className="rounded border border-border px-3 py-2" href={`/admin/guests?week=${baseWeek}&tab=next`}>下週來賓</a></div>
    <Card className="p-4"><h2 className="mb-3 font-semibold">新增 / 更新來賓</h2><GuestVisitForm weekDate={activeWeek} members={members} /></Card>
    <div className="grid gap-3 md:grid-cols-2">{visits.map((visit: any) => <Card className="p-4" key={visit.id}><div className="flex justify-between"><h3 className="font-semibold">{visit.guests?.name}</h3><span className="rounded bg-surface-2 px-2 py-1 text-xs">{visit.visit_number > 1 ? "舊來賓" : "新來賓"}</span></div><p className="text-sm text-text-2">{visit.guests?.specialty || "未填專業"} / {visit.guests?.company || "未填公司"}</p><p className="mt-2 text-sm">{visit.self_intro || "尚未填 15 秒介紹"}</p><div className="mt-3 rounded-md bg-surface-2 px-3 py-2 text-xs text-text-2"><p className="font-semibold text-text-1">來賓登入狀態：{visit.guests?.email ? "可登入" : "缺 email，尚不能登入"}</p><p>Email：{visit.guests?.email || "尚未填寫"}</p></div></Card>)}</div>
  </div>;
}
