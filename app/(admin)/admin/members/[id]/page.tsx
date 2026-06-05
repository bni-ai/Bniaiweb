import { notFound } from "next/navigation";

import { getAdminMemberById } from "../../../../../lib/actions/members";
import { MemberForm } from "../member-form";

export default async function AdminMemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await getAdminMemberById(id);
  if (!member) notFound();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-text-2">編輯會員</p>
        <h1 className="text-3xl font-black">{member.chinese_name}</h1>
        <p className="mt-2 text-sm text-text-2">{member.email}</p>
      </div>
      <MemberForm member={member} />
    </div>
  );
}
