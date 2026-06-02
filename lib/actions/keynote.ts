/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient, optionalText, parseWeekDate, requireText } from "./admin-common";
import { assertImageFile, buildKeynoteProductPath, ensureMediaBucket, uploadImageFile } from "../media-storage";

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
  const manualProductImages = requireText(formData, "product_images")
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => ({ url }));
  const status = requireText(formData, "status") === "submitted" ? "submitted" : "draft";

  const { data: talkData, error } = await supabase.from("keynote_talks" as never).upsert(
    {
      speaker_id: speakerId,
      week_date: weekDate,
      topic,
      outline,
      product_images: manualProductImages,
      status,
    } as never,
    { onConflict: "speaker_id,week_date" }
  ).select("id").single();
  if (error) throw error;

  const files = formData
    .getAll("product_image_files")
    .filter((value): value is File => value instanceof File && value.size > 0);
  if (files.length > 5) {
    throw new Error("短講素材最多 5 張");
  }
  if (files.length > 0) {
    await ensureMediaBucket(supabase);
    const talk = talkData as { id: string };
    const uploadedImages: Array<{ url: string }> = [];
    for (const file of files) {
      assertImageFile(file, "短講素材");
      const publicUrl = await uploadImageFile(supabase, file, buildKeynoteProductPath(talk.id, file));
      uploadedImages.push({ url: publicUrl });
    }

    const { error: updateError } = await supabase
      .from("keynote_talks" as never)
      .update({
        product_images: [...manualProductImages, ...uploadedImages],
      } as never)
      .eq("id", talk.id as never);
    if (updateError) throw updateError;
  }

  revalidatePath("/admin/keynote");
  redirect(`/admin/keynote?week=${weekDate}&saved=1`);
}

export async function getKeynoteTalkMaterials(weekDate: string) {
  const keynote = await getKeynote(weekDate);
  const images = Array.isArray(keynote?.product_images) ? keynote.product_images : [];
  return images.map((item: { url?: string }, index: number) => ({
    id: `${index}-${item.url || "image"}`,
    url: item.url || "",
  }));
}
