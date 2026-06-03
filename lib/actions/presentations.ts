"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { buildSlideOrder } from "../presentation/builder";
import { resolveRuntimeSlide } from "../presentation/runtime";
import { parseSlideOrder } from "../presentation/slide-order";
import type { SlideEntry, SlideTextLayer } from "../presentation/types";
import { buildPresentationDeck, getPresentationDeckById } from "../presentation/viewer";
import { buildWorkbenchSlideOrder } from "../presentation/workbench";
import { assertImageFile, buildPresentationBackgroundPath, ensureMediaBucket, uploadImageFile } from "../media-storage";
import { asJson, createAdminClient, getChapter, parseWeekDate, requireText } from "./admin-common";

const FIXED_SLIDE_TYPES = new Set<SlideEntry["type"]>(["cover", "agenda", "team", "closing"]);

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

export async function getPresentationEditorData(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("presentations" as never)
    .select("id, chapter_id, week_date, title, status, published_url, slide_order")
    .eq("id", id as never)
    .single();
  if (error) throw error;

  const presentation = data as {
    id: string;
    chapter_id: string;
    week_date: string;
    title: string | null;
    status: string;
    published_url: string | null;
    slide_order: unknown;
  };
  const deck = await buildPresentationDeck(
    {
      chapter_id: presentation.chapter_id,
      week_date: presentation.week_date,
      slide_order: presentation.slide_order as never,
    },
    supabase,
    { includeHidden: true },
  );
  if (!deck) throw new Error("找不到可編輯的簡報資料");

  const slideOrder = parseSlideOrder(presentation.slide_order as never);
  const slides = slideOrder.map((entry, index) => {
    const runtime = resolveRuntimeSlide(entry, deck, index);
    return {
      entry,
      runtime,
    };
  });

  return { presentation, slides };
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
  const backgroundUploads = new Map<number, string | null>();

  if (formData.has("slide_count")) {
    const count = Number(requireText(formData, "slide_count"));
    const pendingFiles = Array.from({ length: count }, (_, index) => {
      const file = formData.get(`slide_background_file_${index}`);
      return { index, file };
    }).filter((item): item is { index: number; file: File } => item.file instanceof File && item.file.size > 0);

    if (pendingFiles.length > 0) {
      await ensureMediaBucket(supabase);
      for (const { index, file } of pendingFiles) {
        assertImageFile(file, "底圖");
        const slidePayload = JSON.parse(requireText(formData, `slide_payload_${index}`)) as { type: string; id?: string };
        const slideKey = `${index + 1}-${slidePayload.type}-${slidePayload.id || "fixed"}`;
        const url = await uploadImageFile(supabase, file, buildPresentationBackgroundPath(id, slideKey, file));
        backgroundUploads.set(index, url);
      }
    }
  }

  const slideOrder = formData.has("slide_count")
    ? buildWorkbenchSlideOrder(formData, { backgroundImageUrlsByIndex: backgroundUploads })
    : JSON.parse(requireText(formData, "slide_order"));
  parseSlideOrder(slideOrder);
  const { error } = await supabase
    .from("presentations" as never)
    .update({ slide_order: asJson(slideOrder), updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/admin/presentations/${id}`);
  redirect(`/admin/presentations/${id}?saved=1`);
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
  const returnTo = typeof formData.get("return_to") === "string" ? String(formData.get("return_to")) : null;
  const presentation = await getPresentation(id);
  const parsed = parseSlideOrder(presentation.slide_order as never);
  const visibleSlides = parsed.filter((entry) => !("visible" in entry) || entry.visible);
  if (visibleSlides.length === 0) {
    throw new Error("至少需要一張可見的投影片才能發布。");
  }
  const { error } = await supabase
    .from("presentations" as never)
    .update({ status: "published", published_url: `/presentation/${presentation.week_date}`, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/presentation");
  revalidatePath(`/admin/presentations/${id}`);
  revalidatePath(`/presentation/${presentation.week_date}`);
  if (returnTo) {
    redirect(returnTo);
  }
}

export async function unpublishPresentationAction(formData: FormData) {
  const supabase = createAdminClient();
  const id = requireText(formData, "id");
  const returnTo = typeof formData.get("return_to") === "string" ? String(formData.get("return_to")) : null;
  const { error } = await supabase
    .from("presentations" as never)
    .update({ status: "draft", published_url: null, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/presentation");
  revalidatePath(`/admin/presentations/${id}`);
  if (returnTo) {
    redirect(returnTo);
  }
}

export async function getPresentationPreviewData(id: string) {
  const supabase = createAdminClient();
  const deck = await getPresentationDeckById(id, supabase);
  if (!deck) throw new Error("找不到簡報預覽資料");
  return deck;
}

export async function duplicateSlideAction(formData: FormData) {
  const supabase = createAdminClient();
  const id = requireText(formData, "id");
  const index = Number(requireText(formData, "slide_index"));

  const presentation = await getPresentation(id);
  const slideOrder = parseSlideOrder(presentation.slide_order as never);

  if (index < 0 || index >= slideOrder.length) {
    throw new Error("無效的 slide 索引。");
  }

  const source = slideOrder[index];
  let duplicate: SlideEntry;

  if (FIXED_SLIDE_TYPES.has(source.type) || source.type === "custom") {
    duplicate = { type: "custom", id: crypto.randomUUID(), visible: true, editor: source.editor };
  } else {
    duplicate = { ...source } as SlideEntry;
  }

  const newSlideOrder = [...slideOrder, duplicate];
  const { error } = await supabase
    .from("presentations" as never)
    .update({ slide_order: asJson(newSlideOrder), updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/admin/presentations/${id}`);
  redirect(`/admin/presentations/${id}`);
}

export async function addBlankSlideAction(formData: FormData) {
  const supabase = createAdminClient();
  const id = requireText(formData, "id");

  const presentation = await getPresentation(id);
  const slideOrder = parseSlideOrder(presentation.slide_order as never);

  const defaultLayer: SlideTextLayer = {
    id: "title",
    text: "",
    x: 128,
    y: 136,
    width: 1280,
    height: 160,
    fontSize: 92,
    color: "#0f172a",
    fontWeight: "800",
    align: "left",
  };

  const newSlide: SlideEntry = {
    type: "custom",
    id: crypto.randomUUID(),
    visible: true,
    editor: { textLayers: [defaultLayer] },
  };

  const newSlideOrder = [...slideOrder, newSlide];
  const { error } = await supabase
    .from("presentations" as never)
    .update({ slide_order: asJson(newSlideOrder), updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/admin/presentations/${id}`);
  redirect(`/admin/presentations/${id}`);
}

export async function deleteSlideAction(formData: FormData) {
  const supabase = createAdminClient();
  const id = requireText(formData, "id");
  const index = Number(requireText(formData, "slide_index"));

  const presentation = await getPresentation(id);
  const slideOrder = parseSlideOrder(presentation.slide_order as never);

  if (index < 0 || index >= slideOrder.length) {
    throw new Error("無效的 slide 索引。");
  }

  const target = slideOrder[index];
  if (FIXED_SLIDE_TYPES.has(target.type)) {
    throw new Error("固定頁面（封面、議程、幹部、結束）無法刪除。");
  }
  if (slideOrder.length <= 1) {
    throw new Error("簡報至少需要保留一張投影片。");
  }

  const newSlideOrder = slideOrder.filter((_, i) => i !== index);
  const { error } = await supabase
    .from("presentations" as never)
    .update({ slide_order: asJson(newSlideOrder), updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/admin/presentations/${id}`);
  redirect(`/admin/presentations/${id}`);
}

export async function deletePresentationAction(formData: FormData) {
  const supabase = createAdminClient();
  const id = requireText(formData, "id");

  // 清理 storage 資產（非必要，失敗不阻斷）
  try {
    const { data: files } = await supabase.storage.from("media").list(`presentations/${id}`);
    if (files && files.length > 0) {
      await supabase.storage.from("media").remove(files.map((f) => `presentations/${id}/${f.name}`));
    }
  } catch {
    // storage 清理失敗不影響記錄刪除
  }

  const { error } = await supabase
    .from("presentations" as never)
    .delete()
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/presentations");
  redirect("/admin/presentations");
}
