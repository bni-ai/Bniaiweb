import Link from "next/link";

import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { parseWeekDate } from "../../../../lib/actions/admin-common";
import { getKeynote } from "../../../../lib/actions/keynote";
import { createPresentationAction, getPresentations, publishPresentationAction, unpublishPresentationAction } from "../../../../lib/actions/presentations";
import { DeletePresentationButton } from "./delete-presentation-button";
import { parseSlideOrder } from "../../../../lib/presentation/slide-order";
import { describeSlideThumbnail, isVisibleSlide } from "../../../../lib/presentation/workbench";
import type { Json } from "../../../../lib/supabase/types";

function visibleSlideEntries(slideOrder: unknown) {
  try {
    return parseSlideOrder(slideOrder as Json).filter((entry) => !isVisibleSlide(entry) || entry.visible);
  } catch {
    return [];
  }
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString("zh-TW", { hour12: false }) : "-";
}

export default async function PresentationPage({ searchParams }: { searchParams?: Promise<{ week?: string }> }) {
  const params = await searchParams;
  const weekDate = parseWeekDate(params?.week);
  const presentations = await getPresentations();

  // 並行查詢每週 keynote
  const keynotes = await Promise.all(
    presentations.map((p) => getKeynote(p.week_date))
  );
  const keynoteMap = new Map(
    keynotes.filter(Boolean).map((k) => [k.week_date, k])
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-text-2">{weekDate}</p>
          <h1 className="text-3xl font-black">簡報管理</h1>
          <p className="mt-2 text-sm text-text-2">建立、編輯、發布本週簡報。公開檢視器、型別化投影片引擎與相容舊連結的別名已接上。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="rounded-full border border-border bg-white px-4 py-2 text-sm" href={`/presentation/${weekDate}`}>
            預覽公開頁
          </Link>
          <Link
            className="rounded-full border border-border bg-white px-4 py-2 text-sm"
            href={`/admin/keynote?week=${weekDate}`}
          >
            編輯本週短講
          </Link>
        </div>
      </div>

      <Card className="rounded-[24px] p-4">
        <form action={createPresentationAction} className="flex flex-col gap-3 md:flex-row">
          <input type="date" name="week_date" className="rounded-2xl border border-border p-3" defaultValue={weekDate} />
          <Button type="submit" className="rounded-full">建立本週簡報</Button>
        </form>
      </Card>

      <div className="grid gap-3">
        {presentations.map((p) => {
          const slides = visibleSlideEntries(p.slide_order);
          const isPublished = p.status === "published";
          const keynote = keynoteMap.get(p.week_date);
          const hasKeynote = !!keynote?.topic;
          return (
          <Card className="rounded-[28px] p-5" data-testid={`presentation-card-${p.week_date}`} key={p.id}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold">{p.title || p.week_date}</h2>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded bg-surface-2 px-2 py-1">狀態：<span data-testid="presentation-status">{isPublished ? "已發布" : "草稿"}</span></span>
                  <span className="rounded bg-surface-2 px-2 py-1">投影片：<span data-testid="presentation-slide-count">{slides.length}</span></span>
                  <span className="rounded bg-surface-2 px-2 py-1">更新：{formatDateTime(p.updated_at)}</span>
                </div>
                {/* Keynote 資訊 */}
                {hasKeynote ? (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="rounded bg-[#fff1ea] px-2 py-1 text-primary">8 分鐘短講</span>
                    <span className="text-text-2">{keynote.topic}</span>
                    <Link className="text-primary hover:underline" href={`/admin/keynote?week=${p.week_date}`}>
                      編輯短講 →
                    </Link>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="rounded bg-surface-2 px-2 py-1 text-text-3">尚無短講</span>
                    <Link className="text-text-2 hover:text-text-1 hover:underline" href={`/admin/keynote?week=${p.week_date}`}>
                      新增短講 →
                    </Link>
                  </div>
                )}
                <p className="mt-2 text-xs text-text-2" data-testid="presentation-public-link">{isPublished && p.published_url ? `公開網址：${p.published_url}` : "尚未發布公開網址"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link className="rounded-full border border-border px-4 py-2 text-sm" href={`/presentation/${p.week_date}`} target="_blank">預覽</Link>
                <Link className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white" href={`/admin/presentations/${p.id}`}>編輯工作台</Link>
                {isPublished ? (
                  <form action={unpublishPresentationAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <Button type="submit" variant="secondary" className="rounded-full px-4">取消發布</Button>
                  </form>
                ) : (
                  <form action={publishPresentationAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="week_date" value={p.week_date} />
                    <input type="hidden" name="slide_order" value={JSON.stringify(slides)} />
                    <Button type="submit" className="rounded-full px-4">發布簡報</Button>
                  </form>
                )}
                <DeletePresentationButton id={p.id} />
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6" data-testid="presentation-thumbnail-grid">
              {slides.map((entry, index) => {
                const meta = describeSlideThumbnail(entry);
                const isKeynoteSlide = entry.type === "keynote";
                return (
                  <div key={`${entry.type}-${"id" in entry ? entry.id : index}`} className={`rounded-[20px] border p-4 ${isKeynoteSlide ? "border-primary bg-[#fff1ea]" : "border-border bg-surface-1"}`}>
                    <p className="text-xs font-semibold text-text-3">#{index + 1} · {meta.typeLabel}</p>
                    <p className="mt-2 text-lg font-black text-text-1">{meta.label}</p>
                    <p className="mt-1 text-xs text-text-2">類型：{meta.typeLabel}</p>
                    {isKeynoteSlide && hasKeynote ? (
                      <p className="mt-1 text-xs text-primary truncate">{keynote.topic}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Card>
        );
        })}
      </div>
    </div>
  );
}
