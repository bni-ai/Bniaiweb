import Link from "next/link";

import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import type { MemberRecord } from "../../../../lib/actions/members";
import { adminUpsertMemberAction } from "../../../../lib/actions/members";

const positionOptions = ["", "主席", "副主席", "秘書財務", "資訊組長", "成長協調", "活動協調", "導師協調", "教育協調", "來賓接待"];
const committeeOptions = ["", "導師群", "接待組員", "教育組員", "秘財組員", "資訊組員", "成長組員", "活動組員", "會員委員"];
const roleOptions = ["member", "officer", "president"] as const;
const roleLabels: Record<(typeof roleOptions)[number], string> = {
  member: "會員",
  officer: "幹部",
  president: "主席",
};

function Input({ name, label, defaultValue, type = "text", required = false, readOnly = false }: { name: string; label: string; defaultValue?: string | number | null; type?: string; required?: boolean; readOnly?: boolean }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-text-1">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        readOnly={readOnly}
        className="rounded-2xl border border-border bg-white px-3 py-2.5"
      />
    </label>
  );
}

function Textarea({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string | null }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-text-1">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        className="min-h-28 rounded-2xl border border-border bg-white px-3 py-2.5"
      />
    </label>
  );
}

export function MemberForm({ member }: { member: MemberRecord | null }) {
  return (
    <form action={adminUpsertMemberAction} className="space-y-5">
      <input type="hidden" name="id" value={member?.id ?? ""} />
      <input type="hidden" name="is_active" value={member?.is_active === false ? "false" : "true"} />
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-[24px] p-5">
          <h2 className="text-lg font-semibold">基本資料</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input name="member_number" label="會員編號" defaultValue={member?.member_number} required />
            <Input name="email" label="會員 Email" defaultValue={member?.email} required readOnly={Boolean(member)} />
            <Input name="chinese_name" label="中文姓名" defaultValue={member?.chinese_name} required />
            <Input name="english_name" label="英文姓名" defaultValue={member?.english_name} />
            <Input name="line_name" label="LINE 名稱" defaultValue={member?.line_name} />
            <Input name="photo_url" label="照片 URL" defaultValue={member?.photo_url} />
          </div>
        </Card>
        <Card className="rounded-[24px] p-5">
          <h2 className="text-lg font-semibold">組織資訊</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-text-1">角色</span>
              <select name="role" defaultValue={member?.role ?? "member"} className="rounded-2xl border border-border bg-white px-3 py-2.5">
                {roleOptions.map((option) => <option key={option} value={option}>{roleLabels[option]}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-text-1">職位</span>
              <select name="position" defaultValue={member?.position ?? ""} className="rounded-2xl border border-border bg-white px-3 py-2.5">
                {positionOptions.map((option) => <option key={option} value={option}>{option || "未設定"}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="font-medium text-text-1">委員會</span>
              <select name="committee" defaultValue={member?.committee ?? ""} className="rounded-2xl border border-border bg-white px-3 py-2.5">
                {committeeOptions.map((option) => <option key={option} value={option}>{option || "未設定"}</option>)}
              </select>
            </label>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-[24px] p-5">
          <h2 className="text-lg font-semibold">專業與引薦</h2>
          <div className="mt-4 grid gap-4">
            <Input name="specialty_title" label="專業名稱" defaultValue={member?.specialty_title} required />
            <Textarea name="specialty_description" label="專業描述" defaultValue={member?.specialty_description} />
            <Textarea name="general_referral" label="一般引薦" defaultValue={member?.general_referral} />
            <Textarea name="ideal_referral" label="理想引薦" defaultValue={member?.ideal_referral} />
            <Textarea name="dream_referral" label="夢想引薦" defaultValue={member?.dream_referral} />
          </div>
        </Card>
        <Card className="rounded-[24px] p-5">
          <h2 className="text-lg font-semibold">公司與經歷</h2>
          <div className="mt-4 grid gap-4">
            <Input name="company_name" label="公司名稱" defaultValue={member?.company_name} />
            <Input name="company_address" label="公司地址" defaultValue={member?.company_address} />
            <Input name="industry_experience_years" label="產業年資" defaultValue={member?.industry_experience_years} type="number" />
            <Textarea name="previous_career" label="過往經歷" defaultValue={member?.previous_career} />
          </div>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="rounded-full px-5">{member ? "儲存會員資料" : "建立會員"}</Button>
        <Link href="/admin/members" className="inline-flex items-center rounded-full border border-border px-5 py-2 text-sm">返回會員管理</Link>
      </div>
    </form>
  );
}
