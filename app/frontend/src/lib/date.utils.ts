/** Vietnam business timezone offset (UTC+7, no DST). */
const VIETNAM_TZ = "+07:00";

/**
 * Normalize a date to the 1st of its month at midnight in Vietnam (UTC+7).
 * Browser timezone does not affect the result — June 2026 always becomes
 * `2026-05-31T17:00:00.000Z`.
 */
export function toVietnamMonthDate(date: Date): Date {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return new Date(`${year}-${month}-01T00:00:00${VIETNAM_TZ}`);
}
