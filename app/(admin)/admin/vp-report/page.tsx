import { Card } from "../../../../components/ui/card";
import { parseWeekDate } from "../../../../lib/actions/admin-common";
import { getVpReport } from "../../../../lib/actions/vp-report";
import { VpReportForm } from "./vp-report-form";

export default async function VpReportPage({ searchParams }: { searchParams?: Promise<{ week?: string }> }) {
  const params = await searchParams;
  const weekDate = parseWeekDate(params?.week);
  const report = await getVpReport(weekDate);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-text-2">{weekDate}</p>
        <h1 className="text-2xl font-semibold">VP 報告</h1>
      </div>
      <Card className="p-4">
        <VpReportForm weekDate={weekDate} report={report} />
      </Card>
    </div>
  );
}
