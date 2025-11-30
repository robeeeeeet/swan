/**
 * Summary Calculation Utilities
 *
 * Functions for calculating and updating daily summaries based on records.
 */

import { getHours } from 'date-fns';
import { SmokingRecord, DailySummary, SituationTag } from '@/types';
import { formatDateJapanese, formatTimeString } from './date';

/**
 * Calculates a daily summary from an array of smoking records.
 * This is the core logic for aggregating daily statistics.
 *
 * @param userId - The user ID
 * @param date - The date in YYYY-MM-DD format
 * @param records - Array of smoking records for the day
 * @param cigarettePrice - Price per pack (for money saved calculation)
 * @param cigarettesPerPack - Number of cigarettes per pack
 * @param minutesPerCigarette - Average minutes per cigarette
 * @param dailyTarget - User's daily target
 * @returns Calculated daily summary
 */
export function calculateDailySummary(
  userId: string,
  date: string,
  records: SmokingRecord[],
  cigarettePrice: number = 600,
  cigarettesPerPack: number = 20,
  minutesPerCigarette: number = 7,
  dailyTarget: number = 20
): DailySummary {
  // Count by type
  const totalSmoked = records.filter((r) => r.type === 'smoked').length;
  const totalCraved = records.filter((r) => r.type === 'craved').length;
  const totalResisted = records.filter((r) => r.type === 'resisted').length;

  // Calculate savings based on resisted cigarettes
  const pricePerCigarette = cigarettePrice / cigarettesPerPack;
  const moneySaved = totalResisted * pricePerCigarette;
  const minutesSaved = totalResisted * minutesPerCigarette;

  // Identify most common tags
  const tagCounts = new Map<string, number>();
  for (const record of records) {
    for (const tag of record.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }

  const sortedTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag) as SituationTag[];

  const mostCommonTags = sortedTags.slice(0, 5); // Top 5 tags

  // Calculate achievement metrics
  const goalMet = totalSmoked <= dailyTarget;
  const resistanceRate =
    totalCraved > 0 ? (totalResisted / totalCraved) * 100 : 0;

  return {
    id: `${userId}_${date}`,
    userId,
    date,
    totalSmoked,
    totalCraved,
    totalResisted,
    moneySaved,
    minutesSaved,
    mostCommonTags,
    dailyTarget,
    goalMet,
    resistanceRate,
  };
}

/**
 * Formats money as Japanese yen.
 *
 * @param amount - The amount in yen
 * @returns Formatted string (e.g., "1,200")
 */
export function formatMoney(amount: number): string {
  return Math.round(amount).toLocaleString('ja-JP');
}

/**
 * Formats a date string to Japanese format
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Formatted date (e.g., "11月30日(土)")
 */
export function formatDate(dateStr: string): string {
  return formatDateJapanese(dateStr);
}

/**
 * Formats a timestamp to time string
 * @param timestamp - ISO timestamp string or Unix timestamp in milliseconds
 * @returns Formatted time (e.g., "14:30")
 */
export function formatTime(timestamp: string | number): string {
  return formatTimeString(timestamp);
}

/**
 * Formats minutes as hours and minutes.
 *
 * @param minutes - The number of minutes
 * @returns Formatted string (e.g., "1時間30分" or "45分")
 */
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours > 0) {
    return mins > 0 ? `${hours}時間${mins}分` : `${hours}時間`;
  }

  return `${mins}分`;
}

/**
 * Converts minutes to "life regained" in a more relatable format.
 * Based on the statistic that each cigarette reduces life by ~7 minutes.
 *
 * @param minutes - The number of minutes saved
 * @returns Formatted string
 */
export function formatLifeRegained(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}分`;
  }

  const hours = minutes / 60;

  if (hours < 24) {
    return `${hours.toFixed(1)}時間`;
  }

  const days = hours / 24;

  if (days < 7) {
    return `${days.toFixed(1)}日`;
  }

  const weeks = days / 7;

  if (weeks < 4) {
    return `${weeks.toFixed(1)}週間`;
  }

  const months = days / 30;
  return `${months.toFixed(1)}ヶ月`;
}

/**
 * Calculates the resistance success rate.
 *
 * @param craved - Number of cravings
 * @param resisted - Number of successful resistances
 * @returns Percentage (0-100)
 */
export function calculateResistanceRate(
  craved: number,
  resisted: number
): number {
  if (craved === 0) return 0;
  return Math.round((resisted / craved) * 100);
}

/**
 * Determines if the user is on track to meet their daily goal.
 * Takes into account time of day to provide more accurate predictions.
 *
 * @param currentCount - Current smoked count
 * @param dailyTarget - Daily target
 * @param currentHour - Current hour (0-23)
 * @returns Object with onTrack status and projected total
 */
export function checkGoalProgress(
  currentCount: number,
  dailyTarget: number,
  currentHour: number = getHours(new Date())
): {
  onTrack: boolean;
  projectedTotal: number;
  remainingCigarettes: number;
} {
  // Assume waking hours are 8:00 - 23:00 (15 hours)
  const wakingHours = 15;
  const hoursAwake = Math.max(1, currentHour - 8);

  // Project total based on current rate
  const currentRate = currentCount / hoursAwake;
  const projectedTotal = Math.round(currentRate * wakingHours);

  const onTrack = projectedTotal <= dailyTarget;
  const remainingCigarettes = Math.max(0, dailyTarget - currentCount);

  return {
    onTrack,
    projectedTotal,
    remainingCigarettes,
  };
}

/**
 * Calculates cumulative statistics across multiple daily summaries.
 * Used for the Achievement Panel (B-03) to show total progress.
 *
 * @param summaries - Array of daily summaries
 * @returns Cumulative statistics
 */
export function calculateCumulativeStats(summaries: DailySummary[]): {
  totalMoneySaved: number;
  totalMinutesSaved: number;
  totalResisted: number;
  totalSmoked: number;
  totalCraved: number;
  daysTracking: number;
  averageResistanceRate: number;
} {
  if (summaries.length === 0) {
    return {
      totalMoneySaved: 0,
      totalMinutesSaved: 0,
      totalResisted: 0,
      totalSmoked: 0,
      totalCraved: 0,
      daysTracking: 0,
      averageResistanceRate: 0,
    };
  }

  const totalMoneySaved = summaries.reduce(
    (sum, s) => sum + s.moneySaved,
    0
  );
  const totalMinutesSaved = summaries.reduce(
    (sum, s) => sum + s.minutesSaved,
    0
  );
  const totalResisted = summaries.reduce(
    (sum, s) => sum + s.totalResisted,
    0
  );
  const totalSmoked = summaries.reduce((sum, s) => sum + s.totalSmoked, 0);
  const totalCraved = summaries.reduce((sum, s) => sum + s.totalCraved, 0);

  // Average resistance rate across all days
  const averageResistanceRate =
    summaries.reduce((sum, s) => sum + s.resistanceRate, 0) /
    summaries.length;

  return {
    totalMoneySaved,
    totalMinutesSaved,
    totalResisted,
    totalSmoked,
    totalCraved,
    daysTracking: summaries.length,
    averageResistanceRate: Math.round(averageResistanceRate),
  };
}
