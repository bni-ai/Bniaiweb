import { Card } from "../../../../components/ui/card";
import { getMemberDirectory } from "../../../../lib/actions/member-portal";

export default async function MemberDirectoryPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const params = await searchParams; const q = params?.q || ""; const members = await getMemberDirectory(q);
  return <div className="space-y-4"><div><h1 className="text-2xl font-semibold">成員名冊</h1><p className="text-sm text-text-2">只顯示會員互相認識所需的基本資訊，不提供直接預約或後台操作。</p></div><form><input name="q" className="w-full rounded border border-border p-2" defaultValue={q} placeholder="搜尋姓名、英文名或專業" /></form><div className="grid gap-3 md:grid-cols-2">{members.map((m) => <Card className="p-4" key={m.id}><h2 className="font-semibold">{m.chinese_name}{m.english_name ? ` / ${m.english_name}` : ""}</h2><p className="text-sm text-primary">{m.specialty_title || "未填專業"}</p><p className="text-sm text-text-2">{m.company_name || "未填公司"}</p><p className="mt-2 text-sm">{m.specialty_description || "尚未填寫詳細介紹"}</p><p className="mt-2 text-xs text-text-2">LINE：{m.line_name || "未公開"}</p></Card>)}</div>{members.length === 0 ? <Card className="p-4 text-sm text-text-2">沒有符合的會員。</Card> : null}</div>;
}
