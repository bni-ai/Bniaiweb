import Link from "next/link";

import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { parseWeekDate } from "../../../../lib/actions/admin-common";
import { createPresentationAction, getPresentations } from "../../../../lib/actions/presentations";

export default async function PresentationPage({ searchParams }: { searchParams?: Promise<{ week?: string }> }) {
  const params = await searchParams; const weekDate = parseWeekDate(params?.week); const presentations = await getPresentations();
  return <div className="space-y-4"><div><p className="text-sm text-text-2">{weekDate}</p><h1 className="text-2xl font-semibold">簡報管理</h1></div><Card className="p-4"><form action={createPresentationAction} className="flex gap-3"><input type="date" name="week_date" className="rounded border border-border p-2" defaultValue={weekDate} /><Button type="submit">建立本週簡報</Button></form></Card><div className="grid gap-3">{presentations.map((p) => <Card className="p-4" key={p.id}><div className="flex items-center justify-between"><div><h2 className="font-semibold">{p.title || p.week_date}</h2><p className="text-sm text-text-2">{p.status} / slides: {Array.isArray(p.slide_order) ? p.slide_order.length : 0}</p></div><Link className="rounded border border-border px-3 py-2 text-sm" href={`/admin/presentations/${p.id}`}>編輯</Link></div></Card>)}</div></div>;
}
