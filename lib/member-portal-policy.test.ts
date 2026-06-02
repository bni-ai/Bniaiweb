import { describe, expect, it } from "vitest";

import { isWeekLocked } from "./member-portal-policy";

describe("member portal policy", () => {
  it("treats missing lock rows as editable", () => {
    expect(isWeekLocked(null)).toBe(false);
  });

  it("treats explicit lock rows as read-only", () => {
    expect(isWeekLocked({ locked_at: "2026-06-01T00:00:00.000Z" })).toBe(true);
  });
});
