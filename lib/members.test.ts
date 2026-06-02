import { describe, expect, it } from "vitest";

import {
  buildContactsCirclePayload,
  buildTopClientsPayload,
  parseAdminMemberFormData,
  parseMemberProfileFormData,
} from "./member-form";

describe("members actions helpers", () => {
  it("requires admin create fields", () => {
    const formData = new FormData();
    formData.set("email", "new@example.com");

    expect(() => parseAdminMemberFormData(formData, "create")).toThrowError(/會員編號/);
  });

  it("blocks member profile from elevating role fields", () => {
    const formData = new FormData();
    formData.set("chinese_name", "余啟銘");
    formData.set("specialty_title", "資訊組會員");
    formData.set("role", "president");
    formData.set("committee", "會員委員");

    const payload = parseMemberProfileFormData(formData);

    expect("role" in payload).toBe(false);
    expect("committee" in payload).toBe(false);
    expect(payload.chinese_name).toBe("余啟銘");
  });

  it("keeps one unique payload per top-client rank", () => {
    const formData = new FormData();
    formData.set("rank_1_industry", "AI服務");
    formData.set("rank_1_company_type", "新創");
    formData.set("rank_2_industry", "醫療");
    formData.set("rank_2_location", "台北");

    const rows = buildTopClientsPayload(formData);

    expect(rows).toEqual([
      { rank: 1, industry: "AI服務", company_type: "新創", location: null, notes: null },
      { rank: 2, industry: "醫療", company_type: null, location: "台北", notes: null },
    ]);
  });

  it("rejects invalid contacts tier values", () => {
    const formData = new FormData();
    formData.set("contact_name_0", "王大明");
    formData.set("contact_tier_0", "4");

    expect(() => buildContactsCirclePayload(formData)).toThrowError(/Tier/);
  });

  it("builds contacts payload and ignores blank rows", () => {
    const formData = new FormData();
    formData.set("contact_name_0", "王大明");
    formData.set("contact_tier_0", "1");
    formData.set("contact_relationship_0", "大學同學");
    formData.set("contact_name_1", "");
    formData.set("contact_tier_1", "2");

    const rows = buildContactsCirclePayload(formData);

    expect(rows).toEqual([
      {
        id: null,
        name: "王大明",
        tier: 1,
        relationship: "大學同學",
        industry: null,
        notes: null,
      },
    ]);
  });
});
