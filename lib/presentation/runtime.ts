import type {
  AwardSlideProps,
  GuestSlideProps,
  KeynoteSlideProps,
  MemberSlideProps,
  PresentationRuntimeDeck,
  PresentationRuntimeSlide,
  SlideEntry,
  VPReportSlideProps,
} from "./types";
import type { PresentationDeck } from "./viewer";

const slideLabels: Record<SlideEntry["type"], string> = {
  cover: "首頁",
  agenda: "議程",
  keynote: "演講",
  member: "會員",
  guest: "來賓",
  award: "獎項",
  vp_report: "報告",
  team: "團隊",
  closing: "結束",
};

function compactSummary(parts: Array<string | null | undefined>) {
  return parts
    .map((part) => (part || "").trim())
    .filter(Boolean)
    .join("；");
}

function createNotes(label: string, title: string, summary: string) {
  return `${label}：${title}${summary ? `。${summary}` : ""}`;
}

function runtimeSlide(
  entry: SlideEntry,
  index: number,
  title: string,
  subtitle: string,
  summary: string,
  payload: Record<string, unknown>,
): PresentationRuntimeSlide {
  const label = slideLabels[entry.type];
  return {
    id: `${entry.type}-${"id" in entry ? entry.id : index}`,
    type: entry.type,
    label,
    title,
    subtitle,
    summary,
    notes: createNotes(label, title, summary),
    payload,
  };
}

function memberSlide(entry: Extract<SlideEntry, { type: "member" }>, index: number, slide: MemberSlideProps) {
  return runtimeSlide(
    entry,
    index,
    slide.member.chinese_name,
    slide.member.specialty_title || slide.member.company_name || "本週商務焦點",
    compactSummary([slide.brief.have_this_week, slide.brief.want_this_week]),
    slide as unknown as Record<string, unknown>,
  );
}

function keynoteSlide(entry: Extract<SlideEntry, { type: "keynote" }>, index: number, slide: KeynoteSlideProps) {
  return runtimeSlide(
    entry,
    index,
    slide.keynote.topic,
    slide.speaker.chinese_name,
    compactSummary([slide.keynote.outline, slide.speaker.specialty_title]),
    slide as unknown as Record<string, unknown>,
  );
}

function guestSlide(entry: Extract<SlideEntry, { type: "guest" }>, index: number, slide: GuestSlideProps) {
  return runtimeSlide(
    entry,
    index,
    slide.guest.name,
    slide.guest.specialty || slide.guest.company || "本週來賓",
    compactSummary([slide.visit.self_intro, slide.referrer?.chinese_name ? `邀約人：${slide.referrer.chinese_name}` : null]),
    slide as unknown as Record<string, unknown>,
  );
}

function awardSlide(entry: Extract<SlideEntry, { type: "award" }>, index: number, slide: AwardSlideProps) {
  return runtimeSlide(
    entry,
    index,
    slide.award.award_type,
    slide.recipient?.chinese_name || "待指定得獎者",
    slide.award.description || "",
    slide as unknown as Record<string, unknown>,
  );
}

function vpReportSlide(entry: Extract<SlideEntry, { type: "vp_report" }>, index: number, slide: VPReportSlideProps) {
  return runtimeSlide(
    entry,
    index,
    "本週績效摘要",
    "例會營運指標",
    `引薦 ${slide.report.total_referrals}，一對一 ${slide.report.total_one_on_ones}，訪客 ${slide.report.total_visitors}`,
    slide as unknown as Record<string, unknown>,
  );
}

export function toRuntimeDeck(deck: PresentationDeck): PresentationRuntimeDeck {
  const slides = deck.slideOrder.flatMap((entry, index): PresentationRuntimeSlide[] => {
    switch (entry.type) {
      case "cover":
        return [runtimeSlide(entry, index, deck.chapterName, deck.cover.meetingTime, `週次 ${deck.cover.weekDate}`, deck.cover as unknown as Record<string, unknown>)];
      case "agenda":
        return [
          runtimeSlide(
            entry,
            index,
            "本週例會議程",
            deck.chapterName,
            "開場、會員簡報、來賓介紹、8 分鐘短講、表揚、VP 報告、幹部支援",
            { chapterName: deck.chapterName, weekDate: deck.weekDate },
          ),
        ];
      case "keynote": {
        const slide = deck.keynoteSlides.get(entry.id);
        return slide ? [keynoteSlide(entry, index, slide)] : [];
      }
      case "member": {
        const slide = deck.memberSlides.get(entry.id);
        return slide ? [memberSlide(entry, index, slide)] : [];
      }
      case "guest": {
        const slide = deck.guestSlides.get(entry.id);
        return slide ? [guestSlide(entry, index, slide)] : [];
      }
      case "award": {
        const slide = deck.awardSlides.get(entry.id);
        return slide ? [awardSlide(entry, index, slide)] : [];
      }
      case "vp_report": {
        const slide = deck.vpReportSlides.get(entry.id);
        return slide ? [vpReportSlide(entry, index, slide)] : [];
      }
      case "team":
        return [
          runtimeSlide(
            entry,
            index,
            `${deck.chapterName} 幹部`,
            "例會運作與會員支持窗口",
            `本週幹部 ${deck.teamSlide.members.length} 位`,
            deck.teamSlide as unknown as Record<string, unknown>,
          ),
        ];
      case "closing":
        return [
          runtimeSlide(
            entry,
            index,
            "簡報結束",
            deck.chapterName,
            "感謝參與本週例會，請持續完成引薦與一對一後續行動。",
            { chapterName: deck.chapterName, weekDate: deck.weekDate },
          ),
        ];
    }
  });

  return {
    weekDate: deck.weekDate,
    chapterName: deck.chapterName,
    slides,
  };
}
