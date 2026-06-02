import type { Database } from "./supabase/types";

export type AvailabilityRow = Database["public"]["Tables"]["member_availability"]["Row"];
export type OneOnOneRow = Database["public"]["Tables"]["one_on_ones"]["Row"];

export const weekdayLabels = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"] as const;

function requireField(value: string, label: string) {
  if (!value.trim()) {
    throw new Error(`${label} 為必填`);
  }
}

export function buildJitsiRoom() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 10);
}

export function parseLocalDateTimeToIso(value: string) {
  requireField(value, "預約時間");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("預約時間格式錯誤");
  }
  return date.toISOString();
}

export function parseLocalDateTimeParts(value: string) {
  requireField(value, "預約時間");
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) {
    throw new Error("預約時間格式錯誤");
  }
  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return {
    iso: new Date(value).toISOString(),
    day_of_week: dayOfWeek,
    start_time: `${hourText}:${minuteText}`,
    end_time: addMinutesToTimeString(`${hourText}:${minuteText}`, 60),
    year,
    month,
    day,
    hour,
    minute,
  };
}

export function parseAvailabilityPayload(formData: FormData) {
  const explicitTotal = Number(formData.get("availability_total") || 0);
  const inferredTotal = Array.from(formData.keys()).reduce((max, key) => {
    const match = key.match(/^availability_(?:day_of_week|start_time|end_time)_(\d+)$/);
    if (!match) return max;
    return Math.max(max, Number(match[1]) + 1);
  }, 0);
  const totalRows = Math.max(explicitTotal, inferredTotal);

  const rows: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
  }> = [];

  for (let index = 0; index < totalRows; index += 1) {
    const dayValue = String(formData.get(`availability_day_of_week_${index}`) || "").trim();
    const start = String(formData.get(`availability_start_time_${index}`) || "").trim();
    const end = String(formData.get(`availability_end_time_${index}`) || "").trim();
    if (!start && !end) continue;
    requireField(dayValue, "星期");
    requireField(start, "開始時間");
    requireField(end, "結束時間");
    const dayOfWeek = Number(dayValue);
    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      throw new Error("星期必須介於 0 到 6");
    }
    if (start >= end) {
      throw new Error("可用時段的開始時間必須早於結束時間");
    }
    rows.push({
      day_of_week: dayOfWeek,
      start_time: start,
      end_time: end,
    });
  }

  return rows;
}

function getLocalTimeString(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function addMinutesToTimeString(time: string, minutes: number) {
  const [hourText, minuteText] = time.split(":");
  const totalMinutes = Number(hourText) * 60 + Number(minuteText) + minutes;
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const mins = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${mins}`;
}

function normalizeTimeString(value: string) {
  return value.slice(0, 5);
}

export function isWithinAvailabilityWindow(
  scheduledAtIso: string,
  availabilityRows: Array<Pick<AvailabilityRow, "day_of_week" | "start_time" | "end_time">>,
  durationMinutes = 60,
) {
  const scheduledAt = new Date(scheduledAtIso);
  const dayOfWeek = scheduledAt.getDay();
  const startTime = getLocalTimeString(scheduledAt);
  const endTime = addMinutesToTimeString(startTime, durationMinutes);

  return availabilityRows.some(
    (row) =>
      row.day_of_week === dayOfWeek &&
      normalizeTimeString(row.start_time) <= startTime &&
      normalizeTimeString(row.end_time) >= endTime,
  );
}

export function isWithinAvailabilityWindowByLocalParts(
  localParts: Pick<ReturnType<typeof parseLocalDateTimeParts>, "day_of_week" | "start_time" | "end_time">,
  availabilityRows: Array<Pick<AvailabilityRow, "day_of_week" | "start_time" | "end_time">>,
) {
  return availabilityRows.some(
    (row) =>
      row.day_of_week === localParts.day_of_week &&
      normalizeTimeString(row.start_time) <= localParts.start_time &&
      normalizeTimeString(row.end_time) >= localParts.end_time,
  );
}

export function hasBookingConflict(
  rows: Array<Pick<OneOnOneRow, "inviter_id" | "invitee_id" | "scheduled_at" | "status">>,
  inviterId: string,
  inviteeId: string,
  scheduledAtIso: string,
) {
  const scheduledAtMillis = new Date(scheduledAtIso).getTime();
  return rows.some((row) => {
    if (!row.scheduled_at || row.status === "cancelled") return false;
    if (new Date(row.scheduled_at).getTime() !== scheduledAtMillis) return false;
    return [row.inviter_id, row.invitee_id].includes(inviterId) || [row.inviter_id, row.invitee_id].includes(inviteeId);
  });
}
