import { MemberForm } from "../member-form";

export default function NewMemberPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-text-2">新增會員</p>
        <h1 className="text-3xl font-black">新增會員</h1>
      </div>
      <MemberForm member={null} />
    </div>
  );
}
