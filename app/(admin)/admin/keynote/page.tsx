/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { getMembers, parseWeekDate } from "../../../../lib/actions/admin-common";
import { getKeynote, getKeynoteTalkMaterials, saveKeynoteAction } from "../../../../lib/actions/keynote";

export default async function KeynotePage({ searchParams }: { searchParams?: Promise<{ week?: string; saved?: string }> }) {
  const params = await searchParams;
  const weekDate = parseWeekDate(params?.week);
  const [members, keynote, materials] = await Promise.all([getMembers(), getKeynote(weekDate), getKeynoteTalkMaterials(weekDate)]);
  const images = Array.isArray(keynote?.product_images) ? keynote.product_images.map((item: any) => item.url).join("\n") : "";
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-text-2">{weekDate}</p>
          <h1 className="text-3xl font-black">8 分鐘短講</h1>
          <p className="mt-2 text-sm text-text-2">本頁負責每週短講講者、主題、大綱與素材。viewer 會直接吃這批資料與圖片。</p>
        </div>
        <div className="rounded-full bg-[#fff1ea] px-4 py-2 text-sm text-primary">狀態：{keynote?.status || "draft"}</div>
      </div>
      {params?.saved ? <Card className="rounded-[20px] border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">短講資料已儲存。</Card> : null}
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
            <textarea name="product_images" className="min-h-24 rounded-2xl border border-border p-3" defaultValue={images} placeholder="外部圖片 URL，每行一個，可留空" />
            <input name="product_image_files" type="file" accept="image/jpeg,image/png" multiple className="block w-full text-sm" />
            <p className="text-xs text-text-2">可直接上傳 JPG / PNG，最多 5 張；也可補外部圖片 URL。</p>
            <select name="status" className="rounded-2xl border border-border p-3" defaultValue={keynote?.status || "draft"}>
              <option value="draft">草稿</option>
              <option value="submitted">已提交</option>
            </select>
            <Button type="submit" className="rounded-full">儲存短講</Button>
          </form>
        </Card>
        <Card className="rounded-[24px] p-5">
          <h2 className="text-xl font-semibold">目前素材</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {materials.map((image: { id: string; url: string }) => (
              <img key={image.id} src={image.url} alt="短講素材" className="h-32 w-full rounded-2xl object-cover" />
            ))}
            {materials.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-text-2">目前還沒有上傳素材。</div> : null}
          </div>
          <div className="mt-4 space-y-3 text-sm text-text-2">
            <div className="rounded-2xl border border-border p-4">實體上傳後，檔案會進 Supabase Storage，公開簡報會直接顯示這批圖片。</div>
            <div className="rounded-2xl border border-dashed border-border p-4">目前可管理本週短講講者、主題、大綱與素材；排程延伸可在後續獨立 SR 擴充。</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
