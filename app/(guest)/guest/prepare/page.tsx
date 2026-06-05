import { Card } from "../../../../components/ui/card";

const prompts = [
  ["姓名", "讓大家清楚記住你的稱呼。"],
  ["公司", "說明你目前代表的品牌或服務團隊。"],
  ["專業", "用一句話說出你最擅長解決的問題。"],
  ["希望被引薦的對象", "例如特定產業、職稱、公司規模或正在遇到的問題。"],
  ["一句明確需求", "把需求說成可以被幫忙轉介紹的一句話。"],
];

export default function GuestPreparePage() {
  return (
    <div className="space-y-5">
      <div className="rounded-[28px] bg-primary p-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/70">15 秒介紹</p>
        <h1 className="mt-3 text-4xl font-black">準備你的 15 秒自我介紹</h1>
        <p className="mt-3 max-w-2xl text-white/80">重點不是講完整公司簡介，而是讓會員知道「你是誰、你能幫誰、你現在想被引薦給誰」。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        {prompts.map(([title, text]) => (
          <Card key={title} className="p-5">
            <p className="text-sm text-text-2">{title}</p>
            <p className="mt-3 text-sm leading-6">{text}</p>
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <h2 className="text-xl font-bold">範例句型</h2>
        <p className="mt-3 text-sm leading-7 text-text-2">
          我是某某，來自某某公司，專門協助某類客戶解決某個問題。這次我希望被引薦給正在尋找某某解決方案的企業主或部門主管。
        </p>
      </Card>
    </div>
  );
}
