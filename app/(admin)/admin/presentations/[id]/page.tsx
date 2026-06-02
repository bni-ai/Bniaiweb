import { Button } from "../../../../../components/ui/button";
import { Card } from "../../../../../components/ui/card";
import { getPresentation, publishPresentationAction, regeneratePresentationAction, saveSlideOrderAction } from "../../../../../lib/actions/presentations";
import { parseSlideOrder } from "../../../../../lib/presentation/slide-order";
import { describeSlideEntry, isVisibleSlide } from "../../../../../lib/presentation/workbench";
import type { Json } from "../../../../../lib/supabase/types";

export default async function PresentationEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const presentation = await getPresentation(id);
  const slideOrder = parseSlideOrder(presentation.slide_order as Json);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-text-2">週次 {presentation.week_date}</p>
          <h1 className="text-3xl font-black">簡報工作台</h1>
          <p className="mt-2 text-sm text-text-2">調整投影片順序、預覽 HTML 簡報，確認後再發布。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a className="rounded-full border border-border bg-white px-4 py-2 text-sm" href={`/presentation/${presentation.week_date}`} target="_blank">
            預覽簡報
          </a>
          {presentation.published_url ? (
            <a className="rounded-full border border-border bg-white px-4 py-2 text-sm" href={presentation.published_url} target="_blank">
              開啟公開連結
            </a>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="rounded-lg p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">投影片順序</h2>
              <p className="text-sm text-text-2">調整排序數字與顯示狀態後儲存，前台預覽會讀取最新版本。</p>
            </div>
            <form action={regeneratePresentationAction}>
              <input type="hidden" name="id" value={presentation.id} />
              <input type="hidden" name="week_date" value={presentation.week_date} />
              <Button type="submit" variant="secondary" className="rounded-full px-4">重新產生</Button>
            </form>
          </div>
          <form action={saveSlideOrderAction} className="space-y-3">
            <input type="hidden" name="id" value={presentation.id} />
            <input type="hidden" name="slide_count" value={String(slideOrder.length)} />
            {slideOrder.map((entry, index) => {
              const meta = describeSlideEntry(entry);
              return (
                <div key={`${entry.type}-${"id" in entry ? entry.id : index}`} className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-[72px_1fr_112px] md:items-center">
                  <input type="hidden" name={`slide_payload_${index}`} value={JSON.stringify(entry)} />
                  <label className="grid gap-1 text-xs text-text-2">
                    順序
                    <input name={`slide_order_${index}`} type="number" defaultValue={index + 1} className="rounded border border-border px-2 py-1 text-sm text-text-1" />
                  </label>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-surface-2 px-2 py-1 text-xs font-semibold text-text-2">{meta.typeLabel}</span>
                      <p className="font-semibold text-text-1">{meta.label}</p>
                    </div>
                    <p className="mt-1 text-xs text-text-2">ID：{"id" in entry ? entry.id : entry.type}</p>
                  </div>
                  <label className={`flex items-center gap-2 text-sm ${meta.canToggle ? "text-text-1" : "text-text-3"}`}>
                    <input name={`slide_visible_${index}`} type="checkbox" defaultChecked={!isVisibleSlide(entry) || entry.visible} disabled={!meta.canToggle} />
                    顯示
                  </label>
                </div>
              );
            })}
            <Button type="submit" className="rounded-full px-5">儲存投影片設定</Button>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-lg p-5">
            <h2 className="text-xl font-semibold">簡報資訊</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-text-2">發布狀態</dt><dd className="font-medium">{presentation.status === "published" ? "已發布" : "草稿"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-text-2">投影片數</dt><dd className="font-medium">{slideOrder.length}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-text-2">週次</dt><dd className="font-medium">{presentation.week_date}</dd></div>
            </dl>
          </Card>
          <Card className="rounded-lg p-5">
            <h2 className="text-xl font-semibold">快速操作</h2>
            <div className="mt-4 grid gap-3">
              <a className="rounded-lg border border-border px-4 py-3 text-sm font-medium" href={`/presentation/${presentation.week_date}`} target="_blank">在新分頁預覽</a>
              <form action={publishPresentationAction}>
                <input type="hidden" name="id" value={presentation.id} />
                <input type="hidden" name="week_date" value={presentation.week_date} />
                <input type="hidden" name="slide_order" value={JSON.stringify(slideOrder)} />
                <Button type="submit" className="w-full rounded-lg">發布簡報</Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
