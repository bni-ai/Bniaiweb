import { Card } from "../../../../components/ui/card";

export default function TrainingPlaceholderPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-2">Coming Soon</p>
        <h1 className="text-3xl font-black">培訓紀錄</h1>
        <p className="mt-2 text-sm text-text-2">training records 已有資料表，但完整會員端體驗仍會由後續主線補齊。</p>
      </div>
      <Card className="rounded-[24px] p-6 text-sm text-text-2">這裡會放學分統計、課程完成狀態與建議下一課，目前先保留安全入口。</Card>
    </div>
  );
}
