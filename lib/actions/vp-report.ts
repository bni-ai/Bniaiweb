/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";

import { validateVpMetrics } from "../admin-workflows";
import { createAdminClient, getChapter, numberField, optionalText, parseWeekDate, requireText } from "./admin-common";

export async function getVpReport(weekDate: string) {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const { data, error } = await supabase
    .from("weekly_vp_reports" as never)
    .select("id, week_date, total_referrals, total_one_on_ones, total_visitors, member_attendance, referral_value_twd, notes")
    .eq("chapter_id", chapter.id as never)
    .eq("week_date", weekDate as never)
    .maybeSingle();
  if (error) throw error;
  return data as any | null;
}

export type VpReportFormState = { error?: string; saved?: boolean };

async function persistVpReport(formData: FormData): Promise<VpReportFormState> {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const weekDate = parseWeekDate(requireText(formData, "week_date"));
  const metrics = {
    total_referrals: numberField(formData, "total_referrals"),
    total_one_on_ones: numberField(formData, "total_one_on_ones"),
    total_visitors: numberField(formData, "total_visitors"),
    member_attendance: numberField(formData, "member_attendance"),
    referral_value_twd: numberField(formData, "referral_value_twd"),
  };
  const errors = validateVpMetrics(metrics);
  if (Object.keys(errors).length > 0) {
    return { error: Object.entries(errors).map(([field, message]) => `${field}: ${message}`).join("、") };
  }

  const { error } = await supabase.from("weekly_vp_reports" as never).upsert(
    {
      chapter_id: chapter.id,
      week_date: weekDate,
      ...metrics,
      notes: optionalText(formData, "notes"),
      updated_at: new Date().toISOString(),
    } as never,
    { onConflict: "chapter_id,week_date" },
  );
  if (error) throw error;
  revalidatePath("/admin/vp-report");
  return { saved: true };
}

export async function saveVpReportAction(formData: FormData) {
  const result = await persistVpReport(formData);
  if (result.error) throw new Error(result.error);
}

export async function saveVpReportFormAction(_state: VpReportFormState, formData: FormData): Promise<VpReportFormState> {
  return persistVpReport(formData);
}
