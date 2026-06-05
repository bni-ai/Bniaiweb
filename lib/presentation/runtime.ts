import type {
  AwardSlideProps,
  GuestSlideProps,
  KeynoteSlideProps,
  MemberSlideProps,
  PresentationRuntimeDeck,
  PresentationRuntimeSlide,
  SlideEditorPatch,
  SlideFontSize,
  SlideEntry,
  SlideTextLayer,
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
  custom: "自訂",
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

function buildEditorBody(subtitle: string, summary: string) {
  return [subtitle, summary].map((part) => part.trim()).filter(Boolean).join("\n\n");
}

function defaultTextLayers(title: string, body: string, backgroundImageUrl: string | null): SlideTextLayer[] {
  const bodyColor = backgroundImageUrl ? "#ffffff" : "#475569";
  const titleColor = backgroundImageUrl ? "#ffffff" : "#0f172a";
  const layers: SlideTextLayer[] = [
    {
      id: "title",
      text: title,
      x: 128,
      y: 136,
      width: 1280,
      height: 160,
      fontSize: 92,
      color: titleColor,
      fontWeight: "800",
      align: "left",
    },
  ];

  if (body.trim()) {
    layers.push({
      id: "body",
      text: body,
      x: 132,
      y: 336,
      width: 980,
      height: 420,
      fontSize: 38,
      color: bodyColor,
      fontWeight: "500",
      align: "left",
    });
  }

  return layers;
}

function resolveEditorState(
  editor: SlideEditorPatch | undefined,
  title: string,
  subtitle: string,
  summary: string,
): PresentationRuntimeSlide["editor"] {
  const backgroundImageUrl = editor?.backgroundImageUrl !== undefined && editor?.backgroundImageUrl !== null
    ? editor.backgroundImageUrl
    : null;

  const resolvedTitle = editor?.title !== undefined && editor?.title !== null
    ? editor.title
    : title;

  const resolvedBody = editor?.body !== undefined && editor?.body !== null
    ? editor.body
    : buildEditorBody(subtitle, summary);

  const resolvedFontSize = (editor?.fontSize as SlideFontSize | null) ?? "lg";

  const textLayers = editor?.textLayers?.length
    ? editor.textLayers
    : defaultTextLayers(resolvedTitle, resolvedBody, backgroundImageUrl);

  const imageLayers = editor?.imageLayers || [];
  const timerEnabled = editor?.timerEnabled === true;
  const timerSeconds = timerEnabled && typeof editor?.timerSeconds === "number" && Number.isFinite(editor.timerSeconds) && editor.timerSeconds > 0
    ? Math.round(editor.timerSeconds)
    : null;

  return {
    title: resolvedTitle,
    body: resolvedBody,
    backgroundImageUrl,
    fontSize: resolvedFontSize,
    textLayers,
    imageLayers,
    timerEnabled,
    timerSeconds,
  };
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
    editor: resolveEditorState(entry.editor, title, subtitle, summary),
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

export function resolveRuntimeSlide(entry: SlideEntry, deck: PresentationDeck, index: number): PresentationRuntimeSlide | null {
  switch (entry.type) {
    case "cover":
      return runtimeSlide(entry, index, deck.chapterName, deck.cover.meetingTime, `週次 ${deck.cover.weekDate}`, deck.cover as unknown as Record<string, unknown>);
    case "agenda":
      return runtimeSlide(
        entry,
        index,
        "本週例會議程",
        deck.chapterName,
        "開場、會員簡報、來賓介紹、8 分鐘短講、表揚、VP 報告、幹部支援",
        { chapterName: deck.chapterName, weekDate: deck.weekDate },
      );
    case "keynote": {
      const slide = deck.keynoteSlides.get(entry.id);
      return keynoteSlide(entry, index, slide || {
        speaker: {
          id: entry.id,
          chinese_name: "資料暫時無法取得",
          english_name: null,
          specialty_title: null,
          specialty_description: null,
          company_name: null,
          photo_url: null,
          position: null,
          committee: null,
          member_number: null,
        },
        keynote: {
          id: entry.id,
          topic: "資料暫時無法取得",
          outline: "請稍後再試",
          product_images: [],
        },
      });
    }
    case "member": {
      const slide = deck.memberSlides.get(entry.id);
      return memberSlide(entry, index, slide || {
        member: {
          id: entry.id,
          chinese_name: "資料暫時無法取得",
          english_name: null,
          specialty_title: "請稍後再試",
          specialty_description: null,
          company_name: null,
          photo_url: null,
          position: null,
          committee: null,
          member_number: null,
        },
        brief: {
          id: entry.id,
          have_this_week: null,
          want_this_week: null,
        },
      });
    }
    case "guest": {
      const slide = deck.guestSlides.get(entry.id);
      return guestSlide(entry, index, slide || {
        guest: {
          id: entry.id,
          name: "資料暫時無法取得",
          company: null,
          specialty: null,
        },
        visit: {
          id: entry.id,
          visit_number: 1,
          status: "pending",
          self_intro: "請稍後再試",
        },
        referrer: null,
      });
    }
    case "award": {
      const slide = deck.awardSlides.get(entry.id);
      return awardSlide(entry, index, slide || {
        award: {
          id: entry.id,
          award_type: "獎項資料暫時無法取得",
          description: "請稍後再試",
        },
        recipient: null,
      });
    }
    case "vp_report": {
      const slide = deck.vpReportSlides.get(entry.id);
      return vpReportSlide(entry, index, slide || {
        report: {
          id: entry.id,
          total_referrals: 0,
          total_one_on_ones: 0,
          total_visitors: 0,
          member_attendance: 0,
          referral_value_twd: 0,
          notes: "營運指標資料暫時無法取得，請稍後再試",
        },
      });
    }
    case "team":
      if (!deck.teamSlide) return null;
      return runtimeSlide(
        entry,
        index,
        `${deck.chapterName} 幹部`,
        "例會運作與會員支持窗口",
        `本週幹部 ${deck.teamSlide.members.length} 位`,
        deck.teamSlide as unknown as Record<string, unknown>,
      );
    case "closing":
      return runtimeSlide(
        entry,
        index,
        "簡報結束",
        deck.chapterName,
        "感謝參與本週例會，請持續完成引薦與一對一後續行動。",
        { chapterName: deck.chapterName, weekDate: deck.weekDate },
      );
    case "custom":
      return runtimeSlide(entry, index, entry.editor?.title ?? "自訂投影片", "", "", {});
  }
}

export function toRuntimeDeck(deck: PresentationDeck): PresentationRuntimeDeck {
  const slides = deck.slideOrder.flatMap((entry, index): PresentationRuntimeSlide[] => {
    const slide = resolveRuntimeSlide(entry, deck, index);
    return slide ? [slide] : [];
  });

  return {
    weekDate: deck.weekDate,
    chapterName: deck.chapterName,
    slides,
  };
}

export function parseTextWithImages(text: string): { type: "text" | "image"; content: string }[] {
  if (!text) return [];

  const result: { type: "text" | "image"; content: string }[] = [];
  const regex = /!\[.*?\]\((.*?)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const textBefore = text.slice(lastIndex, match.index);
    if (textBefore) {
      result.push({ type: "text", content: textBefore });
    }
    result.push({ type: "image", content: match[1] });
    lastIndex = regex.lastIndex;
  }

  const textAfter = text.slice(lastIndex);
  if (textAfter) {
    result.push({ type: "text", content: textAfter });
  }

  return result;
}
