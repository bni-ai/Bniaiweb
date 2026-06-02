import { Card } from "../ui/card";

const features = [
  {
    title: "每週例會",
    text: "固定節奏追蹤會員商機，讓引薦流程可持續運作。",
  },
  {
    title: "一對一配對",
    text: "透過可用時段與預約流程，建立高品質商務連結。",
  },
  {
    title: "會員成長追蹤",
    text: "以週報、教育學分與關鍵指標協助會員持續進步。",
  },
  {
    title: "AI 簡報系統",
    text: "把例會資料整理成可分享的視覺化簡報，提升溝通效率。",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-4 py-10">
      <h2 className="mb-4 text-2xl font-semibold text-text-1">分會價值</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title} className="p-5">
            <h3 className="text-lg font-semibold text-text-1">{feature.title}</h3>
            <p className="mt-2 text-sm text-text-2">{feature.text}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
