import { describe, expect, it } from "vitest";

function summarizeMemberCredits(records: Array<{ member_id: string; credits_earned: number | null }>, memberId: string) {
  return records.filter((record) => record.member_id === memberId).reduce((sum, record) => sum + (record.credits_earned || 0), 0);
}

describe("training baseline helpers", () => {
  it("sums credits per member", () => {
    expect(
      summarizeMemberCredits(
        [
          { member_id: "a", credits_earned: 2 },
          { member_id: "a", credits_earned: 3 },
          { member_id: "b", credits_earned: 5 },
        ],
        "a",
      ),
    ).toBe(5);
  });
});
