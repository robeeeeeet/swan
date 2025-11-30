/**
 * useRecords Hook
 *
 * Provides a unified interface for record operations that integrates:
 * - IndexedDB for offline-first storage
 * - Firestore for cloud sync
 * - Zustand store for UI state management
 * - Automatic summary updates
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { SmokingRecord, RecordType, SituationTag } from '@/types';
import { useUserStore } from '@/store/userStore';
import { useRecordsStore } from '@/store/recordsStore';
import { useSettingsStore } from '@/store/settingsStore';
import {
  saveRecord,
  updateRecord,
  deleteRecord,
  getRecordsByDate,
  setupBackgroundSync,
  isOnline,
  hasPendingSync,
  saveSummary,
} from '@/lib/indexeddb';
import { calculateDailySummary } from '@/lib/utils/summary';
import { getLocalDateString } from '@/lib/utils/date';

export function useRecords() {
  const user = useUserStore((state) => state.user);
  const {
    todayRecords,
    addRecord: addRecordToStore,
    setTodayRecords,
    getTodayCount,
    isLoading,
    setLoading,
    isSyncing,
    setSyncing,
  } = useRecordsStore();

  const [syncPending, setSyncPending] = useState(false);

  // Get today's date in YYYY-MM-DD format (local timezone)
  const getTodayDate = useCallback(() => {
    return getLocalDateString();
  }, []);

  // Load today's records on mount
  useEffect(() => {
    if (!user) return;

    const loadTodayRecords = async () => {
      setLoading(true);
      try {
        const today = getTodayDate();
        const records = await getRecordsByDate(user.uid, today);
        setTodayRecords(records);
      } catch (error) {
        console.error('Failed to load today records:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTodayRecords();
  }, [user, setLoading, setTodayRecords, getTodayDate]);

  // Check for pending sync on mount and periodically
  useEffect(() => {
    const checkSync = async () => {
      const pending = await hasPendingSync();
      setSyncPending(pending);
    };

    checkSync();

    // Check every 30 seconds
    const interval = setInterval(checkSync, 30000);

    return () => clearInterval(interval);
  }, []);

  // Setup background sync on mount
  useEffect(() => {
    setupBackgroundSync();
  }, []);

  /**
   * Creates a new smoking record.
   *
   * @param type - The record type (smoked, craved, resisted)
   * @param tags - Optional situation tags
   * @returns Promise resolving to the created record
   */
  const createRecord = useCallback(
    async (type: RecordType, tags: SituationTag[] = []): Promise<SmokingRecord> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const now = Date.now();
      const today = getTodayDate();

      const record: SmokingRecord = {
        id: `${user.uid}_${now}`,
        userId: user.uid,
        type,
        timestamp: now,
        date: today,
        tags,
      };

      try {
        // Save to IndexedDB (and sync to Firestore if online)
        await saveRecord(record);

        // Update Zustand store for immediate UI update
        addRecordToStore(record);

        // Update summary
        await updateSummaryForToday();

        return record;
      } catch (error) {
        console.error('Failed to create record:', error);
        throw error;
      }
    },
    [user, getTodayDate, addRecordToStore]
  );

  /**
   * Updates an existing record.
   *
   * @param recordId - The record ID to update
   * @param updates - Fields to update
   * @returns Promise resolving when update is complete
   */
  const updateRecordById = useCallback(
    async (recordId: string, updates: Partial<SmokingRecord>): Promise<void> => {
      const existingRecord = todayRecords.find((r) => r.id === recordId);

      if (!existingRecord) {
        throw new Error('Record not found');
      }

      const updatedRecord: SmokingRecord = {
        ...existingRecord,
        ...updates,
        id: existingRecord.id, // Ensure ID doesn't change
        userId: existingRecord.userId, // Ensure userId doesn't change
      };

      try {
        await updateRecord(updatedRecord);

        // Update Zustand store
        setTodayRecords(
          todayRecords.map((r) => (r.id === recordId ? updatedRecord : r))
        );

        // Update summary
        await updateSummaryForToday();
      } catch (error) {
        console.error('Failed to update record:', error);
        throw error;
      }
    },
    [todayRecords, setTodayRecords]
  );

  /**
   * Deletes a record.
   *
   * @param recordId - The record ID to delete
   * @returns Promise resolving when delete is complete
   */
  const deleteRecordById = useCallback(
    async (recordId: string): Promise<void> => {
      try {
        await deleteRecord(recordId);

        // Update Zustand store
        setTodayRecords(todayRecords.filter((r) => r.id !== recordId));

        // Update summary
        await updateSummaryForToday();
      } catch (error) {
        console.error('Failed to delete record:', error);
        throw error;
      }
    },
    [todayRecords, setTodayRecords]
  );

  /**
   * Updates today's summary based on current records.
   * Called automatically after record changes.
   */
  const updateSummaryForToday = useCallback(async () => {
    if (!user) return;

    const today = getTodayDate();
    const { settings } = useSettingsStore.getState();

    try {
      // Get all records for today
      const records = await getRecordsByDate(user.uid, today);

      // Calculate summary from records
      const summary = calculateDailySummary(
        user.uid,
        today,
        records,
        settings?.app.cigarettePrice ?? 600,
        settings?.app.cigarettesPerPack ?? 20,
        settings?.app.minutesPerCigarette ?? 7,
        settings?.goals.dailyTarget ?? 20
      );

      // Save summary to IndexedDB (and sync to Firestore if online)
      await saveSummary(summary);

      console.log('Summary updated for', today, summary);
    } catch (error) {
      console.error('Failed to update summary:', error);
    }
  }, [user, getTodayDate]);

  /**
   * Reloads today's records from IndexedDB.
   * Useful for refreshing data after sync.
   */
  const refreshTodayRecords = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const today = getTodayDate();
      const records = await getRecordsByDate(user.uid, today);
      setTodayRecords(records);
    } catch (error) {
      console.error('Failed to refresh today records:', error);
    } finally {
      setLoading(false);
    }
  }, [user, setLoading, setTodayRecords, getTodayDate]);

  return {
    // State
    todayRecords,
    isLoading,
    isSyncing,
    syncPending,
    isOnline: isOnline(),

    // Record operations
    createRecord,
    updateRecord: updateRecordById,
    deleteRecord: deleteRecordById,
    refreshRecords: refreshTodayRecords,

    // Computed values
    getTodayCount,
  };
}
