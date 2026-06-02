/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient, getChapter, optionalText, parseWeekDate, requireText } from "./admin-common";

export async function getAwards(weekDate: string) {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const { data, error } = await supabase
    .from("weekly_awards" as never)
    .select("id, week_date, recipient_id, award_type, description, members!weekly_awards_recipient_id_fkey(chinese_name)")
    .eq("chapter_id", chapter.id as never)
    .eq("week_date", weekDate as never)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []) as any[];
}

export async function saveAwardAction(formData: FormData) {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const id = optionalText(formData, "id");
  const weekDate = parseWeekDate(requireText(formData, "week_date"));
  const payload = {
    chapter_id: chapter.id,
    week_date: weekDate,
    recipient_id: optionalText(formData, "recipient_id"),
    award_type: requireText(formData, "award_type") || "other",
    description: optionalText(formData, "description"),
  };

  const query = id
    ? supabase.from("weekly_awards" as never).update(payload as never).eq("id", id as never)
    : supabase.from("weekly_awards" as never).insert(payload as never);
  const { error } = await query;
  if (error) throw error;
  revalidatePath("/admin/awards");
}

export async function deleteAwardAction(formData: FormData) {
  const supabase = createAdminClient();
  const id = requireText(formData, "id");
  const { error } = await supabase.from("weekly_awards" as never).delete().eq("id", id as never);
  if (error) throw error;
  revalidatePath("/admin/awards");
}
