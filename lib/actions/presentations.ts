"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { buildSlideOrder } from "../presentation/builder";
import { parseSlideOrder } from "../presentation/slide-order";
import { buildWorkbenchSlideOrder } from "../presentation/workbench";
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

export async function createPresentationAction(formData: FormData) {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const weekDate = parseWeekDate(requireText(formData, "week_date"));
  const slideOrder = await buildSlideOrder(weekDate, chapter.id, supabase);

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
  const slideOrder = formData.has("slide_count")
    ? buildWorkbenchSlideOrder(formData)
    : JSON.parse(requireText(formData, "slide_order"));
  parseSlideOrder(slideOrder);
  const { error } = await supabase
    .from("presentations" as never)
    .update({ slide_order: asJson(slideOrder), updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/admin/presentations/${id}`);
}

export async function regeneratePresentationAction(formData: FormData) {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const id = requireText(formData, "id");
  const weekDate = parseWeekDate(requireText(formData, "week_date"));
  const slideOrder = await buildSlideOrder(weekDate, chapter.id, supabase);
  const { error } = await supabase
    .from("presentations" as never)
    .update({ slide_order: asJson(slideOrder), updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/presentation");
  revalidatePath(`/admin/presentations/${id}`);
  redirect(`/admin/presentations/${id}?regenerated=1`);
}

export async function publishPresentationAction(formData: FormData) {
  const supabase = createAdminClient();
  const id = requireText(formData, "id");
  const weekDate = requireText(formData, "week_date");
  const slideOrder = JSON.parse(requireText(formData, "slide_order"));
  const parsed = parseSlideOrder(slideOrder);
  if (parsed.length === 0) {
    throw new Error("簡報沒有 slide_order，無法發布。");
  }
  const { error } = await supabase
    .from("presentations" as never)
    .update({ status: "published", published_url: `/presentation/${weekDate}`, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/admin/presentations/${id}`);
}
