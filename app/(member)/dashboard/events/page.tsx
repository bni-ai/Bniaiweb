import { Card } from "../../../../components/ui/card";

export default function EventsPlaceholderPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-2">Coming Soon</p>
        <h1 className="text-3xl font-black">活動</h1>
        <p className="mt-2 text-sm text-text-2">章程活動、報名與出席追蹤會由後續 `bni-chapter-platform` 主線接手。</p>
      </div>
      <Card className="rounded-[24px] p-6 text-sm text-text-2">目前這頁先作為安全入口與驗收佔位，不直接掛未完成的 event flow。</Card>
    </div>
  );
}
