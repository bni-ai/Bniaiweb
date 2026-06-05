import type { ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

import { awardTypeLabels } from "../actions/admin-common";
import type { Database, Json } from "../supabase/types";
import { parseSlideOrder } from "./slide-order";
import type {
  AwardSlideProps,
  CoverSlideProps,
  GuestSlideProps,
  KeynoteSlideProps,
  MemberSlideProps,
  PresentationMember,
  SlideEntry,
  TeamSlideProps,
  VPReportSlideProps,
} from "./types";
import { AgendaSlide, AwardSlide, ClosingSlide, CoverSlide, GuestSlide, KeynoteSlide, MemberSlide, TeamSlide, VPReportSlide } from "../../components/slides";

const PRESENTATION_FRAME_CLASS =
  "mx-auto flex aspect-video w-full max-h-screen max-w-[177.78vh] items-stretch overflow-hidden rounded-[28px] border border-white/10 bg-[#fffdf9] text-slate-900 shadow-[0_30px_120px_rgba(0,0,0,0.35)]";

const VIEWPORT_CLASS = "flex min-h-screen items-center justify-center bg-[#120808] p-4 sm:p-6";

export type PresentationDeck = {
  chapterName: string;
  weekDate: string;
  slideOrder: SlideEntry[];
  cover: CoverSlideProps;
  memberSlides: Map<string, MemberSlideProps>;
  keynoteSlides: Map<string, KeynoteSlideProps>;
  guestSlides: Map<string, GuestSlideProps>;
  awardSlides: Map<string, AwardSlideProps>;
  vpReportSlides: Map<string, VPReportSlideProps>;
  teamSlide: TeamSlideProps;
};

function toImageList(value: Json | null): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

function weekDateLabel(weekDate: string) {
  return weekDate.replace(/-/g, " /");
}

export async function getPublishedPresentationDeck(
  weekDate: string,
  supabase: SupabaseClient<Database>,
): Promise<PresentationDeck | null> {
  const { data: presentationData, error: presentationError } = await supabase
    .from("presentations" as never)
    .select("id, chapter_id, week_date, slide_order, status")
    .eq("week_date", weekDate as never)
    .eq("status", "published" as never)
    .maybeSingle();

  if (presentationError) throw presentationError;
  if (!presentationData) return null;

  const presentation = presentationData as {
    chapter_id: string;
    week_date: string;
    slide_order: Json;
    status: "draft" | "published";
  };

  if (presentation.status !== "published") return null;

  return buildPresentationDeck(presentation, supabase);
}

export async function getPresentationDeckById(
  id: string,
  supabase: SupabaseClient<Database>,
  options?: { includeHidden?: boolean },
): Promise<PresentationDeck | null> {
  const { data, error } = await supabase
    .from("presentations" as never)
    .select("id, chapter_id, week_date, slide_order, status")
    .eq("id", id as never)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const presentation = data as {
    chapter_id: string;
    week_date: string;
    slide_order: Json;
    status: "draft" | "published";
  };

  return buildPresentationDeck(presentation, supabase, options);
}

export async function buildPresentationDeck(
  presentation: {
    chapter_id: string;
    week_date: string;
    slide_order: Json;
  },
  supabase: SupabaseClient<Database>,
  options?: { includeHidden?: boolean },
): Promise<PresentationDeck | null> {
  const slideOrder = parseSlideOrder(presentation.slide_order);
  const selectedEntries = options?.includeHidden
    ? slideOrder
    : slideOrder.filter((entry) => entry.type === "cover" || entry.type === "agenda" || entry.type === "team" || entry.type === "closing" || entry.visible);

  const memberSlideIds = selectedEntries.filter((entry): entry is Extract<SlideEntry, { type: "member" }> => entry.type === "member").map((entry) => entry.id);
  const keynoteSlideIds = selectedEntries.filter((entry): entry is Extract<SlideEntry, { type: "keynote" }> => entry.type === "keynote").map((entry) => entry.id);
  const guestSlideIds = selectedEntries.filter((entry): entry is Extract<SlideEntry, { type: "guest" }> => entry.type === "guest").map((entry) => entry.id);
  const awardSlideIds = selectedEntries.filter((entry): entry is Extract<SlideEntry, { type: "award" }> => entry.type === "award").map((entry) => entry.id);
  const vpReportSlideIds = selectedEntries.filter((entry): entry is Extract<SlideEntry, { type: "vp_report" }> => entry.type === "vp_report").map((entry) => entry.id);

  const [chapterResult, briefsResult, keynotesResult, guestVisitsResult, awardsResult, vpReportsResult, teamMembersResult] = await Promise.all([
    supabase.from("chapters" as never).select("name").eq("id", presentation.chapter_id as never).single(),
    memberSlideIds.length
      ? supabase.from("weekly_briefs").select("id, member_id, have_this_week, want_this_week").in("id", memberSlideIds)
      : Promise.resolve({ data: [], error: null }),
    keynoteSlideIds.length
      ? supabase.from("keynote_talks" as never).select("id, speaker_id, topic, outline, product_images").in("id", keynoteSlideIds)
      : Promise.resolve({ data: [], error: null }),
    guestSlideIds.length
      ? supabase.from("guest_visits" as never).select("id, guest_id, visit_number, status, self_intro").in("id", guestSlideIds)
      : Promise.resolve({ data: [], error: null }),
    awardSlideIds.length
      ? supabase.from("weekly_awards" as never).select("id, recipient_id, award_type, description").in("id", awardSlideIds)
      : Promise.resolve({ data: [], error: null }),
    vpReportSlideIds.length
      ? supabase
          .from("weekly_vp_reports" as never)
          .select("id, total_referrals, total_one_on_ones, total_visitors, member_attendance, referral_value_twd, notes")
          .in("id", vpReportSlideIds)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("members")
      .select("id, chinese_name, english_name, specialty_title, specialty_description, company_name, photo_url, position, committee, member_number")
      .eq("chapter_id", presentation.chapter_id)
      .eq("is_active", true)
      .not("position", "is", null)
      .order("member_number", { ascending: true, nullsFirst: false }),
  ]);

  for (const result of [chapterResult, briefsResult, keynotesResult, guestVisitsResult, awardsResult, vpReportsResult, teamMembersResult]) {
    if (result.error) throw result.error;
  }
  const chapterName = (chapterResult.data as { name: string } | null)?.name;
  if (!chapterName) return null;

  const guestRows = (guestVisitsResult.data || []) as Array<{ id: string; guest_id: string; visit_number: number; status: string; self_intro: string | null }>;
  const guestIds = [...new Set(guestRows.map((row) => row.guest_id))];
  const { data: guestsData, error: guestsError } = guestIds.length
    ? await supabase.from("guests" as never).select("id, name, company, specialty, referrer_id").in("id", guestIds as never)
    : { data: [], error: null };
  if (guestsError) throw guestsError;

  const awardRows = (awardsResult.data || []) as Array<{ id: string; recipient_id: string | null; award_type: string; description: string | null }>;
  const keynoteRows = (keynotesResult.data || []) as Array<{ id: string; speaker_id: string; topic: string; outline: string | null; product_images: Json | null }>;
  const briefRows = (briefsResult.data || []) as Array<{ id: string; member_id: string; have_this_week: string | null; want_this_week: string | null }>;
  const teamMembers = (teamMembersResult.data || []) as PresentationMember[];
  const guests = (guestsData || []) as Array<{ id: string; name: string; company: string | null; specialty: string | null; referrer_id: string | null }>;
  const extraMemberIds = [...new Set([
    ...briefRows.map((row) => row.member_id),
    ...keynoteRows.map((row) => row.speaker_id),
    ...awardRows.map((row) => row.recipient_id).filter((value): value is string => Boolean(value)),
    ...guests.map((guest) => guest.referrer_id).filter((value): value is string => Boolean(value)),
  ])].filter((id) => !teamMembers.some((member) => member.id === id));

  const { data: extraMembersData, error: extraMembersError } = extraMemberIds.length
    ? await supabase
        .from("members")
        .select("id, chinese_name, english_name, specialty_title, specialty_description, company_name, photo_url, position, committee, member_number")
        .in("id", extraMemberIds)
    : { data: [], error: null };
  if (extraMembersError) throw extraMembersError;

  const memberMap = new Map<string, PresentationMember>(
    [...teamMembers, ...((extraMembersData || []) as PresentationMember[])].map((member) => [member.id, member]),
  );
  const guestMap = new Map(guests.map((guest) => [guest.id, guest]));

  const memberSlides = new Map<string, MemberSlideProps>();
  for (const brief of briefRows) {
    const member = memberMap.get(brief.member_id);
    if (!member) continue;
    memberSlides.set(brief.id, {
      member,
      brief: {
        id: brief.id,
        have_this_week: brief.have_this_week,
        want_this_week: brief.want_this_week,
      },
    });
  }

  const keynoteSlides = new Map<string, KeynoteSlideProps>();
  for (const keynote of keynoteRows) {
    const speaker = memberMap.get(keynote.speaker_id);
    if (!speaker) continue;
    keynoteSlides.set(keynote.id, {
      speaker,
      keynote: {
        id: keynote.id,
        topic: keynote.topic,
        outline: keynote.outline,
        product_images: toImageList(keynote.product_images),
      },
    });
  }

  const guestSlides = new Map<string, GuestSlideProps>();
  for (const visit of guestRows) {
    const guest = guestMap.get(visit.guest_id);
    if (!guest) continue;
    guestSlides.set(visit.id, {
      guest: {
        id: guest.id,
        name: guest.name,
        company: guest.company,
        specialty: guest.specialty,
      },
      visit: {
        id: visit.id,
        visit_number: visit.visit_number,
        status: visit.status,
        self_intro: visit.self_intro,
      },
      referrer: guest.referrer_id ? memberMap.get(guest.referrer_id) || null : null,
    });
  }

  const awardSlides = new Map<string, AwardSlideProps>();
  for (const award of awardRows) {
    awardSlides.set(award.id, {
      award: {
        id: award.id,
        award_type: awardTypeLabels[award.award_type] || award.award_type,
        description: award.description,
      },
      recipient: award.recipient_id ? memberMap.get(award.recipient_id) || null : null,
    });
  }

  const vpReportSlides = new Map<string, VPReportSlideProps>(
    ((vpReportsResult.data || []) as Array<VPReportSlideProps["report"]>).map((report) => [report.id, { report }]),
  );

  return {
    chapterName,
    weekDate: presentation.week_date,
    slideOrder: selectedEntries,
    cover: {
      chapterName,
      weekDate: weekDateLabel(presentation.week_date),
      meetingTime: "每週四 07:30 - 09:30",
    },
    memberSlides,
    keynoteSlides,
    guestSlides,
    awardSlides,
    vpReportSlides,
    teamSlide: {
      chapterName,
      members: teamMembers,
    },
  };
}

export function renderPresentationSlides(deck: PresentationDeck): ReactNode[] {
  const wrapSlide = (key: string, child: ReactNode) => (
    <main key={key} className={VIEWPORT_CLASS}>
      <div className={PRESENTATION_FRAME_CLASS}>{child}</div>
    </main>
  );

  return deck.slideOrder.flatMap((entry, index) => {
    const key = `${entry.type}-${index}`;
    switch (entry.type) {
      case "cover":
        return [wrapSlide(key, <CoverSlide {...deck.cover} />)];
      case "agenda":
        return [wrapSlide(key, <AgendaSlide chapterName={deck.chapterName} weekDate={deck.weekDate} />)];
      case "team":
        return [wrapSlide(key, <TeamSlide {...deck.teamSlide} />)];
      case "closing":
        return [wrapSlide(key, <ClosingSlide chapterName={deck.chapterName} weekDate={deck.weekDate} />)];
      case "member": {
        const slide = deck.memberSlides.get(entry.id);
        return slide ? [wrapSlide(key, <MemberSlide {...slide} />)] : [];
      }
      case "keynote": {
        const slide = deck.keynoteSlides.get(entry.id);
        return slide ? [wrapSlide(key, <KeynoteSlide {...slide} />)] : [];
      }
      case "guest": {
        const slide = deck.guestSlides.get(entry.id);
        return slide ? [wrapSlide(key, <GuestSlide {...slide} />)] : [];
      }
      case "award": {
        const slide = deck.awardSlides.get(entry.id);
        return slide ? [wrapSlide(key, <AwardSlide {...slide} />)] : [];
      }
      case "vp_report": {
        const slide = deck.vpReportSlides.get(entry.id);
        return slide ? [wrapSlide(key, <VPReportSlide {...slide} />)] : [];
      }
    }
  });
}

export function PresentationViewport({ children }: { children: ReactNode }) {
  return (
    <main className={VIEWPORT_CLASS}>
      <div className={PRESENTATION_FRAME_CLASS}>{children}</div>
    </main>
  );
}
