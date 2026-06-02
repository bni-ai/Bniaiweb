import { describe, expect, it } from "vitest";

describe("events baseline", () => {
  it("keeps remaining spots non-negative", () => {
    const maxParticipants = 2;
    const registrationCount = 3;
    const remaining = Math.max(maxParticipants - registrationCount, 0);
    expect(remaining).toBe(0);
  });
});
