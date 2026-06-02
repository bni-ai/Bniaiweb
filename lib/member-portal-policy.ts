export type WeekLockRow = {
  locked_at: string | null;
} | null;

export function isWeekLocked(lock: WeekLockRow): boolean {
  return Boolean(lock?.locked_at);
}
