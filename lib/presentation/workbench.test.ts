import { describe, expect, it } from "vitest";

import { buildWorkbenchSlideOrder, describeSlideEntry, isVisibleSlide } from "./workbench";

describe("presentation workbench helpers", () => {
  it("reorders slides and applies visibility from form rows", () => {
    const formData = new FormData();
    formData.set("slide_count", "3");
    formData.set("slide_payload_0", JSON.stringify({ type: "cover" }));
    formData.set("slide_order_0", "2");
    formData.set("slide_payload_1", JSON.stringify({ type: "keynote", id: "k1", visible: true }));
    formData.set("slide_order_1", "3");
    formData.set("slide_payload_2", JSON.stringify({ type: "member", id: "m1", visible: true }));
    formData.set("slide_order_2", "1");
    formData.set("slide_visible_2", "on");

    expect(buildWorkbenchSlideOrder(formData)).toEqual([
      { type: "member", id: "m1", visible: true },
      { type: "cover" },
      { type: "keynote", id: "k1", visible: false },
    ]);
  });

  it("labels slide entries for operator surfaces", () => {
    expect(describeSlideEntry({ type: "cover" })).toEqual({ label: "封面", typeLabel: "固定", canToggle: false });
    expect(describeSlideEntry({ type: "member", id: "b1", visible: true })).toEqual({ label: "會員投影片", typeLabel: "會員", canToggle: true });
  });

  it("detects toggleable slide entries", () => {
    expect(isVisibleSlide({ type: "team" })).toBe(false);
    expect(isVisibleSlide({ type: "guest", id: "g1", visible: false })).toBe(true);
  });
});
