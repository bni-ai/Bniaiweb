import { Card } from "../../../../components/ui/card";

export default function AdminSettingsPlaceholderPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-2">Settings Boundary</p>
        <h1 className="text-3xl font-black">系統設定</h1>
        <p className="mt-2 text-sm text-text-2">分會設定、AI provider、提醒規則與 BNI Connect 帳密管理還在後續主線。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[24px] p-5 text-sm text-text-2">分會資訊：coming soon</Card>
        <Card className="rounded-[24px] p-5 text-sm text-text-2">AI 設定：coming soon</Card>
        <Card className="rounded-[24px] p-5 text-sm text-text-2">例會設定：coming soon</Card>
      </div>
    </div>
  );
}
