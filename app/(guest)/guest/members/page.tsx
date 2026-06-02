import { Card } from "../../../../components/ui/card";
import { getLimitedGuestMemberDirectory } from "../../../../lib/actions/guest-portal";

export default async function GuestMembersPage() {
  const members = await getLimitedGuestMemberDirectory();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-text-2">Limited Directory</p>
        <h1 className="text-3xl font-black">來賓可見會員資訊</h1>
        <p className="mt-2 text-sm text-text-2">此頁只提供公開專業資訊，正式會員互動功能不會在來賓專區開放。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {members.map((member) => (
          <Card key={member.id} className="p-5">
            <h2 className="text-lg font-bold">{member.chinese_name}</h2>
            <p className="mt-1 text-sm font-semibold text-primary">{member.specialty_title || "專業資訊待補"}</p>
            <p className="mt-1 text-sm text-text-2">{member.company_name || "公司資訊待補"}</p>
            <p className="mt-4 text-sm leading-6">{member.specialty_description || "尚未公開詳細介紹。"}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
