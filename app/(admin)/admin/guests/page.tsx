/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card } from "../../../../components/ui/card";
import { getMembers, parseWeekDate } from "../../../../lib/actions/admin-common";
import { getGuestVisits } from "../../../../lib/actions/guests";
import { GuestVisitForm } from "./guest-visit-form";

function nextWeek(weekDate: string) { const d = new Date(`${weekDate}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 7); return d.toISOString().slice(0, 10); }

export default async function GuestsPage({ searchParams }: { searchParams?: Promise<{ week?: string; tab?: string }> }) {
  const params = await searchParams; const baseWeek = parseWeekDate(params?.week); const activeWeek = params?.tab === "next" ? nextWeek(baseWeek) : baseWeek;
  const [visits, members] = await Promise.all([getGuestVisits(activeWeek), getMembers()]);
  const loginReadyCount = visits.filter((visit: any) => Boolean(visit.guests?.email)).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-text-2">{activeWeek}</p>
          <h1 className="text-3xl font-black">來賓管理</h1>
          <p className="mt-2 text-sm text-text-2">統一管理本週與下週受邀來賓、邀約人、15 秒介紹與 guest login readiness。</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[24px] p-5"><p className="text-sm text-text-2">本頁來賓數</p><p className="mt-3 text-3xl font-bold">{visits.length}</p></Card>
        <Card className="rounded-[24px] p-5"><p className="text-sm text-text-2">可登入</p><p className="mt-3 text-3xl font-bold text-emerald-700">{loginReadyCount}</p></Card>
        <Card className="rounded-[24px] p-5"><p className="text-sm text-text-2">待補 Email</p><p className="mt-3 text-3xl font-bold text-primary">{visits.length - loginReadyCount}</p></Card>
      </div>
      <div className="flex gap-2">
        <a className="rounded-full border border-border px-4 py-2 text-sm" href={`/admin/guests?week=${baseWeek}`}>本週來賓</a>
        <a className="rounded-full border border-border px-4 py-2 text-sm" href={`/admin/guests?week=${baseWeek}&tab=next`}>下週來賓</a>
      </div>
      <Card className="rounded-[24px] p-5">
        <h2 className="mb-3 text-xl font-semibold">新增 / 更新來賓</h2>
        <GuestVisitForm weekDate={activeWeek} members={members} />
      </Card>
      <div className="grid gap-3 md:grid-cols-2">
        {visits.map((visit: any) => (
          <Card className="rounded-[24px] p-5" key={visit.id}>
            <div className="flex justify-between gap-3">
              <div>
                <h3 className="font-semibold">{visit.guests?.name}</h3>
                <p className="mt-1 text-sm text-text-2">{visit.guests?.specialty || "未填專業"} / {visit.guests?.company || "未填公司"}</p>
              </div>
              <span className="rounded-full bg-surface-2 px-3 py-1 text-xs">{visit.visit_number > 1 ? "舊來賓" : "新來賓"}</span>
            </div>
            <p className="mt-4 text-sm">{visit.self_intro || "尚未填 15 秒介紹"}</p>
            <div className="mt-4 rounded-2xl bg-surface-2 px-4 py-3 text-xs text-text-2">
              <p className="font-semibold text-text-1">來賓登入狀態：{visit.guests?.email ? "可登入" : "缺 email，尚不能登入"}</p>
              <p className="mt-1">Email：{visit.guests?.email || "尚未填寫"}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
