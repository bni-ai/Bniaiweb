import { describe, expect, it } from "vitest";

import { filterGuestContentItems, selectCurrentGuestVisit } from "./guest-portal";

describe("guest portal helpers", () => {
  it("shows only public published content to anonymous visitors", () => {
    const items = [
      { title: "公開文章", status: "published", visibility: "public", published_at: "2026-06-01" },
      { title: "來賓限定", status: "published", visibility: "guest_only", published_at: "2026-06-01" },
      { title: "草稿", status: "draft", visibility: "public", published_at: "2026-06-01" },
    ];

    expect(filterGuestContentItems(items, false).map((item) => item.title)).toEqual(["公開文章"]);
  });

  it("shows guest-only published content to authenticated guests", () => {
    const items = [
      { title: "公開文章", status: "published", visibility: "public", published_at: "2026-06-01" },
      { title: "來賓限定", status: "published", visibility: "guest_only", published_at: "2026-06-01" },
    ];

    expect(filterGuestContentItems(items, true).map((item) => item.title)).toEqual(["公開文章", "來賓限定"]);
  });

  it("prefers the latest active guest visit", () => {
    expect(
      selectCurrentGuestVisit([
        { week_date: "2026-05-25", status: "attended", visit_number: 1 },
        { week_date: "2026-06-08", status: "confirmed", visit_number: 2 },
      ]),
    ).toMatchObject({ week_date: "2026-06-08", visit_number: 2 });
  });
});
