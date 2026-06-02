import { Card } from "../ui/card";

const stats = [
  { label: "會員人數", value: "36 名會員" },
  { label: "例會頻率", value: "每週例會" },
  { label: "合作成效", value: "累計推薦成交" },
];

export function StatsSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <Card key={item.label} className="p-5">
            <p className="text-sm text-text-2">{item.label}</p>
            <p className="mt-2 text-xl font-semibold text-text-1">{item.value}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
