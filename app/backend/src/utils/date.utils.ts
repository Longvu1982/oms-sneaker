import { parseISO } from 'date-fns';

/** Vietnam business timezone offset in milliseconds (UTC+7, no DST). */
const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000;

export function getVietnamMonthRange(dateTime: string) {
  const parsedDate = parseISO(dateTime);
  const vietnamTime = new Date(parsedDate.getTime() + VIETNAM_OFFSET_MS);
  const year = vietnamTime.getUTCFullYear();
  const month = vietnamTime.getUTCMonth();

  const startOfTheMonth = new Date(
    Date.UTC(year, month, 1, 0, 0, 0, 0) - VIETNAM_OFFSET_MS
  );
  const endOfTheMonth = new Date(
    Date.UTC(year, month + 1, 0, 23, 59, 59, 999) - VIETNAM_OFFSET_MS
  );

  return { startOfTheMonth, endOfTheMonth };
}
