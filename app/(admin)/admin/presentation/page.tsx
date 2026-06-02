import Link from "next/link";

import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { parseWeekDate } from "../../../../lib/actions/admin-common";
import { createPresentationAction, getPresentations } from "../../../../lib/actions/presentations";

export default async function PresentationPage({ searchParams }: { searchParams?: Promise<{ week?: string }> }) {
  const params = await searchParams; const weekDate = parseWeekDate(params?.week); const presentations = await getPresentations();
  return <div className="space-y-4"><div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="text-sm text-text-2">{weekDate}</p><h1 className="text-3xl font-black">簡報管理</h1><p className="mt-2 text-sm text-text-2">建立、編輯、發布本週簡報。viewer 與 typed slide engine 會由後續 `presentation-engine` 深化。</p></div><Link className="rounded-full border border-border bg-white px-4 py-2 text-sm" href={`/presentation/${weekDate}`}>預覽公開頁</Link></div><Card className="rounded-[24px] p-4"><form action={createPresentationAction} className="flex flex-col gap-3 md:flex-row"><input type="date" name="week_date" className="rounded-2xl border border-border p-3" defaultValue={weekDate} /><Button type="submit" className="rounded-full">建立本週簡報</Button></form></Card><div className="grid gap-3">{presentations.map((p) => <Card className="rounded-[24px] p-5" key={p.id}><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h2 className="font-semibold">{p.title || p.week_date}</h2><p className="text-sm text-text-2">狀態：{p.status} · slides: {Array.isArray(p.slide_order) ? p.slide_order.length : 0}</p><p className="mt-2 text-xs text-text-2">{p.published_url ? `公開網址：${p.published_url}` : "尚未發布公開網址"}</p></div><div className="flex gap-2"><Link className="rounded-full border border-border px-4 py-2 text-sm" href={`/presentation/${p.week_date}`}>預覽</Link><Link className="rounded-full border border-border px-4 py-2 text-sm" href={`/admin/presentations/${p.id}`}>編輯</Link></div></div></Card>)}</div></div>;
}
