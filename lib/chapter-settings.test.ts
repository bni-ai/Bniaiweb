import { describe, expect, it } from "vitest";

import {
  buildReminderMessage,
  DEFAULT_CHAPTER_SETTINGS,
  isLateBriefSubmission,
  resolveSubmissionDeadlineAt,
  resolveWeekDayDate,
} from "./chapter-settings";

describe("chapter settings helpers", () => {
  it("resolves monday-based week dates into target day", () => {
    expect(resolveWeekDayDate("2026-06-01", 4)).toBe("2026-06-05");
  });

  it("builds the chapter submission deadline timestamp", () => {
    expect(resolveSubmissionDeadlineAt("2026-06-01", DEFAULT_CHAPTER_SETTINGS).toISOString()).toBe("2026-06-05T15:59:00.000Z");
  });

  it("marks submissions after the configured deadline as late", () => {
    expect(isLateBriefSubmission("2026-06-01", "2026-06-05T16:00:00.000Z", DEFAULT_CHAPTER_SETTINGS)).toBe(true);
    expect(isLateBriefSubmission("2026-06-01", "2026-06-05T15:58:00.000Z", DEFAULT_CHAPTER_SETTINGS)).toBe(false);
  });

  it("builds reminder text with member name and week", () => {
    expect(buildReminderMessage("余啟彰", "2026-06-01")).toContain("余啟彰");
    expect(buildReminderMessage("余啟彰", "2026-06-01")).toContain("2026-06-01");
  });
});
