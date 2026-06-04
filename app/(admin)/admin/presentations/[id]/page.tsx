import Link from "next/link";
import { Button } from "../../../../../components/ui/button";
import { Card } from "../../../../../components/ui/card";
import { PresentationCanvasEditor } from "../../../../../components/presentation/canvas-editor";
import { getKeynote } from "../../../../../lib/actions/keynote";
import { getPresentationEditorData, publishPresentationAction, regeneratePresentationAction, saveSlideOrderAction } from "../../../../../lib/actions/presentations";
import { describeSlideEntry, isVisibleSlide } from "../../../../../lib/presentation/workbench";

export default async function PresentationEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { presentation, slides } = await getPresentationEditorData(id);
  const keynote = await getKeynote(presentation.week_date);

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
        imageLayers: [],
      },
      backgroundPreviewUrl: null,
    };
  });

  const hasKeynote = !!keynote?.topic;
  const keynoteSlideIndex = slides.findIndex(({ entry }) => entry.type === "keynote");
  const keynoteSlide = keynoteSlideIndex >= 0 ? slides[keynoteSlideIndex] : null;

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
          <Link
            className="rounded-full border border-border bg-white px-4 py-2 text-sm"
            href={`/admin/keynote?week=${presentation.week_date}`}
          >
            編輯短講
          </Link>
        </div>
      </div>

      {/* Keynote 資料來源提示 */}
      {hasKeynote ? (
        <Card className="rounded-[24px] border-primary bg-[#fff1ea] p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-primary">8 分鐘短講資料已設定</h2>
              <p className="mt-1 text-sm text-text-2">
                講者主題：「{keynote.topic}」
                {keynoteSlide ? ` — 目前為簡報第 ${keynoteSlideIndex + 1} 頁` : " — 簡報中尚無短講頁面（按「重新產生」可加入）"}
              </p>
              <p className="mt-1 text-xs text-text-3">
                此頁內容來自「8 分鐘短講」設定。修改講者、主題或素材請點右邊「編輯短講」。
              </p>
            </div>
            <Link
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
              href={`/admin/keynote?week=${presentation.week_date}`}
            >
              編輯短講內容
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="rounded-[24px] border-dashed border-border bg-surface-1 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-2">尚未設定 8 分鐘短講</h2>
              <p className="mt-1 text-sm text-text-2">本週簡報尚無短講資料。設定後，簡報會自動產生對應的短講投影片。</p>
            </div>
            <Link
              className="rounded-full border border-border bg-white px-4 py-2 text-sm"
              href={`/admin/keynote?week=${presentation.week_date}`}
            >
              前往設定短講
            </Link>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
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
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="rounded-2xl p-5">
            <h2 className="text-xl font-semibold">怎麼編這份簡報</h2>
            <div className="mt-4 space-y-3 text-sm text-text-2">
              <p>1. 左邊先切到要編的頁面。</p>
              <p>2. 右邊上傳 JPG / PNG 底圖。</p>
              <p>3. 在畫布上新增文字框，再直接拖到指定位置。</p>
              <p>4. 右邊可改字體大小、顏色、粗細、對齊與尺寸。</p>
              <p>5. 儲存後先看預覽，確認無誤再發布公開連結。</p>
              {hasKeynote ? <p className="text-primary">6. 短講頁面的文字內容來自「8 分鐘短講」設定，修改請點上方「編輯短講」。</p> : null}
            </div>
          </Card>
          <Card className="rounded-2xl p-5">
            <h2 className="text-xl font-semibold">簡報資訊</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-text-2">發布狀態</dt><dd className="font-medium">{presentation.status === "published" ? "已發布" : "草稿"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-text-2">投影片數</dt><dd className="font-medium">{slides.length}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-text-2">週次</dt><dd className="font-medium">{presentation.week_date}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-text-2">短講</dt><dd className="font-medium">{hasKeynote ? keynote.topic : "尚未設定"}</dd></div>
            </dl>
          </Card>
          <Card className="rounded-2xl p-5">
            <h2 className="text-xl font-semibold">快速操作</h2>
            <div className="mt-4 grid gap-3">
              <a className="rounded-2xl border border-border px-4 py-3 text-sm font-medium" href={`/admin/presentations/${presentation.id}/preview`} target="_blank">在新分頁預覽</a>
              <Link
                className="rounded-2xl border border-border px-4 py-3 text-center text-sm font-medium"
                href={`/admin/keynote?week=${presentation.week_date}`}
              >
                編輯本週短講
              </Link>
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
