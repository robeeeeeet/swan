/**
 * Date Utilities
 *
 * Timezone-aware date handling utilities for the Swan app.
 * All functions use local timezone (JST in Japan) instead of UTC
 * to prevent date mismatches around midnight.
 */

/**
 * Returns the current local date in YYYY-MM-DD format.
 * This is timezone-safe and will return the correct date
 * regardless of the user's location.
 *
 * Unlike toISOString().split('T')[0] which uses UTC,
 * this function uses local date methods.
 *
 * @param date - Optional Date object (defaults to current time)
 * @returns Date string in YYYY-MM-DD format (local timezone)
 *
 * @example
 * // In Japan (JST) at 01:00 on Jan 1, 2024
 * getLocalDateString() // Returns "2024-01-01"
 * // Instead of toISOString() which would return "2023-12-31"
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns a Date object set to midnight (00:00:00) in local timezone.
 * Useful for date comparisons where time should be ignored.
 *
 * @param date - Optional Date object (defaults to current time)
 * @returns Date object with time set to 00:00:00 local time
 */
export function getLocalMidnight(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Creates a Date object from a YYYY-MM-DD string in local timezone.
 * This avoids timezone issues when parsing date strings.
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object set to midnight local time on the given date
 *
 * @example
 * // Creates a date at midnight local time
 * parseLocalDateString("2024-01-01") // Jan 1, 2024 00:00:00 local
 */
export function parseLocalDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Gets the day of week label in Japanese.
 *
 * @param date - Date object
 * @returns Japanese day label (日, 月, 火, 水, 木, 金, 土)
 */
export function getJapaneseDayLabel(date: Date): string {
  return ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
}

/**
 * Formats a date as a short label for charts (e.g., "1(月)")
 *
 * @param date - Date object
 * @returns Formatted label like "1(月)"
 */
export function getChartDateLabel(date: Date): string {
  const day = date.getDate();
  const dayLabel = getJapaneseDayLabel(date);
  return `${day}(${dayLabel})`;
}
