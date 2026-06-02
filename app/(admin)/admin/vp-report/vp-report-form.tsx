"use client";

import { type FormEvent, useState } from "react";

import { Button } from "../../../../components/ui/button";
import { saveVpReportAction } from "../../../../lib/actions/vp-report";

const fields = [
  ["total_referrals", "引薦數"],
  ["total_one_on_ones", "一對一"],
  ["total_visitors", "來賓"],
  ["member_attendance", "出席會員"],
  ["referral_value_twd", "引薦金額 TWD"],
] as const;

export function VpReportForm({ weekDate, report }: { weekDate: string; report: Record<string, string | number | null> | null }) {
  const [error, setError] = useState<string | null>(null);

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    for (const [name] of fields) {
      const value = Number(formData.get(name) || 0);
      if (Number.isFinite(value) && value < 0) {
        event.preventDefault();
        setError(`${name}: 不可小於 0`);
        return;
      }
    }
    setError(null);
  }

  return (
    <form action={saveVpReportAction} onSubmit={validateBeforeSubmit} noValidate className="grid gap-3 md:grid-cols-2">
      <input type="hidden" name="week_date" value={weekDate} />
      {fields.map(([name, label]) => (
        <label key={name} className="grid gap-1 text-sm">
          <span>{label}</span>
          <input
            type="number"
            name={name}
            className="rounded border border-border p-2"
            defaultValue={(report?.[name] as number | undefined) ?? 0}
          />
        </label>
      ))}
      <label className="grid gap-1 text-sm md:col-span-2">
        <span>備註</span>
        <textarea name="notes" className="rounded border border-border p-2" defaultValue={(report?.notes as string | null) || ""} />
      </label>
      {error ? <p className="rounded border border-primary/30 bg-primary/5 p-2 text-sm text-primary md:col-span-2">{error}</p> : null}
      <Button type="submit" className="md:col-span-2">
        儲存 VP 報告
      </Button>
    </form>
  );
}
