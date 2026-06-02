import { Button } from "../../../../../components/ui/button";
import { Card } from "../../../../../components/ui/card";
import { getPresentation, publishPresentationAction, saveSlideOrderAction } from "../../../../../lib/actions/presentations";

export default async function PresentationEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const presentation = await getPresentation(id); const slideOrder = JSON.stringify(presentation.slide_order, null, 2);
  return <div className="space-y-4"><div><p className="text-sm text-text-2">{presentation.week_date}</p><h1 className="text-2xl font-semibold">編輯簡報</h1><p className="text-sm text-text-2">狀態：{presentation.status} {presentation.published_url ? `/ ${presentation.published_url}` : ""}</p></div><Card className="p-4"><form action={saveSlideOrderAction} className="grid gap-3"><input type="hidden" name="id" value={presentation.id} /><textarea name="slide_order" className="min-h-96 rounded border border-border p-3 font-mono text-xs" defaultValue={slideOrder} /><Button type="submit">儲存 slide_order</Button></form></Card><Card className="p-4"><form action={publishPresentationAction}><input type="hidden" name="id" value={presentation.id} /><input type="hidden" name="week_date" value={presentation.week_date} /><input type="hidden" name="slide_order" value={JSON.stringify(presentation.slide_order)} /><Button type="submit">發布簡報</Button></form></Card></div>;
}
