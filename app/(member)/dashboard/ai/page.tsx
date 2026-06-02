import { Card } from "../../../../components/ui/card";

export default function AiPlaceholderPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-2">Coming Soon</p>
        <h1 className="text-3xl font-black">AI 助手</h1>
        <p className="mt-2 text-sm text-text-2">AI provider 切換、成員查詢與提醒生成會由後續 `bni-chapter-platform` 接手。</p>
      </div>
      <Card className="rounded-[24px] p-6 text-sm text-text-2">目前不顯示假聊天介面，避免使用者誤以為已正式上線。</Card>
    </div>
  );
}
