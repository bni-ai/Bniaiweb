/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient, optionalText, parseWeekDate, requireText } from "./admin-common";

export async function getKeynote(weekDate: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("keynote_talks" as never)
    .select("id, speaker_id, week_date, topic, outline, product_images, status")
    .eq("week_date", weekDate as never)
    .maybeSingle();
  if (error) throw error;
  return data as any | null;
}

export async function saveKeynoteAction(formData: FormData) {
  const supabase = createAdminClient();
  const weekDate = parseWeekDate(requireText(formData, "week_date"));
  const speakerId = requireText(formData, "speaker_id");
  const topic = requireText(formData, "topic");
  const outline = optionalText(formData, "outline");
  const productImages = requireText(formData, "product_images")
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => ({ url }));
  const status = requireText(formData, "status") === "submitted" ? "submitted" : "draft";

  const { error } = await supabase.from("keynote_talks" as never).upsert(
    {
      speaker_id: speakerId,
      week_date: weekDate,
      topic,
      outline,
      product_images: productImages,
      status,
    } as never,
    { onConflict: "speaker_id,week_date" },
  );
  if (error) throw error;
  revalidatePath("/admin/keynote");
}
