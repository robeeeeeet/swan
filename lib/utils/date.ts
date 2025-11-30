/**
 * Date Utilities
 *
 * Timezone-aware date handling utilities for the Swan app.
 * Uses date-fns for consistent date manipulation.
 * All functions use the browser's local timezone automatically.
 */

import { format, startOfDay, parse, getDay, getDate, getHours } from 'date-fns';
import { ja } from 'date-fns/locale';

/**
 * Japanese day labels for the week
 */
const JAPANESE_DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const;

/**
 * Returns the current local date in YYYY-MM-DD format.
 * This is timezone-safe and will return the correct date
 * based on the browser's locale.
 *
 * @param date - Optional Date object (defaults to current time)
 * @returns Date string in YYYY-MM-DD format (local timezone)
 *
 * @example
 * // In Japan (JST) at 01:00 on Jan 1, 2024
 * getLocalDateString() // Returns "2024-01-01"
 */
export function getLocalDateString(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Returns a Date object set to midnight (00:00:00) in local timezone.
 * Useful for date comparisons where time should be ignored.
 *
 * @param date - Optional Date object (defaults to current time)
 * @returns Date object with time set to 00:00:00 local time
 */
export function getLocalMidnight(date: Date = new Date()): Date {
  return startOfDay(date);
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
  return parse(dateString, 'yyyy-MM-dd', new Date());
}

/**
 * Gets the day of week label in Japanese.
 *
 * @param date - Date object
 * @returns Japanese day label (日, 月, 火, 水, 木, 金, 土)
 */
export function getJapaneseDayLabel(date: Date): string {
  return JAPANESE_DAY_LABELS[getDay(date)];
}

/**
 * Formats a date as a short label for charts (e.g., "1(月)")
 *
 * @param date - Date object
 * @returns Formatted label like "1(月)"
 */
export function getChartDateLabel(date: Date): string {
  const day = getDate(date);
  const dayLabel = getJapaneseDayLabel(date);
  return `${day}(${dayLabel})`;
}

/**
 * Formats a date to Japanese format (e.g., "11月30日(土)")
 *
 * @param date - Date object or date string in YYYY-MM-DD format
 * @returns Formatted date string
 */
export function formatDateJapanese(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseLocalDateString(date) : date;
  const dayLabel = getJapaneseDayLabel(dateObj);
  return format(dateObj, `M月d日(${dayLabel})`, { locale: ja });
}

/**
 * Formats a timestamp to time string (e.g., "14:30")
 *
 * @param timestamp - Date object, timestamp number, or ISO timestamp string
 * @returns Formatted time string
 */
export function formatTimeString(timestamp: Date | number | string): string {
  const date = typeof timestamp === 'string' || typeof timestamp === 'number'
    ? new Date(timestamp)
    : timestamp;
  return format(date, 'HH:mm');
}

/**
 * Gets the hour from a timestamp
 *
 * @param timestamp - Date object, timestamp number, or ISO timestamp string
 * @returns Hour (0-23)
 */
export function getHourFromTimestamp(timestamp: Date | number | string): number {
  const date = typeof timestamp === 'string' || typeof timestamp === 'number'
    ? new Date(timestamp)
    : timestamp;
  return getHours(date);
}
