import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { getMyTopClients, saveMyTopClientsAction } from "../../../../lib/actions/members";

export default async function TopClientsPage() {
  const clients = await getMyTopClients();
  const byRank = new Map(clients.map((client) => [client.rank, client]));

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-2">Top Clients</p>
        <h1 className="text-3xl font-black">前十名客戶</h1>
      </div>
      <form action={saveMyTopClientsAction} className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 10 }, (_, index) => index + 1).map((rank) => {
          const client = byRank.get(rank);
          return (
            <Card key={rank} className="rounded-[24px] p-5">
              <h2 className="text-lg font-semibold">Rank {rank}</h2>
              <div className="mt-4 grid gap-3">
                <input name={`rank_${rank}_industry`} defaultValue={client?.industry || ""} placeholder="產業" className="rounded-2xl border border-border px-3 py-2.5" />
                <input name={`rank_${rank}_company_type`} defaultValue={client?.company_type || ""} placeholder="公司類型" className="rounded-2xl border border-border px-3 py-2.5" />
                <input name={`rank_${rank}_location`} defaultValue={client?.location || ""} placeholder="地區" className="rounded-2xl border border-border px-3 py-2.5" />
                <textarea name={`rank_${rank}_notes`} defaultValue={client?.notes || ""} placeholder="備註" className="min-h-24 rounded-2xl border border-border px-3 py-2.5" />
              </div>
            </Card>
          );
        })}
        <div className="md:col-span-2"><Button type="submit" className="rounded-full px-5">儲存前十名客戶</Button></div>
      </form>
    </div>
  );
}
