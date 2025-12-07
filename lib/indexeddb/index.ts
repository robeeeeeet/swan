/**
 * IndexedDB Offline-First Data Layer
 *
 * This module provides a unified interface for data operations that work both
 * online and offline. It automatically handles:
 * - Offline storage in IndexedDB
 * - Online sync to Firestore
 * - Conflict resolution
 * - Background sync queue
 *
 * Usage Pattern:
 * 1. Always write to IndexedDB first (offline-first)
 * 2. If online, also write to Firestore
 * 3. If offline, queue the operation for later sync
 * 4. On reconnection, process the sync queue
 */

import { SmokingRecord, DailySummary, UserSettings } from '@/types';
import {
  saveRecord as saveRecordToIDB,
  getRecordsByUser,
  getRecordsByDate,
  updateRecord as updateRecordInIDB,
  deleteRecord as deleteRecordFromIDB,
} from './records';
import {
  saveSummary as saveSummaryToIDB,
  getSummaryByDate,
  updateSummary as updateSummaryInIDB,
  deleteSummary as deleteSummaryFromIDB,
} from './summaries';
import {
  saveSettings as saveSettingsToIDB,
  getSettings,
  updatePartialSettings as updatePartialSettingsInIDB,
  deleteSettings as deleteSettingsFromIDB,
  initializeSettings,
} from './settings';
import {
  addToSyncQueue,
  getPendingSyncItems,
  removeSyncItem,
  incrementRetry,
  deduplicateSyncQueue,
  hasPendingSync,
} from './sync';
import {
  saveRecordToFirestore,
  updateRecordInFirestore,
  deleteRecordFromFirestore,
  saveSummaryToFirestore,
  updateSummaryInFirestore,
  deleteSummaryFromFirestore,
  saveSettingsToFirestore,
  updatePartialSettingsInFirestore,
  deleteSettingsFromFirestore,
  getRecordsFromFirestore,
  getSummariesFromFirestore,
  getSettingsFromFirestore,
} from '../firebase/firestore';
import { STORES } from './db';

/**
 * Checks if the browser is currently online.
 * Note: This is not 100% reliable, but good enough for most cases.
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

// ============================================================================
// RECORDS OPERATIONS
// ============================================================================

/**
 * Saves a smoking record (offline-first with online sync).
 *
 * @param record - The smoking record to save
 * @returns Promise resolving when save is complete
 */
export async function saveRecord(record: SmokingRecord): Promise<void> {
  // Always save to IndexedDB first (offline-first)
  await saveRecordToIDB(record);

  // If online, sync to Firestore
  if (isOnline()) {
    try {
      await saveRecordToFirestore(record);
    } catch (error) {
      // Failed to sync - add to queue for later
      console.error('Failed to sync record to Firestore:', error);
      await addToSyncQueue(STORES.RECORDS, 'create', record.id, record);
    }
  } else {
    // Offline - add to queue
    await addToSyncQueue(STORES.RECORDS, 'create', record.id, record);
  }
}

/**
 * Updates a smoking record (offline-first with online sync).
 *
 * @param record - The updated record
 * @returns Promise resolving when update is complete
 */
export async function updateRecord(record: SmokingRecord): Promise<void> {
  await updateRecordInIDB(record);

  if (isOnline()) {
    try {
      await updateRecordInFirestore(record);
    } catch (error) {
      console.error('Failed to sync record update to Firestore:', error);
      await addToSyncQueue(STORES.RECORDS, 'update', record.id, record);
    }
  } else {
    await addToSyncQueue(STORES.RECORDS, 'update', record.id, record);
  }
}

/**
 * Deletes a smoking record (offline-first with online sync).
 *
 * @param id - The record ID to delete
 * @returns Promise resolving when delete is complete
 */
export async function deleteRecord(id: string): Promise<void> {
  await deleteRecordFromIDB(id);

  if (isOnline()) {
    try {
      await deleteRecordFromFirestore(id);
    } catch (error) {
      console.error('Failed to sync record deletion to Firestore:', error);
      await addToSyncQueue(STORES.RECORDS, 'delete', id);
    }
  } else {
    await addToSyncQueue(STORES.RECORDS, 'delete', id);
  }
}

// ============================================================================
// SUMMARIES OPERATIONS
// ============================================================================

/**
 * Saves a daily summary (offline-first with online sync).
 *
 * @param summary - The daily summary to save
 * @returns Promise resolving when save is complete
 */
export async function saveSummary(summary: DailySummary): Promise<void> {
  await saveSummaryToIDB(summary);

  if (isOnline()) {
    try {
      await saveSummaryToFirestore(summary);
    } catch (error) {
      console.error('Failed to sync summary to Firestore:', error);
      await addToSyncQueue(STORES.SUMMARIES, 'create', summary.id, summary);
    }
  } else {
    await addToSyncQueue(STORES.SUMMARIES, 'create', summary.id, summary);
  }
}

/**
 * Updates a daily summary (offline-first with online sync).
 *
 * @param summary - The updated summary
 * @returns Promise resolving when update is complete
 */
export async function updateSummary(summary: DailySummary): Promise<void> {
  await updateSummaryInIDB(summary);

  if (isOnline()) {
    try {
      await updateSummaryInFirestore(summary);
    } catch (error) {
      console.error('Failed to sync summary update to Firestore:', error);
      await addToSyncQueue(STORES.SUMMARIES, 'update', summary.id, summary);
    }
  } else {
    await addToSyncQueue(STORES.SUMMARIES, 'update', summary.id, summary);
  }
}

/**
 * Deletes a daily summary (offline-first with online sync).
 *
 * @param id - The summary ID to delete
 * @returns Promise resolving when delete is complete
 */
export async function deleteSummary(id: string): Promise<void> {
  await deleteSummaryFromIDB(id);

  if (isOnline()) {
    try {
      await deleteSummaryFromFirestore(id);
    } catch (error) {
      console.error('Failed to sync summary deletion to Firestore:', error);
      await addToSyncQueue(STORES.SUMMARIES, 'delete', id);
    }
  } else {
    await addToSyncQueue(STORES.SUMMARIES, 'delete', id);
  }
}

// ============================================================================
// SETTINGS OPERATIONS
// ============================================================================

/**
 * Saves user settings (offline-first with online sync).
 *
 * @param settings - The user settings to save
 * @returns Promise resolving when save is complete
 */
export async function saveSettings(settings: UserSettings): Promise<void> {
  await saveSettingsToIDB(settings);

  if (isOnline()) {
    try {
      await saveSettingsToFirestore(settings);
    } catch (error) {
      console.error('Failed to sync settings to Firestore:', error);
      await addToSyncQueue(STORES.SETTINGS, 'create', settings.userId, settings);
    }
  } else {
    await addToSyncQueue(STORES.SETTINGS, 'create', settings.userId, settings);
  }
}

/**
 * Updates user settings partially (offline-first with online sync).
 *
 * @param userId - The user ID
 * @param partial - Partial settings to merge
 * @returns Promise resolving when update is complete
 */
export async function updatePartialSettings(
  userId: string,
  partial: Partial<UserSettings>
): Promise<void> {
  await updatePartialSettingsInIDB(userId, partial);

  // Get the full settings for syncing
  const fullSettings = await getSettings(userId);

  if (!fullSettings) {
    throw new Error('Settings not found');
  }

  if (isOnline()) {
    try {
      await updatePartialSettingsInFirestore(userId, partial);
    } catch (error) {
      console.error('Failed to sync settings update to Firestore:', error);
      await addToSyncQueue(STORES.SETTINGS, 'update', userId, fullSettings);
    }
  } else {
    await addToSyncQueue(STORES.SETTINGS, 'update', userId, fullSettings);
  }
}

/**
 * Deletes user settings (offline-first with online sync).
 *
 * @param userId - The user ID
 * @returns Promise resolving when delete is complete
 */
export async function deleteSettings(userId: string): Promise<void> {
  await deleteSettingsFromIDB(userId);

  if (isOnline()) {
    try {
      await deleteSettingsFromFirestore(userId);
    } catch (error) {
      console.error('Failed to sync settings deletion to Firestore:', error);
      await addToSyncQueue(STORES.SETTINGS, 'delete', userId);
    }
  } else {
    await addToSyncQueue(STORES.SETTINGS, 'delete', userId);
  }
}

// ============================================================================
// SYNC OPERATIONS
// ============================================================================

/**
 * Processes the sync queue, syncing all pending operations to Firestore.
 * This should be called when the app comes online or periodically.
 *
 * @returns Promise resolving to sync result statistics
 */
export async function processSyncQueue(): Promise<{
  total: number;
  successful: number;
  failed: number;
}> {
  if (!isOnline()) {
    return { total: 0, successful: 0, failed: 0 };
  }

  // Deduplicate queue first to optimize sync
  await deduplicateSyncQueue();

  const items = await getPendingSyncItems();
  let successful = 0;
  let failed = 0;

  for (const item of items) {
    try {
      switch (item.storeName) {
        case STORES.RECORDS:
          if (item.operation === 'create' || item.operation === 'update') {
            await saveRecordToFirestore(item.data);
          } else if (item.operation === 'delete') {
            await deleteRecordFromFirestore(item.documentId);
          }
          break;

        case STORES.SUMMARIES:
          if (item.operation === 'create' || item.operation === 'update') {
            await saveSummaryToFirestore(item.data);
          } else if (item.operation === 'delete') {
            await deleteSummaryFromFirestore(item.documentId);
          }
          break;

        case STORES.SETTINGS:
          if (item.operation === 'create' || item.operation === 'update') {
            await saveSettingsToFirestore(item.data);
          } else if (item.operation === 'delete') {
            await deleteSettingsFromFirestore(item.documentId);
          }
          break;
      }

      // Successfully synced - remove from queue
      await removeSyncItem(item.id);
      successful++;
    } catch (error) {
      // Failed to sync - increment retry count
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const shouldRetry = await incrementRetry(item.id, errorMessage);

      if (!shouldRetry) {
        console.error(`Max retries exceeded for sync item ${item.id}:`, error);
      }

      failed++;
    }
  }

  return {
    total: items.length,
    successful,
    failed,
  };
}

/**
 * Pulls the latest data from Firestore and updates IndexedDB.
 * This is useful for initial sync or when refreshing data.
 *
 * @param userId - The user ID
 * @param options - Sync options
 * @returns Promise resolving when sync is complete
 */
export async function syncFromFirestore(
  userId: string,
  options: {
    records?: boolean;
    summaries?: boolean;
    settings?: boolean;
  } = { records: true, summaries: true, settings: true }
): Promise<void> {
  if (!isOnline()) {
    throw new Error('Cannot sync from Firestore while offline');
  }

  // Sync records
  if (options.records) {
    const records = await getRecordsFromFirestore(userId);
    for (const record of records) {
      await saveRecordToIDB(record);
    }
  }

  // Sync summaries
  if (options.summaries) {
    const summaries = await getSummariesFromFirestore(userId);
    for (const summary of summaries) {
      await saveSummaryToIDB(summary);
    }
  }

  // Sync settings
  if (options.settings) {
    const settings = await getSettingsFromFirestore(userId);
    if (settings) {
      await saveSettingsToIDB(settings);
    }
  }
}

/**
 * Sets up automatic background sync when the app comes online.
 * This should be called once during app initialization.
 */
export function setupBackgroundSync(): void {
  if (typeof window === 'undefined') {
    return; // Not in browser environment
  }

  window.addEventListener('online', async () => {
    console.log('App came online - processing sync queue...');

    const result = await processSyncQueue();
    console.log(`Sync complete: ${result.successful}/${result.total} successful`);

    if (result.failed > 0) {
      console.warn(`${result.failed} items failed to sync`);
    }
  });
}

// Re-export commonly used read operations
export { getRecordsByUser, getRecordsByDate } from './records';
export { getSummaryByDate } from './summaries';
export { getSettings, initializeSettings } from './settings';
export { hasPendingSync } from './sync';

// Tip ratings operations (local-only, no Firestore sync)
export {
  getAllTipRatings,
  getTipRating,
  addTipRating,
  getTipRatingHistory,
  getAllRatingHistory,
  clearAllTipRatings,
  importTipRatings,
} from './tipRatings';
