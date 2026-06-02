"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { buildPresentationSlides } from "../admin-workflows";
import { asJson, createAdminClient, getChapter, parseWeekDate, requireText } from "./admin-common";

export async function getPresentations(): Promise<Array<{ id: string; week_date: string; title: string | null; status: string; published_url: string | null; slide_order: unknown; updated_at: string | null }>> {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const { data, error } = await supabase
    .from("presentations" as never)
    .select("id, week_date, title, status, published_url, slide_order, updated_at")
    .eq("chapter_id", chapter.id)
    .order("week_date", { ascending: false });
  if (error) throw error;
  return (data || []) as Array<{ id: string; week_date: string; title: string | null; status: string; published_url: string | null; slide_order: unknown; updated_at: string | null }>;
}

export async function getPresentation(id: string): Promise<{ id: string; week_date: string; title: string | null; status: string; published_url: string | null; slide_order: unknown }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("presentations" as never)
    .select("id, week_date, title, status, published_url, slide_order")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as { id: string; week_date: string; title: string | null; status: string; published_url: string | null; slide_order: unknown };
}

async function collectSlideData(weekDate: string) {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const [briefs, keynote, guests, awards, vpReport] = await Promise.all([
    supabase.from("weekly_briefs").select("id").eq("week_date", weekDate).eq("status", "submitted"),
    supabase.from("keynote_talks" as never).select("id").eq("week_date", weekDate as never).maybeSingle(),
    supabase.from("guest_visits" as never).select("guest_id").eq("week_date", weekDate as never),
    supabase.from("weekly_awards" as never).select("id").eq("chapter_id", chapter.id as never).eq("week_date", weekDate as never),
    supabase.from("weekly_vp_reports" as never).select("id").eq("chapter_id", chapter.id as never).eq("week_date", weekDate as never).maybeSingle(),
  ]);
  for (const result of [briefs, keynote, guests, awards, vpReport]) {
    if (result.error) throw result.error;
  }
  return buildPresentationSlides({
    weekDate,
    briefs: briefs.data || [],
    keynote: keynote.data as { id: string } | null,
    guestVisits: (guests.data || []) as Array<{ guest_id: string }>,
    awards: (awards.data || []) as Array<{ id: string }>,
    vpReport: vpReport.data as { id: string } | null,
  });
}

export async function createPresentationAction(formData: FormData) {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const weekDate = parseWeekDate(requireText(formData, "week_date"));
  const slideOrder = await collectSlideData(weekDate);

  const { data, error } = await supabase
    .from("presentations" as never)
    .upsert(
      {
        chapter_id: chapter.id,
        week_date: weekDate,
        title: `BNI 華 AI 分會 ${weekDate} 例會簡報`,
        status: "draft",
        slide_order: asJson(slideOrder),
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "chapter_id,week_date" },
    )
    .select("id")
    .single();
  if (error) throw error;
  revalidatePath("/admin/presentation");
  redirect(`/admin/presentations/${(data as { id: string }).id}`);
}

export async function saveSlideOrderAction(formData: FormData) {
  const supabase = createAdminClient();
  const id = requireText(formData, "id");
  const slideOrder = JSON.parse(requireText(formData, "slide_order"));
  const { error } = await supabase
    .from("presentations" as never)
    .update({ slide_order: asJson(slideOrder), updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/admin/presentations/${id}`);
}

export async function publishPresentationAction(formData: FormData) {
  const supabase = createAdminClient();
  const id = requireText(formData, "id");
  const weekDate = requireText(formData, "week_date");
  const slideOrder = JSON.parse(requireText(formData, "slide_order"));
  if (!Array.isArray(slideOrder) || slideOrder.length === 0) {
    throw new Error("簡報沒有 slide_order，無法發布。");
  }
  const { error } = await supabase
    .from("presentations" as never)
    .update({ status: "published", published_url: `/presentation/${weekDate}`, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/admin/presentations/${id}`);
}
