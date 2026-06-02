import { Card } from "../../../../components/ui/card";

export default function OneOnOnePlaceholderPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-2">Coming Soon</p>
        <h1 className="text-3xl font-black">一對一預約</h1>
        <p className="mt-2 text-sm text-text-2">這個入口已保留，底層 booking、availability、Jitsi 流程會由 `member-module` 完成。</p>
      </div>
      <Card className="rounded-[24px] p-6 text-sm text-text-2">目前先不開放實際預約，避免出現「按了但壞掉」的假功能。</Card>
    </div>
  );
}
