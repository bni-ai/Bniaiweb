import { describe, expect, it } from "vitest";

import { buildSlideOrderFromData } from "./presentation/builder";
import { parseSlideOrder } from "./presentation/slide-order";

describe("presentation slide builder", () => {
  it("builds a complete deck in deterministic order", () => {
    const slides = buildSlideOrderFromData({
      keynote: { id: "keynote-1" },
      briefs: [
        { id: "brief-2", member_number: "12" },
        { id: "brief-1", member_number: "3" },
      ],
      guestVisits: [
        { id: "visit-2", visit_number: 2, created_at: "2026-06-01T09:00:00Z" },
        { id: "visit-1", visit_number: 1, created_at: "2026-06-01T08:00:00Z" },
      ],
      awards: [
        { id: "award-2", created_at: "2026-06-01T09:00:00Z" },
        { id: "award-1", created_at: "2026-06-01T08:00:00Z" },
      ],
      vpReport: { id: "vp-1" },
    });

    expect(slides).toEqual([
      { type: "cover" },
      { type: "keynote", id: "keynote-1", visible: true },
      { type: "member", id: "brief-1", visible: true },
      { type: "member", id: "brief-2", visible: true },
      { type: "guest", id: "visit-1", visible: true },
      { type: "guest", id: "visit-2", visible: true },
      { type: "award", id: "award-1", visible: true },
      { type: "award", id: "award-2", visible: true },
      { type: "vp_report", id: "vp-1", visible: true },
      { type: "team" },
    ]);
  });

  it("skips missing datasets while keeping cover and team", () => {
    const slides = buildSlideOrderFromData({
      keynote: null,
      briefs: [],
      guestVisits: [],
      awards: [],
      vpReport: null,
    });

    expect(slides).toEqual([{ type: "cover" }, { type: "team" }]);
  });
});

describe("presentation slide order validation", () => {
  it("accepts supported slide entries", () => {
    expect(
      parseSlideOrder([
        { type: "cover" },
        { type: "member", id: "brief-1", visible: true },
        { type: "team" },
      ]),
    ).toEqual([
      { type: "cover" },
      { type: "member", id: "brief-1", visible: true },
      { type: "team" },
    ]);
  });

  it("rejects malformed slide entries before rendering", () => {
    expect(() => parseSlideOrder([{ type: "unknown", id: "x" }])).toThrow(/未知 slide type/);
    expect(() => parseSlideOrder([{ type: "member", id: "brief-1" }])).toThrow(/缺少 id 或 visible/);
  });
});
