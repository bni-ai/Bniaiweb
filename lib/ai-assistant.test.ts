import { describe, expect, it } from "vitest";

import { buildAiMemberResponse, extractMemberQueryKeywords, searchMembersByQuery } from "./ai-assistant";

describe("ai assistant helpers", () => {
  it("extracts specialty keywords from natural language", () => {
    expect(extractMemberQueryKeywords("誰的專業是 AI落地")).toEqual(["AI落地"]);
  });

  it("matches members by specialty and description", () => {
    const members = [
      { chinese_name: "余啟銘", specialty_title: "AI落地", specialty_description: "企業內部導入", company_name: "華AI", committee: "資訊組員" },
      { chinese_name: "王小明", specialty_title: "會計", specialty_description: "稅務", company_name: "明會計", committee: "財務" },
    ];
    expect(searchMembersByQuery("誰的專業是 AI落地", members)).toHaveLength(1);
    expect(buildAiMemberResponse("誰的專業是 AI落地", "claude", members).answer).toContain("余啟銘");
  });
});
