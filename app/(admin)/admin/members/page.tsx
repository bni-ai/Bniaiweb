import Link from "next/link";

import { Card } from "../../../../components/ui/card";
import {
  toggleMemberActiveAction,
  getAdminMembers,
  approvePendingMemberAction,
  promoteGuestToMemberAction,
} from "../../../../lib/actions/members";
import { createAdminClient, getChapter } from "../../../../lib/actions/admin-common";

type GuestRecord = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  specialty: string | null;
  referrer_id: string | null;
};

const roleLabels: Record<string, string> = {
  member: "會員",
  officer: "幹部",
  president: "主席",
  pending_member: "待審核會員",
};

export default async function AdminMembersPage({ searchParams }: { searchParams?: Promise<{ q?: string; committee?: string; role?: string; active?: string; page?: string }> }) {
  const params = await searchParams;
  const { members, currentPage, totalPages, pageSize } = await getAdminMembers(params);
  
  const adminClient = createAdminClient();
  const chapter = await getChapter();
  const { data: guestsData } = await adminClient
    .from("guests" as never)
    .select("id, name, email, company, phone, specialty, referrer_id")
    .eq("chapter_id", chapter.id as never);
  const guests = (guestsData || []) as GuestRecord[];

  const pendingMembers = members.filter((m) => m.role === "pending_member");
  const activeMembers = members.filter((m) => m.role !== "pending_member");

  const committeeCount = new Set(activeMembers.map((m) => m.committee).filter(Boolean)).size;
  const officerCount = activeMembers.filter((m) => m.role !== "member").length;
  const baseParams = new URLSearchParams();
  if (params?.q) baseParams.set("q", params.q);
  if (params?.committee) baseParams.set("committee", params.committee);
  if (params?.role) baseParams.set("role", params.role);
  if (params?.active) baseParams.set("active", params.active);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-text-2">會員名冊</p>
          <h1 className="text-3xl font-black">會員管理</h1>
          <p className="mt-2 text-sm text-text-2">這一版開始提供新增、編輯與啟停切換，先把名冊治理做成可用主線。</p>
        </div>
        <Link href="/admin/members/new" className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">新增會員</Link>
      </div>
      <form className="grid gap-3 rounded-[24px] border border-border bg-white p-4 md:grid-cols-4">
        <input name="q" defaultValue={params?.q || ""} placeholder="搜尋姓名/英文名/專業" className="rounded-2xl border border-border px-3 py-2.5" />
        <input name="committee" defaultValue={params?.committee || ""} placeholder="委員會" className="rounded-2xl border border-border px-3 py-2.5" />
        <select name="role" defaultValue={params?.role || ""} className="rounded-2xl border border-border px-3 py-2.5">
          <option value="">全部角色</option>
          <option value="member">會員</option>
          <option value="officer">幹部</option>
          <option value="president">主席</option>
        </select>
        <select name="active" defaultValue={params?.active || ""} className="rounded-2xl border border-border px-3 py-2.5">
          <option value="">全部狀態</option>
          <option value="active">啟用中</option>
          <option value="inactive">停用</option>
        </select>
      </form>
          <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-[24px] p-5"><p className="text-sm text-text-2">會員總數</p><p className="mt-3 text-3xl font-bold">{activeMembers.length}</p></Card>
        <Card className="rounded-[24px] p-5"><p className="text-sm text-text-2">幹部 / 主席群</p><p className="mt-3 text-3xl font-bold text-primary">{officerCount}</p></Card>
        <Card className="rounded-[24px] p-5"><p className="text-sm text-text-2">正式會員</p><p className="mt-3 text-3xl font-bold text-emerald-700">{activeMembers.length - officerCount}</p></Card>
        <Card className="rounded-[24px] p-5"><p className="text-sm text-text-2">委員會角色數</p><p className="mt-3 text-3xl font-bold">{committeeCount}</p></Card>
      </div>

      {(pendingMembers.length > 0 || guests.length > 0) ? (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-text-1">待核准與升權管理</h2>
          <Card className="overflow-hidden rounded-[24px]">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-left">
                <tr>
                  <th className="p-3">姓名</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">註冊類型</th>
                  <th className="p-3">公司</th>
                  <th className="p-3">電話</th>
                  <th className="p-3">專業</th>
                  <th className="p-3 text-right font-medium">核准動作</th>
                </tr>
              </thead>
              <tbody>
                {pendingMembers.map((pm) => (
                  <tr className="border-t border-border" key={pm.id}>
                    <td className="p-3 font-medium">{pm.chinese_name}</td>
                    <td className="p-3">{pm.email}</td>
                    <td className="p-3"><span className="rounded bg-yellow-100 text-yellow-800 px-2 py-0.5 text-xs">會員申請 (待審)</span></td>
                    <td className="p-3">{pm.company_name || "-"}</td>
                    <td className="p-3">{pm.line_name || "-"}</td>
                    <td className="p-3">{pm.specialty_title || "-"}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <form action={approvePendingMemberAction}>
                          <input type="hidden" name="id" value={pm.id} />
                          <input type="hidden" name="role" value="member" />
                          <button type="submit" className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">核准為會員</button>
                        </form>
                        <form action={approvePendingMemberAction}>
                          <input type="hidden" name="id" value={pm.id} />
                          <input type="hidden" name="role" value="officer" />
                          <button type="submit" className="rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">核准為幹部</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
                {guests.map((g) => (
                  <tr className="border-t border-border" key={g.id}>
                    <td className="p-3 font-medium">{g.name}</td>
                    <td className="p-3">{g.email || "-"}</td>
                    <td className="p-3"><span className="rounded bg-blue-100 text-blue-800 px-2 py-0.5 text-xs">來賓帳號</span></td>
                    <td className="p-3">{g.company || "-"}</td>
                    <td className="p-3">{g.phone || "-"}</td>
                    <td className="p-3">{g.specialty || "-"}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <form action={promoteGuestToMemberAction}>
                          <input type="hidden" name="guest_id" value={g.id} />
                          <input type="hidden" name="role" value="member" />
                          <button type="submit" className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">升級為會員</button>
                        </form>
                        <form action={promoteGuestToMemberAction}>
                          <input type="hidden" name="guest_id" value={g.id} />
                          <input type="hidden" name="role" value="officer" />
                          <button type="submit" className="rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">升級為幹部</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      ) : null}

      <Card className="overflow-hidden rounded-[24px]">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left">
            <tr>
              <th className="p-3">頭像</th>
              <th className="p-3">編號</th>
              <th className="p-3">姓名</th>
              <th className="p-3">英文名</th>
              <th className="p-3">會員 Email</th>
              <th className="p-3">角色</th>
              <th className="p-3">委員會</th>
              <th className="p-3">專業</th>
              <th className="p-3">公司</th>
              <th className="p-3">狀態</th>
              <th className="p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {activeMembers.map((m) => (
              <tr className="border-t border-border" key={m.id}>
                <td className="p-3">
                  {m.photo_url ? (
                    <img src={m.photo_url} alt={m.chinese_name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fee2e2] text-sm font-bold text-primary">
                      {m.chinese_name.slice(0, 1)}
                    </div>
                  )}
                </td>
                <td className="p-3">{m.member_number || "-"}</td>
                <td className="p-3 font-medium">{m.chinese_name}</td>
                <td className="p-3">{m.english_name || "-"}</td>
                <td className="p-3">{m.email}</td>
                <td className="p-3">{roleLabels[m.role] || m.role}</td>
                <td className="p-3">{m.committee || m.position || "-"}</td>
                <td className="p-3">{m.specialty_title || "-"}</td>
                <td className="p-3">{m.company_name || "-"}</td>
                <td className="p-3">{m.is_active ? "啟用中" : "停用"}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <a href={`/admin/members/${m.id}`} className="rounded-full border border-border px-3 py-1 text-xs">編輯</a>
                    <form action={toggleMemberActiveAction}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="next_active" value={m.is_active ? "false" : "true"} />
                      <button className="rounded-full border border-border px-3 py-1 text-xs" type="submit">{m.is_active ? "停用" : "啟用"}</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <div className="flex items-center justify-between rounded-[24px] border border-border bg-white px-5 py-4 text-sm">
        <p className="text-text-2">第 {currentPage} / {totalPages} 頁 · 每頁 {pageSize} 筆</p>
        <div className="flex gap-2">
          {currentPage > 1 ? (
            <Link
              href={`/admin/members?${new URLSearchParams({ ...Object.fromEntries(baseParams.entries()), page: String(currentPage - 1) }).toString()}`}
              className="rounded-full border border-border px-4 py-2"
            >
              上一頁
            </Link>
          ) : null}
          {currentPage < totalPages ? (
            <Link
              href={`/admin/members?${new URLSearchParams({ ...Object.fromEntries(baseParams.entries()), page: String(currentPage + 1) }).toString()}`}
              className="rounded-full border border-border px-4 py-2"
            >
              下一頁
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
