import { describe, expect, it } from "vitest";

import { buildJitsiRoom, hasBookingConflict, isWithinAvailabilityWindowByLocalParts, parseAvailabilityPayload, parseLocalDateTimeParts, parseLocalDateTimeToIso } from "./one-on-one";

describe("one-on-one helpers", () => {
  it("parses availability rows and ignores blanks", () => {
    const formData = new FormData();
    formData.set("availability_day_of_week_0", "1");
    formData.set("availability_start_time_0", "10:00");
    formData.set("availability_end_time_0", "11:00");
    formData.set("availability_day_of_week_1", "3");
    formData.set("availability_start_time_1", "");
    formData.set("availability_end_time_1", "");

    expect(parseAvailabilityPayload(formData)).toEqual([
      { day_of_week: 1, start_time: "10:00", end_time: "11:00" },
    ]);
  });

  it("rejects invalid availability windows", () => {
    const formData = new FormData();
    formData.set("availability_day_of_week_0", "2");
    formData.set("availability_start_time_0", "11:00");
    formData.set("availability_end_time_0", "10:00");

    expect(() => parseAvailabilityPayload(formData)).toThrow(/開始時間/);
  });

  it("checks whether a slot is within invitee availability", () => {
    const availabilityRows = [{ day_of_week: 4, start_time: "10:00", end_time: "12:00" }];
    expect(isWithinAvailabilityWindowByLocalParts(parseLocalDateTimeParts("2026-06-04T10:30"), availabilityRows)).toBe(true);
    expect(isWithinAvailabilityWindowByLocalParts(parseLocalDateTimeParts("2026-06-04T13:30"), availabilityRows)).toBe(false);
  });

  it("detects one-on-one conflicts for either participant", () => {
    const rows = [
      { inviter_id: "m-1", invitee_id: "m-2", scheduled_at: "2026-06-04T02:00:00.000Z", status: "confirmed" as const },
    ];

    expect(hasBookingConflict(rows, "m-3", "m-2", "2026-06-04T02:00:00.000Z")).toBe(true);
    expect(hasBookingConflict(rows, "m-3", "m-4", "2026-06-04T02:00:00.000Z")).toBe(false);
  });

  it("generates a 10-char jitsi room and parses datetime", () => {
    expect(buildJitsiRoom()).toHaveLength(10);
    expect(parseLocalDateTimeToIso("2026-06-04T10:00")).toMatch(/^2026-06-04T/);
  });
});
