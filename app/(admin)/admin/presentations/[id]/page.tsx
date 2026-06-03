import { Button } from "../../../../../components/ui/button";
import { Card } from "../../../../../components/ui/card";
import { PresentationCanvasEditor } from "../../../../../components/presentation/canvas-editor";
import { getPresentationEditorData, publishPresentationAction, regeneratePresentationAction, saveSlideOrderAction } from "../../../../../lib/actions/presentations";
import { describeSlideEntry, isVisibleSlide } from "../../../../../lib/presentation/workbench";

export default async function PresentationEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { presentation, slides } = await getPresentationEditorData(id);
  const initialSlides = slides.map(({ entry, runtime }, index) => {
    const meta = describeSlideEntry(entry);
    return {
      entry,
      label: meta.label,
      typeLabel: meta.typeLabel,
      canToggle: meta.canToggle,
      visible: isVisibleSlide(entry) ? entry.visible : true,
      order: index + 1,
      editor: runtime?.editor || {
        title: meta.label,
        body: "",
        backgroundImageUrl: null,
        fontSize: "lg" as const,
        textLayers: [],
      },
      backgroundPreviewUrl: null,
    };
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-text-2">週次 {presentation.week_date}</p>
          <h1 className="text-3xl font-black">簡報工作台</h1>
          <p className="mt-2 text-sm text-text-2">每頁可上傳底圖，再把文字框拖到指定位置；預覽與前台簡報共用同一個版面。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a className="rounded-full border border-border bg-white px-4 py-2 text-sm" href={`/admin/presentations/${presentation.id}/preview`} target="_blank">
            預覽簡報
          </a>
          {presentation.published_url ? (
            <a className="rounded-full border border-border bg-white px-4 py-2 text-sm" href={presentation.published_url} target="_blank">
              開啟公開連結
            </a>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4">
        <Card className="rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">投影片編輯</h2>
              <p className="text-sm text-text-2">先選頁面，再上傳底圖與排版文字框。拖拉與 resize 直接影響前台顯示。</p>
            </div>
            <form action={regeneratePresentationAction}>
              <input type="hidden" name="id" value={presentation.id} />
              <input type="hidden" name="week_date" value={presentation.week_date} />
              <Button type="submit" variant="secondary" className="rounded-full px-4">重新產生</Button>
            </form>
          </div>
          <form action={saveSlideOrderAction} className="space-y-4">
            <input type="hidden" name="id" value={presentation.id} />
            <input type="hidden" name="slide_count" value={String(slides.length)} />
            <PresentationCanvasEditor initialSlides={initialSlides} presentationId={presentation.id} />
            <Button type="submit" className="rounded-full px-5">儲存簡報內容</Button>
          </form>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="rounded-2xl p-5">
            <h2 className="text-xl font-semibold">怎麼編這份簡報</h2>
            <div className="mt-4 space-y-3 text-sm text-text-2">
              <p>1. 左邊先切到要編的頁面。</p>
              <p>2. 右邊上傳 JPG / PNG 底圖。</p>
              <p>3. 在畫布上新增文字框，再直接拖到指定位置。</p>
              <p>4. 右邊可改字體大小、顏色、粗細、對齊與尺寸。</p>
              <p>5. 儲存後先看預覽，確認無誤再發布公開連結。</p>
            </div>
          </Card>
          <Card className="rounded-2xl p-5">
            <h2 className="text-xl font-semibold">簡報資訊</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-text-2">發布狀態</dt><dd className="font-medium">{presentation.status === "published" ? "已發布" : "草稿"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-text-2">投影片數</dt><dd className="font-medium">{slides.length}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-text-2">週次</dt><dd className="font-medium">{presentation.week_date}</dd></div>
            </dl>
          </Card>
          <Card className="rounded-2xl p-5">
            <h2 className="text-xl font-semibold">快速操作</h2>
            <div className="mt-4 grid gap-3">
              <a className="rounded-2xl border border-border px-4 py-3 text-sm font-medium" href={`/admin/presentations/${presentation.id}/preview`} target="_blank">在新分頁預覽</a>
              <form action={publishPresentationAction}>
                <input type="hidden" name="id" value={presentation.id} />
                <input type="hidden" name="return_to" value={`/admin/presentations/${presentation.id}?published=1`} />
                <Button type="submit" className="w-full rounded-2xl">發布簡報</Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
