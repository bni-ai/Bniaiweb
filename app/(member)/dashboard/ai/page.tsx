import { Card } from "../../../../components/ui/card";
import { getAiAssistantPageData, submitAiQueryAction } from "../../../../lib/actions/ai-assistant";

const prompts = ["撰寫一對一邀請", "優化 30 秒簡報", "查詢會員資料", "產生提醒預覽"];

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
        <p className="text-sm text-text-2">AI Assistant</p>
        <h1 className="text-3xl font-black">AI 助手</h1>
        <p className="mt-2 text-sm text-text-2">目前使用中的 provider：{data.activeProvider.provider} / {data.activeProvider.model_name || "未設定 model"}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="flex min-h-[560px] flex-col rounded-2xl p-0">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">AI</div>
              <div>
                <h2 className="font-semibold">BNI 華AI 助手</h2>
                <p className="text-xs text-text-2">active · {data.activeProvider.provider}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <div className="flex max-w-[78%] gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 text-xs font-semibold">AI</div>
              <div className="border-l-2 border-border pl-4 text-sm leading-7 text-text-1">
                你好，我可以協助撰寫一對一邀請、整理 30 秒簡報、查詢會員資料，以及預覽未提交提醒。
              </div>
            </div>

            {params?.q ? (
              <div className="ml-auto flex max-w-[78%] flex-row-reverse gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-text-1 text-xs font-semibold text-white">
                  {(data.member?.chinese_name || "我").slice(-1)}
                </div>
                <div className="rounded-2xl bg-surface-2 px-4 py-3 text-sm leading-7 text-text-1">{params.q}</div>
              </div>
            ) : null}

            {data.queryResult ? (
              <div className="flex max-w-[82%] gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 text-xs font-semibold">AI</div>
                <div className="border-l-2 border-border pl-4 text-sm leading-7 text-text-1">
                  {data.queryResult.answer}
                </div>
              </div>
            ) : null}

            {params?.error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</div> : null}
          </div>

          <div className="border-t border-border px-5 py-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {prompts.map((prompt) => (
                <span key={prompt} className="rounded-full border border-border px-3 py-1 text-xs text-text-2">{prompt}</span>
              ))}
            </div>
            <form action={submitAiQueryAction} className="flex gap-2">
              <textarea
                name="query"
                defaultValue={params?.q || ""}
                className="min-h-11 flex-1 resize-none rounded-2xl border border-border px-3 py-2.5 text-sm"
                placeholder="例如：誰的專業是 AI落地"
              />
              <button type="submit" className="rounded-2xl bg-text-1 px-5 py-2.5 text-sm font-semibold text-white">送出查詢</button>
            </form>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-2xl p-5">
            <h2 className="text-xl font-semibold">本週提醒預覽</h2>
            <p className="mt-1 text-sm text-text-2">週次：{data.effectiveWeek}</p>
            <div className="mt-4 space-y-3">
              {data.reminderPreview.slice(0, 4).map((item) => (
                <div key={item.memberName} className="rounded-2xl border border-border p-3 text-sm">
                  <p className="font-medium text-text-1">{item.memberName}</p>
                  <p className="mt-1 line-clamp-2 text-text-2">{item.message}</p>
                </div>
              ))}
              {data.reminderPreview.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-text-2">本週已無未提交會員。</div> : null}
            </div>
          </Card>

          <Card className="rounded-2xl p-5">
            <h2 className="text-xl font-semibold">最近查詢</h2>
            <div className="mt-4 space-y-3 text-sm">
              {data.recentConversations.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border p-3">
                  <p className="line-clamp-2 font-medium text-text-1">{item.query}</p>
                  <p className="mt-1 text-xs text-text-2">{item.provider} · {item.created_at.slice(0, 16).replace("T", " ")}</p>
                </div>
              ))}
              {data.recentConversations.length === 0 ? <p className="text-text-2">目前還沒有查詢紀錄。</p> : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
