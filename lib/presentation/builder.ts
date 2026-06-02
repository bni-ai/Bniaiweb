import type { SupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "../actions/admin-common";
import type { Database } from "../supabase/types";
import type { SlideEntry } from "./types";

type BuilderBrief = { id: string; member_number: string | null };
type BuilderGuestVisit = { id: string; visit_number: number; created_at: string | null };
type BuilderAward = { id: string; created_at: string | null };

type BuilderInput = {
  keynote: { id: string } | null;
  briefs: BuilderBrief[];
  guestVisits: BuilderGuestVisit[];
  awards: BuilderAward[];
  vpReport: { id: string } | null;
};

function compareMemberNumber(left: string | null, right: string | null) {
  const leftNumber = Number(left);
  const rightNumber = Number(right);
  const leftIsNumber = Number.isFinite(leftNumber);
  const rightIsNumber = Number.isFinite(rightNumber);

  if (leftIsNumber && rightIsNumber) {
    return leftNumber - rightNumber;
  }

  return String(left || "ZZZ").localeCompare(String(right || "ZZZ"), "zh-Hant");
}

function compareNullableDate(left: string | null, right: string | null) {
  const leftTime = left ? new Date(left).getTime() : Number.MAX_SAFE_INTEGER;
  const rightTime = right ? new Date(right).getTime() : Number.MAX_SAFE_INTEGER;
  return leftTime - rightTime;
}

export function buildSlideOrderFromData(input: BuilderInput): SlideEntry[] {
  const slides: SlideEntry[] = [{ type: "cover" }, { type: "agenda" }];

  if (input.keynote?.id) {
    slides.push({ type: "keynote", id: input.keynote.id, visible: true });
  }

  const memberSlides = [...input.briefs]
    .sort((left, right) => compareMemberNumber(left.member_number, right.member_number))
    .map((brief) => ({ type: "member", id: brief.id, visible: true }) as SlideEntry);
  slides.push(...memberSlides);

  const guestSlides = [...input.guestVisits]
    .sort((left, right) => left.visit_number - right.visit_number || compareNullableDate(left.created_at, right.created_at))
    .map((visit) => ({ type: "guest", id: visit.id, visible: true }) as SlideEntry);
  slides.push(...guestSlides);

  const awardSlides = [...input.awards]
    .sort((left, right) => compareNullableDate(left.created_at, right.created_at))
    .map((award) => ({ type: "award", id: award.id, visible: true }) as SlideEntry);
  slides.push(...awardSlides);

  if (input.vpReport?.id) {
    slides.push({ type: "vp_report", id: input.vpReport.id, visible: true });
  }

  slides.push({ type: "team" }, { type: "closing" });
  return slides;
}

export async function buildSlideOrder(
  weekDate: string,
  chapterId: string,
  supabase: SupabaseClient<Database> = createAdminClient(),
): Promise<SlideEntry[]> {
  const { data: chapterMembers, error: chapterMembersError } = await supabase
    .from("members")
    .select("id, member_number")
    .eq("chapter_id", chapterId)
    .eq("is_active", true);
  if (chapterMembersError) throw chapterMembersError;

  const memberRows = (chapterMembers || []) as Array<{ id: string; member_number: string | null }>;
  const memberIds = memberRows.map((member) => member.id);
  const memberNumberMap = new Map(memberRows.map((member) => [member.id, member.member_number]));

  const { data: chapterGuests, error: chapterGuestsError } = await supabase
    .from("guests" as never)
    .select("id")
    .eq("chapter_id", chapterId as never);
  if (chapterGuestsError) throw chapterGuestsError;
  const guestIds = ((chapterGuests || []) as Array<{ id: string }>).map((guest) => guest.id);

  const [briefsResult, keynoteResult, guestVisitsResult, awardsResult, vpReportResult] = await Promise.all([
    memberIds.length
      ? supabase.from("weekly_briefs").select("id, member_id").eq("week_date", weekDate).eq("status", "submitted").in("member_id", memberIds)
      : Promise.resolve({ data: [], error: null }),
    memberIds.length
      ? supabase.from("keynote_talks" as never).select("id, speaker_id").eq("week_date", weekDate as never).in("speaker_id", memberIds).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    guestIds.length
      ? supabase.from("guest_visits" as never).select("id, guest_id, visit_number, created_at").eq("week_date", weekDate as never).in("guest_id", guestIds)
      : Promise.resolve({ data: [], error: null }),
    supabase.from("weekly_awards" as never).select("id, created_at").eq("chapter_id", chapterId as never).eq("week_date", weekDate as never),
    supabase.from("weekly_vp_reports" as never).select("id").eq("chapter_id", chapterId as never).eq("week_date", weekDate as never).maybeSingle(),
  ]);

  for (const result of [briefsResult, keynoteResult, guestVisitsResult, awardsResult, vpReportResult]) {
    if (result.error) throw result.error;
  }

  const briefs = ((briefsResult.data || []) as Array<{ id: string; member_id: string }>).map((brief) => ({
    id: brief.id,
    member_number: memberNumberMap.get(brief.member_id) || null,
  }));

  return buildSlideOrderFromData({
    keynote: (keynoteResult.data as { id: string } | null) || null,
    briefs,
    guestVisits: (guestVisitsResult.data || []) as BuilderGuestVisit[],
    awards: (awardsResult.data || []) as BuilderAward[],
    vpReport: (vpReportResult.data as { id: string } | null) || null,
  });
}
