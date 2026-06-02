import { Card } from "../../../../components/ui/card";
import { getAiAssistantPageData, submitAiQueryAction } from "../../../../lib/actions/ai-assistant";

export default async function AiAssistantPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; week?: string; error?: string }>;
}) {
  const params = await searchParams;
  const data = await getAiAssistantPageData(params?.q, params?.week);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-2">AI Baseline</p>
        <h1 className="text-3xl font-black">AI 助手</h1>
        <p className="mt-2 text-sm text-text-2">目前先完成 provider baseline、會員查詢與提醒預覽，不放假聊天介面。</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
        <Card className="rounded-[24px] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">會員查詢</h2>
              <p className="mt-1 text-sm text-text-2">目前使用中的 provider：{data.activeProvider.provider} / {data.activeProvider.model_name || "未設定 model"}</p>
            </div>
            <div className="rounded-full bg-[#fff1ea] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">active</div>
          </div>
          {params?.error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</div> : null}
          <form action={submitAiQueryAction} className="mt-4 grid gap-3">
            <textarea
              name="query"
              defaultValue={params?.q || ""}
              className="min-h-28 rounded-2xl border border-border px-3 py-2.5"
              placeholder="例如：誰的專業是 AI落地"
            />
            <button type="submit" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">送出查詢</button>
          </form>
          <div className="mt-4 rounded-2xl border border-dashed border-border p-4 text-xs text-text-2">切換 provider 後不需重部署；下一筆查詢會直接改用新的 active provider。</div>
        </Card>

        <Card className="rounded-[24px] p-5">
          <h2 className="text-xl font-semibold">本週提醒預覽</h2>
          <p className="mt-1 text-sm text-text-2">週次：{data.effectiveWeek}。這裡顯示目前尚未提交 weekly brief 的會員提醒內容。</p>
          <div className="mt-4 space-y-3">
            {data.reminderPreview.map((item) => (
              <div key={item.memberName} className="rounded-2xl border border-border p-4 text-sm">
                <p className="font-medium text-text-1">{item.memberName}</p>
                <p className="mt-2 text-text-2">{item.message}</p>
              </div>
            ))}
            {data.reminderPreview.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-text-2">本週已無未提交會員。</div> : null}
          </div>
        </Card>
      </div>

      {data.queryResult ? (
        <Card className="rounded-[24px] p-5">
          <h2 className="text-xl font-semibold">查詢結果</h2>
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-surface-2 p-4 text-sm text-text-1">{data.queryResult.answer}</pre>
        </Card>
      ) : null}

      <Card className="rounded-[24px] p-5">
        <h2 className="text-xl font-semibold">最近查詢紀錄</h2>
        <div className="mt-4 space-y-3 text-sm">
          {data.recentConversations.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border p-4">
              <p className="font-medium text-text-1">{item.query}</p>
              <p className="mt-1 text-text-2">{item.provider} · {item.created_at.slice(0, 16).replace("T", " ")}</p>
            </div>
          ))}
          {data.recentConversations.length === 0 ? <p className="text-text-2">目前還沒有查詢紀錄。</p> : null}
        </div>
      </Card>
    </div>
  );
}
