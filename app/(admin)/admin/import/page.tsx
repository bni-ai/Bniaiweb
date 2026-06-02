import { Card } from "../../../../components/ui/card";

export default function AdminImportPlaceholderPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-2">Import Boundary</p>
        <h1 className="text-3xl font-black">資料匯入</h1>
        <p className="mt-2 text-sm text-text-2">CSV / Google Sheets 匯入仍屬未完成主線，這裡先保留安全 route 與狀態說明。</p>
      </div>
      <Card className="rounded-[24px] p-6 text-sm text-text-2">正式匯入流程會包含欄位對應、逐列驗證、重複資料檢查與 atomic commit；目前不直接暴露未完成操作。</Card>
    </div>
  );
}
