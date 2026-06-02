/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { getMembers, parseWeekDate } from "../../../../lib/actions/admin-common";
import { getKeynote, saveKeynoteAction } from "../../../../lib/actions/keynote";

export default async function KeynotePage({ searchParams }: { searchParams?: Promise<{ week?: string }> }) {
  const params = await searchParams; const weekDate = parseWeekDate(params?.week); const [members, keynote] = await Promise.all([getMembers(), getKeynote(weekDate)]);
  const images = Array.isArray(keynote?.product_images) ? keynote.product_images.map((item: any) => item.url).join("\n") : "";
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-text-2">{weekDate}</p>
          <h1 className="text-3xl font-black">8 分鐘短講</h1>
          <p className="mt-2 text-sm text-text-2">本頁負責每週短講講者、主題、大綱與素材連結。進階編排與投影片生成會由 `presentation-engine` 後續補齊。</p>
        </div>
        <div className="rounded-full bg-[#fff1ea] px-4 py-2 text-sm text-primary">狀態：{keynote?.status || "draft"}</div>
      </div>
      <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[24px] p-5">
          <form action={saveKeynoteAction} className="grid gap-3">
            <input type="hidden" name="week_date" value={weekDate} />
            <select name="speaker_id" required className="rounded-2xl border border-border p-3" defaultValue={keynote?.speaker_id || ""}>
              <option value="">選擇講者</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.chinese_name} / {m.specialty_title}</option>)}
            </select>
            <input name="topic" required className="rounded-2xl border border-border p-3" defaultValue={keynote?.topic || ""} placeholder="主題" />
            <textarea name="outline" className="min-h-40 rounded-2xl border border-border p-3" defaultValue={keynote?.outline || ""} placeholder="大綱" />
            <textarea name="product_images" className="min-h-28 rounded-2xl border border-border p-3" defaultValue={images} placeholder="圖片 URL，每行一個" />
            <select name="status" className="rounded-2xl border border-border p-3" defaultValue={keynote?.status || "draft"}>
              <option value="draft">草稿</option>
              <option value="submitted">已提交</option>
            </select>
            <Button type="submit" className="rounded-full">儲存短講</Button>
          </form>
        </Card>
        <Card className="rounded-[24px] p-5">
          <h2 className="text-xl font-semibold">編輯提示</h2>
          <div className="mt-4 space-y-3 text-sm text-text-2">
            <div className="rounded-2xl border border-border p-4">主題先清楚，再補大綱與示意素材，避免例會現場才臨時改稿。</div>
            <div className="rounded-2xl border border-border p-4">圖片 URL 先用每行一個的方式收資料，後續 slide engine 會接這批素材。</div>
            <div className="rounded-2xl border border-dashed border-border p-4">如果要做到逐頁投影片編排、AI 生文與 presenter view，會在 `presentation-engine` 接續實作。</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
