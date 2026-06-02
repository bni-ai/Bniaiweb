/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { getMembers, parseWeekDate } from "../../../../lib/actions/admin-common";
import { getKeynote, saveKeynoteAction } from "../../../../lib/actions/keynote";

export default async function KeynotePage({ searchParams }: { searchParams?: Promise<{ week?: string }> }) {
  const params = await searchParams; const weekDate = parseWeekDate(params?.week); const [members, keynote] = await Promise.all([getMembers(), getKeynote(weekDate)]);
  const images = Array.isArray(keynote?.product_images) ? keynote.product_images.map((item: any) => item.url).join("\n") : "";
  return <div className="space-y-4"><div><p className="text-sm text-text-2">{weekDate}</p><h1 className="text-2xl font-semibold">8 分鐘短講</h1></div><Card className="p-4"><form action={saveKeynoteAction} className="grid gap-3"><input type="hidden" name="week_date" value={weekDate} /><select name="speaker_id" required className="rounded border border-border p-2" defaultValue={keynote?.speaker_id || ""}><option value="">選擇講者</option>{members.map((m) => <option key={m.id} value={m.id}>{m.chinese_name} / {m.specialty_title}</option>)}</select><input name="topic" required className="rounded border border-border p-2" defaultValue={keynote?.topic || ""} placeholder="主題" /><textarea name="outline" className="min-h-32 rounded border border-border p-2" defaultValue={keynote?.outline || ""} placeholder="大綱" /><textarea name="product_images" className="min-h-24 rounded border border-border p-2" defaultValue={images} placeholder="圖片 URL，每行一個" /><select name="status" className="rounded border border-border p-2" defaultValue={keynote?.status || "draft"}><option value="draft">草稿</option><option value="submitted">已提交</option></select><Button type="submit">儲存短講</Button></form></Card></div>;
}
