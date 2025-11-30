/**
 * IndexedDB Summaries Store Operations
 *
 * Provides CRUD operations for daily summaries stored in IndexedDB.
 * Summaries aggregate daily statistics for efficient dashboard rendering.
 */

import { DailySummary } from '@/types';
import { STORES, withStore, withCursor } from './db';

/**
 * Saves a daily summary to IndexedDB.
 * Summaries are typically generated from records and cached for performance.
 *
 * @param summary - The daily summary to save
 * @returns Promise resolving when save is complete
 */
export async function saveSummary(summary: DailySummary): Promise<void> {
  await withStore(STORES.SUMMARIES, 'readwrite', (store) => store.put(summary));
}

/**
 * Saves multiple summaries in a single transaction.
 * Useful for initial sync or bulk updates.
 *
 * @param summaries - Array of daily summaries to save
 * @returns Promise resolving when all saves are complete
 */
export async function saveSummaries(summaries: DailySummary[]): Promise<void> {
  const db = await (await import('./db')).openDB();

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(STORES.SUMMARIES, 'readwrite');
      const store = transaction.objectStore(STORES.SUMMARIES);

      for (const summary of summaries) {
        store.put(summary);
      }

      transaction.oncomplete = () => {
        db.close();
        resolve();
      };

      transaction.onerror = () => {
        db.close();
        reject(new Error(`Batch save failed: ${transaction.error?.message}`));
      };
    } catch (error) {
      db.close();
      reject(error);
    }
  });
}

/**
 * Retrieves a summary by ID.
 *
 * @param id - The summary ID (format: userId_YYYY-MM-DD)
 * @returns Promise resolving to the summary, or undefined if not found
 */
export async function getSummary(id: string): Promise<DailySummary | undefined> {
  return await withStore(STORES.SUMMARIES, 'readonly', (store) => store.get(id));
}

/**
 * Retrieves a summary for a specific user and date.
 * This is the most common query pattern.
 *
 * @param userId - The user ID
 * @param date - The date in YYYY-MM-DD format
 * @returns Promise resolving to the summary, or undefined if not found
 */
export async function getSummaryByDate(
  userId: string,
  date: string
): Promise<DailySummary | undefined> {
  const id = `${userId}_${date}`;
  return await getSummary(id);
}

/**
 * Retrieves all summaries for a specific user.
 * Uses the userId index for efficient querying.
 *
 * @param userId - The user ID
 * @returns Promise resolving to array of summaries
 */
export async function getSummariesByUser(userId: string): Promise<DailySummary[]> {
  return await withCursor(
    STORES.SUMMARIES,
    (cursor) => cursor.value as DailySummary,
    'userId',
    IDBKeyRange.only(userId)
  );
}

/**
 * Retrieves summaries for a specific user within a date range.
 * Useful for weekly/monthly dashboards.
 *
 * @param userId - The user ID
 * @param startDate - Start date in YYYY-MM-DD format (inclusive)
 * @param endDate - End date in YYYY-MM-DD format (inclusive)
 * @returns Promise resolving to array of summaries, sorted by date
 */
export async function getSummariesByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailySummary[]> {
  const allSummaries = await withCursor(
    STORES.SUMMARIES,
    (cursor) => cursor.value as DailySummary,
    'date',
    IDBKeyRange.bound(startDate, endDate)
  );

  // Filter by userId and sort by date
  return allSummaries
    .filter((summary) => summary.userId === userId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Retrieves the most recent N summaries for a user.
 * Useful for "recent activity" displays.
 *
 * @param userId - The user ID
 * @param limit - Maximum number of summaries to return
 * @returns Promise resolving to array of summaries, sorted by date descending
 */
export async function getRecentSummaries(
  userId: string,
  limit: number
): Promise<DailySummary[]> {
  const allSummaries = await getSummariesByUser(userId);

  // Sort by date descending and limit
  return allSummaries
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

/**
 * Updates an existing summary.
 * Typically called when records are added/updated for a day.
 *
 * @param summary - The updated summary
 * @returns Promise resolving when update is complete
 */
export async function updateSummary(summary: DailySummary): Promise<void> {
  await withStore(STORES.SUMMARIES, 'readwrite', (store) => store.put(summary));
}

/**
 * Deletes a summary by ID.
 *
 * @param id - The summary ID to delete
 * @returns Promise resolving when delete is complete
 */
export async function deleteSummary(id: string): Promise<void> {
  await withStore(STORES.SUMMARIES, 'readwrite', (store) => store.delete(id));
}

/**
 * Deletes all summaries for a specific user.
 * Use with caution! Typically only used during account deletion.
 *
 * @param userId - The user ID
 * @returns Promise resolving when all deletes are complete
 */
export async function deleteAllSummaries(userId: string): Promise<void> {
  const summaries = await getSummariesByUser(userId);
  const db = await (await import('./db')).openDB();

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(STORES.SUMMARIES, 'readwrite');
      const store = transaction.objectStore(STORES.SUMMARIES);

      for (const summary of summaries) {
        store.delete(summary.id);
      }

      transaction.oncomplete = () => {
        db.close();
        resolve();
      };

      transaction.onerror = () => {
        db.close();
        reject(new Error(`Batch delete failed: ${transaction.error?.message}`));
      };
    } catch (error) {
      db.close();
      reject(error);
    }
  });
}

/**
 * Calculates aggregate statistics across multiple summaries.
 * Useful for weekly/monthly totals.
 *
 * @param summaries - Array of summaries to aggregate
 * @returns Aggregated statistics
 */
export function aggregateSummaries(summaries: DailySummary[]): {
  totalSmoked: number;
  totalCraved: number;
  totalResisted: number;
  totalMoneySaved: number;
  totalMinutesSaved: number;
  averagePerDay: number;
  bestDay: DailySummary | null;
  worstDay: DailySummary | null;
} {
  if (summaries.length === 0) {
    return {
      totalSmoked: 0,
      totalCraved: 0,
      totalResisted: 0,
      totalMoneySaved: 0,
      totalMinutesSaved: 0,
      averagePerDay: 0,
      bestDay: null,
      worstDay: null,
    };
  }

  const totals = summaries.reduce(
    (acc, summary) => ({
      smoked: acc.smoked + summary.totalSmoked,
      craved: acc.craved + summary.totalCraved,
      resisted: acc.resisted + summary.totalResisted,
      moneySaved: acc.moneySaved + summary.moneySaved,
      minutesSaved: acc.minutesSaved + summary.minutesSaved,
    }),
    { smoked: 0, craved: 0, resisted: 0, moneySaved: 0, minutesSaved: 0 }
  );

  // Find best day (lowest smoked count)
  const bestDay = summaries.reduce((best, current) =>
    current.totalSmoked < best.totalSmoked ? current : best
  );

  // Find worst day (highest smoked count)
  const worstDay = summaries.reduce((worst, current) =>
    current.totalSmoked > worst.totalSmoked ? current : worst
  );

  return {
    totalSmoked: totals.smoked,
    totalCraved: totals.craved,
    totalResisted: totals.resisted,
    totalMoneySaved: totals.moneySaved,
    totalMinutesSaved: totals.minutesSaved,
    averagePerDay: totals.smoked / summaries.length,
    bestDay,
    worstDay,
  };
}
