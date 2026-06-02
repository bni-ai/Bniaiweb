import { describe, expect, it } from "vitest";

import { buildPresentationSlides, getNextVisitNumber, validateVpMetrics } from "./admin-workflows";

describe("admin workflow helpers", () => {
  it("rejects negative VP metrics", () => {
    expect(validateVpMetrics({ total_referrals: -1, total_one_on_ones: 2 })).toEqual({
      total_referrals: "不可小於 0",
    });
    expect(validateVpMetrics({ total_referrals: 18, referral_value_twd: 520000 })).toEqual({});
  });

  it("increments returning guest visit number", () => {
    expect(getNextVisitNumber([])).toBe(1);
    expect(getNextVisitNumber([1, 2])).toBe(3);
  });

  it("builds a non-empty slide order from weekly data", () => {
    const slides = buildPresentationSlides({
      weekDate: "2026-06-01",
      briefs: [{ id: "wb-1" }],
      keynote: { id: "k-1" },
      guestVisits: [{ guest_id: "g-1" }],
      awards: [{ id: "a-1" }],
      vpReport: { id: "vp-1" },
    });

    expect(slides.map((slide) => slide.type)).toEqual(["cover", "keynote", "member", "guest", "award", "vp_report", "team"]);
    expect(slides.every((slide) => slide.visible)).toBe(true);
  });
});
