"use client";

import { type FormEvent, useState } from "react";

import { Button } from "../../../../components/ui/button";

export function GuestVisitForm({ weekDate, members }: { weekDate: string; members: Array<{ id: string; chinese_name: string }> }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const response = await fetch("/admin/guests/create", {
      method: "POST",
      body: new FormData(event.currentTarget),
    });
    if (!response.ok) {
      setError("來賓儲存失敗，請稍後再試。");
      setPending(false);
      return;
    }
    window.location.assign(`/admin/guests?week=${weekDate}&saved=${Date.now()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
      <input type="hidden" name="week_date" value={weekDate} />
      <input name="name" required className="rounded border border-border p-2" placeholder="來賓姓名" />
      <input name="email" className="rounded border border-border p-2" placeholder="來賓 Email（可登入用）" />
      <input name="company" className="rounded border border-border p-2" placeholder="公司" />
      <input name="specialty" className="rounded border border-border p-2" placeholder="專業" />
      <select name="referrer_id" className="rounded border border-border p-2">
        <option value="">邀約會員</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.chinese_name}
          </option>
        ))}
      </select>
      <textarea name="self_intro" className="rounded border border-border p-2 md:col-span-2" placeholder="15 秒介紹 / 自我介紹" />
      {error ? <p className="text-sm text-primary md:col-span-2">{error}</p> : null}
      <Button type="submit" className="md:col-span-2" disabled={pending}>
        {pending ? "儲存中..." : "儲存來賓"}
      </Button>
    </form>
  );
}
