import { Card } from "../../../../components/ui/card";
import { getMemberDirectory } from "../../../../lib/actions/member-portal";

export default async function MemberDirectoryPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const params = await searchParams; const q = params?.q || ""; const members = await getMemberDirectory(q);
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black">會員通訊錄</h1>
          <p className="mt-2 text-sm text-text-2">{members.length} 位成員 · 只顯示會員互相認識所需的基本資訊</p>
        </div>
      </div>
      <form>
        <input name="q" className="w-full rounded-2xl border border-border bg-white px-4 py-3" defaultValue={q} placeholder="搜尋姓名、英文名或專業" />
      </form>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {members.map((m) => (
          <details key={m.id}>
            <summary className="list-none">
              <Card className="cursor-pointer rounded-[24px] p-5 shadow-[0_10px_30px_rgba(17,24,39,0.04)] transition hover:-translate-y-0.5 hover:border-primary/30">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{m.chinese_name}{m.english_name ? ` / ${m.english_name}` : ""}</h2>
                    <p className="mt-1 text-sm font-medium text-primary">{m.specialty_title || "未填專業"}</p>
                    <p className="mt-1 text-sm text-text-2">{m.company_name || "未填公司"}</p>
                  </div>
                  <span className="rounded-full bg-[#fff1ea] px-3 py-1 text-xs text-primary">查看詳情</span>
                </div>
                <p className="mt-4 line-clamp-3 text-sm text-text-2">{m.specialty_description || "尚未填寫詳細介紹"}</p>
              </Card>
            </summary>
            <Card className="mt-3 rounded-[24px] border-primary/15 bg-[#fffdfb] p-5">
              <h3 className="text-xl font-semibold">{m.chinese_name}</h3>
              <p className="mt-1 text-sm font-medium text-primary">{m.specialty_title || "未填專業"}</p>
              <p className="mt-2 text-sm text-text-2">{m.company_name || "未填公司"}</p>
              <p className="mt-4 whitespace-pre-line text-sm leading-7">{m.specialty_description || "尚未填寫詳細介紹"}</p>
              <div className="mt-4 rounded-2xl border border-dashed border-border p-4 text-sm text-text-2">
                <p>LINE：{m.line_name || "未公開"}</p>
                <p className="mt-2">一對一預約功能仍由後續 `member-module` 接手，現階段先不開放直連操作。</p>
              </div>
            </Card>
          </details>
        ))}
      </div>
      {members.length === 0 ? <Card className="rounded-[24px] p-5 text-sm text-text-2">沒有符合的會員。</Card> : null}
    </div>
  );
}
