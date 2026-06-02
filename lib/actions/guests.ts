/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getNextVisitNumber } from "../admin-workflows";
import { createAdminClient, getChapter, optionalText, parseWeekDate, requireText } from "./admin-common";

export async function getGuestVisits(weekDate: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("guest_visits" as never)
    .select("id, week_date, visit_number, status, self_intro, feedback, guests(id, name, company, specialty, email, referrer_id, members(chinese_name))")
    .eq("week_date", weekDate)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []) as any[];
}

export async function persistGuestVisit(formData: FormData) {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const weekDate = parseWeekDate(requireText(formData, "week_date"));
  const name = requireText(formData, "name");
  const email = optionalText(formData, "email");
  const specialty = optionalText(formData, "specialty");
  const company = optionalText(formData, "company");
  const selfIntro = optionalText(formData, "self_intro");
  const feedback = optionalText(formData, "feedback");
  const referrerId = optionalText(formData, "referrer_id");

  const identityQuery = email
    ? supabase.from("guests" as never).select("id").eq("chapter_id", chapter.id as never).eq("email", email as never).maybeSingle()
    : supabase.from("guests" as never).select("id").eq("chapter_id", chapter.id as never).eq("name", name as never).maybeSingle();
  const { data: existingGuest, error: lookupError } = await identityQuery;
  if (lookupError) throw lookupError;

  let guestId = (existingGuest as { id: string } | null)?.id;
  if (guestId) {
    const { error } = await supabase
      .from("guests" as never)
      .update({ name, email, specialty, company, referrer_id: referrerId } as never)
      .eq("id", guestId as never);
    if (error) throw error;
  } else {
    const { data: inserted, error } = await supabase
      .from("guests" as never)
      .insert({ chapter_id: chapter.id, name, email, specialty, company, referrer_id: referrerId } as never)
      .select("id")
      .single();
    if (error) throw error;
    guestId = (inserted as { id: string }).id;
  }

  const { data: priorVisits, error: visitsError } = await supabase
    .from("guest_visits" as never)
    .select("visit_number")
    .eq("guest_id", guestId as never);
  if (visitsError) throw visitsError;

  const { error: upsertError } = await supabase.from("guest_visits" as never).upsert(
    {
      guest_id: guestId,
      week_date: weekDate,
      visit_number: getNextVisitNumber((priorVisits || []).map((visit: any) => visit.visit_number)),
      status: "confirmed",
      self_intro: selfIntro,
      feedback,
    } as never,
    { onConflict: "guest_id,week_date" },
  );
  if (upsertError) throw upsertError;
  revalidatePath("/admin/guests");
  return { weekDate, guestId };
}

export async function saveGuestVisitAction(formData: FormData) {
  const result = await persistGuestVisit(formData);
  redirect(`/admin/guests?week=${result.weekDate}&saved=${Date.now()}`);
}
