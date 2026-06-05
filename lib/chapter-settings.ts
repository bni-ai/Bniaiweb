export type ChapterSettings = {
  meetingTime: string | null;
  submissionDeadlineDay: number;
  submissionDeadlineTime: string;
  reminderDay: number;
  reminderTime: string;
};

export const DEFAULT_CHAPTER_SETTINGS: ChapterSettings = {
  meetingTime: "每週五 07:00",
  submissionDeadlineDay: 4,
  submissionDeadlineTime: "23:59",
  reminderDay: 3,
  reminderTime: "18:00",
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function resolveWeekDayDate(weekDate: string, dayOffset: number) {
  const [baseYear, baseMonth, baseDay] = weekDate.split("-").map(Number);
  const base = new Date(Date.UTC(baseYear, baseMonth - 1, baseDay));
  base.setUTCDate(base.getUTCDate() + dayOffset);
  const year = base.getUTCFullYear();
  const month = pad(base.getUTCMonth() + 1);
  const day = pad(base.getUTCDate());
  return `${year}-${month}-${day}`;
}

export function buildTaipeiTimestamp(date: string, time: string) {
  return new Date(`${date}T${time}:00+08:00`);
}

export function resolveSubmissionDeadlineAt(weekDate: string, settings: ChapterSettings) {
  const deadlineDate = resolveWeekDayDate(weekDate, settings.submissionDeadlineDay);
  return buildTaipeiTimestamp(deadlineDate, settings.submissionDeadlineTime);
}

export function isLateBriefSubmission(weekDate: string, submittedAtIso: string, settings: ChapterSettings) {
  return new Date(submittedAtIso).getTime() > resolveSubmissionDeadlineAt(weekDate, settings).getTime();
}

export function buildReminderMessage(memberName: string, weekDate: string) {
  return `${memberName}，提醒你尚未完成 ${weekDate} 當週每週簡報，請在例會前補上本週我有 / 本週我要。`;
}
