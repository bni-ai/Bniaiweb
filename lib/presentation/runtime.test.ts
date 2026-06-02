import { describe, expect, it } from "vitest";

import { toRuntimeDeck } from "./runtime";
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
  it("creates serializable runtime slides and skips missing data-driven payloads", () => {
    const runtimeDeck = toRuntimeDeck(makeDeck());

    expect(runtimeDeck).toMatchObject({
      weekDate: "2026-06-01",
      chapterName: "BNI 華 AI 分會",
    });
    expect(runtimeDeck.slides.map((slide) => slide.type)).toEqual(["cover", "agenda", "keynote", "member", "team", "closing"]);
    expect(runtimeDeck.slides).toHaveLength(6);
    expect(runtimeDeck.slides.every((slide) => (
      typeof slide.id === "string" &&
      typeof slide.label === "string" &&
      typeof slide.title === "string" &&
      typeof slide.subtitle === "string" &&
      typeof slide.summary === "string" &&
      typeof slide.notes === "string" &&
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
  });
});
