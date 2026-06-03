import { describe, expect, it } from "vitest";

import { resolveRuntimeSlide, toRuntimeDeck } from "./runtime";
import type { PresentationDeck } from "./viewer";

const member = {
  id: "member-1",
  chinese_name: "余啟銘",
  english_name: "Fish",
  specialty_title: "資訊組會員",
  specialty_description: "AI 系統整合",
  company_name: "BNI 華 AI",
  photo_url: null,
  position: "資訊組",
  committee: "資訊組",
  member_number: "7",
};

function makeDeck(): PresentationDeck {
  return {
    chapterName: "BNI 華 AI 分會",
    weekDate: "2026-06-01",
    slideOrder: [
      { type: "cover" },
      { type: "agenda" },
      { type: "keynote", id: "keynote-1", visible: true },
      { type: "member", id: "brief-1", visible: true },
      { type: "guest", id: "missing-guest", visible: true },
      { type: "team" },
      { type: "closing" },
    ],
    cover: {
      chapterName: "BNI 華 AI 分會",
      weekDate: "2026 / 06 / 01",
      meetingTime: "每週四 07:30 - 09:30",
    },
    memberSlides: new Map([
      [
        "brief-1",
        {
          member,
          brief: {
            id: "brief-1",
            have_this_week: "本週可協助 AI 簡報系統驗收。",
            want_this_week: "想認識需要導入內部工具的企業主。",
          },
        },
      ],
    ]),
    keynoteSlides: new Map([
      [
        "keynote-1",
        {
          speaker: member,
          keynote: {
            id: "keynote-1",
            topic: "AI 實戰短講",
            outline: "資料整理\n簡報預覽",
            product_images: [],
          },
        },
      ],
    ]),
    guestSlides: new Map(),
    awardSlides: new Map(),
    vpReportSlides: new Map(),
    teamSlide: {
      chapterName: "BNI 華 AI 分會",
      members: [member],
    },
  };
}

describe("presentation runtime deck", () => {
  it("creates serializable runtime slides and keeps missing data-driven payloads as placeholders", () => {
    const runtimeDeck = toRuntimeDeck(makeDeck());

    expect(runtimeDeck).toMatchObject({
      weekDate: "2026-06-01",
      chapterName: "BNI 華 AI 分會",
    });
    expect(runtimeDeck.slides.map((slide) => slide.type)).toEqual(["cover", "agenda", "keynote", "member", "guest", "team", "closing"]);
    expect(runtimeDeck.slides).toHaveLength(7);
    expect(runtimeDeck.slides.every((slide) => (
      typeof slide.id === "string" &&
      typeof slide.label === "string" &&
      typeof slide.title === "string" &&
      typeof slide.subtitle === "string" &&
      typeof slide.summary === "string" &&
      typeof slide.notes === "string" &&
      typeof slide.editor === "object" &&
      typeof slide.payload === "object"
    ))).toBe(true);
    expect(JSON.parse(JSON.stringify(runtimeDeck))).toEqual(runtimeDeck);
  });

  it("derives speaker notes from slide type and summary", () => {
    const runtimeDeck = toRuntimeDeck(makeDeck());
    const keynote = runtimeDeck.slides.find((slide) => slide.type === "keynote");

    expect(keynote?.title).toBe("AI 實戰短講");
    expect(keynote?.notes).toContain("演講");
    expect(keynote?.notes).toContain("AI 實戰短講");
    expect(keynote?.editor.title).toBe("AI 實戰短講");
    expect(keynote?.editor.body).toContain("余啟銘");
    expect(keynote?.editor.textLayers[0]?.text).toBe("AI 實戰短講");
    expect(keynote?.editor.textLayers[1]?.text).toContain("余啟銘");
  });

  it("handles editor patch merge logic (override, fallback to db, and unset)", () => {
    const deck = makeDeck();
    
    // 1. override (non-null values)
    const entryOverride: SlideEntry = {
      type: "member",
      id: "brief-1",
      visible: true,
      editor: {
        title: "自訂會員標題",
        body: "自訂會員內文",
      },
    };
    const runtimeOverride = resolveRuntimeSlide(entryOverride, deck, 0);
    expect(runtimeOverride?.editor.title).toBe("自訂會員標題");
    expect(runtimeOverride?.editor.body).toBe("自訂會員內文");

    // 2. null values (should fallback to database values)
    const entryNull: SlideEntry = {
      type: "member",
      id: "brief-1",
      visible: true,
      editor: {
        title: null,
        body: null,
      },
    };
    const runtimeNull = resolveRuntimeSlide(entryNull, deck, 0);
    expect(runtimeNull?.editor.title).toBe("余啟銘"); // database member chinese_name
    expect(runtimeNull?.editor.body).toBe("資訊組會員\n\n本週可協助 AI 簡報系統驗收。；想認識需要導入內部工具的企業主。");

    // 3. undefined values
    const entryUndefined: SlideEntry = {
      type: "member",
      id: "brief-1",
      visible: true,
      editor: {},
    };
    const runtimeUndefined = resolveRuntimeSlide(entryUndefined, deck, 0);
    expect(runtimeUndefined?.editor.title).toBe("余啟銘");
    expect(runtimeUndefined?.editor.body).toBe("資訊組會員\n\n本週可協助 AI 簡報系統驗收。；想認識需要導入內部工具的企業主。");
  });

  it("handles data source missing fallback for member and guest slides without white screen", () => {
    const deck = makeDeck();
    
    // 1. missing member slide
    const entryMissingMember: SlideEntry = {
      type: "member",
      id: "non-existent-brief-id",
      visible: true,
    };
    const runtimeMissingMember = resolveRuntimeSlide(entryMissingMember, deck, 0);
    expect(runtimeMissingMember).not.toBeNull();
    expect(runtimeMissingMember?.title).toBe("資料暫時無法取得");
    expect(runtimeMissingMember?.editor.title).toBe("資料暫時無法取得");
    expect(runtimeMissingMember?.editor.body).toBe("請稍後再試");

    // 2. missing guest slide
    const entryMissingGuest: SlideEntry = {
      type: "guest",
      id: "non-existent-guest-id",
      visible: true,
    };
    const runtimeMissingGuest = resolveRuntimeSlide(entryMissingGuest, deck, 0);
    expect(runtimeMissingGuest).not.toBeNull();
    expect(runtimeMissingGuest?.title).toBe("資料暫時無法取得");
    expect(runtimeMissingGuest?.editor.body).toBe("本週來賓\n\n請稍後再試");
  });
});
