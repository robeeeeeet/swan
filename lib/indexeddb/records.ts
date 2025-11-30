/**
 * IndexedDB Records Store Operations
 *
 * Provides CRUD operations for smoking records stored in IndexedDB.
 * Supports offline-first data access with later sync to Firestore.
 */

import { SmokingRecord } from '@/types';
import { STORES, withStore, withCursor } from './db';

/**
 * Saves a smoking record to IndexedDB.
 * This is the offline-first write operation.
 *
 * @param record - The smoking record to save
 * @returns Promise resolving when save is complete
 */
export async function saveRecord(record: SmokingRecord): Promise<void> {
  await withStore(STORES.RECORDS, 'readwrite', (store) => store.put(record));
}

/**
 * Saves multiple smoking records to IndexedDB in a single transaction.
 * More efficient than calling saveRecord multiple times.
 *
 * @param records - Array of smoking records to save
 * @returns Promise resolving when all saves are complete
 */
export async function saveRecords(records: SmokingRecord[]): Promise<void> {
  const db = await (await import('./db')).openDB();

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(STORES.RECORDS, 'readwrite');
      const store = transaction.objectStore(STORES.RECORDS);

      for (const record of records) {
        store.put(record);
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
 * Retrieves a single record by ID.
 *
 * @param id - The record ID
 * @returns Promise resolving to the record, or undefined if not found
 */
export async function getRecord(id: string): Promise<SmokingRecord | undefined> {
  return await withStore(STORES.RECORDS, 'readonly', (store) => store.get(id));
}

/**
 * Retrieves all records for a specific user.
 * Uses the userId index for efficient querying.
 *
 * @param userId - The user ID
 * @returns Promise resolving to array of records
 */
export async function getRecordsByUser(userId: string): Promise<SmokingRecord[]> {
  return await withCursor(
    STORES.RECORDS,
    (cursor) => cursor.value as SmokingRecord,
    'userId',
    IDBKeyRange.only(userId)
  );
}

/**
 * Retrieves all records for a specific user on a specific date.
 * Uses the date index for efficient querying.
 *
 * @param userId - The user ID
 * @param date - The date in YYYY-MM-DD format
 * @returns Promise resolving to array of records
 */
export async function getRecordsByDate(
  userId: string,
  date: string
): Promise<SmokingRecord[]> {
  const allRecords = await withCursor(
    STORES.RECORDS,
    (cursor) => cursor.value as SmokingRecord,
    'date',
    IDBKeyRange.only(date)
  );

  // Filter by userId (since date index is not compound)
  return allRecords.filter((record) => record.userId === userId);
}

/**
 * Retrieves all records for a specific user within a date range.
 * Useful for weekly/monthly views.
 *
 * @param userId - The user ID
 * @param startDate - Start date in YYYY-MM-DD format (inclusive)
 * @param endDate - End date in YYYY-MM-DD format (inclusive)
 * @returns Promise resolving to array of records
 */
export async function getRecordsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<SmokingRecord[]> {
  const allRecords = await withCursor(
    STORES.RECORDS,
    (cursor) => cursor.value as SmokingRecord,
    'date',
    IDBKeyRange.bound(startDate, endDate)
  );

  // Filter by userId
  return allRecords.filter((record) => record.userId === userId);
}

/**
 * Retrieves records by type (smoked, craved, resisted).
 * Useful for analytics and statistics.
 *
 * @param userId - The user ID
 * @param type - The record type
 * @returns Promise resolving to array of records
 */
export async function getRecordsByType(
  userId: string,
  type: SmokingRecord['type']
): Promise<SmokingRecord[]> {
  const allRecords = await withCursor(
    STORES.RECORDS,
    (cursor) => cursor.value as SmokingRecord,
    'type',
    IDBKeyRange.only(type)
  );

  // Filter by userId
  return allRecords.filter((record) => record.userId === userId);
}

/**
 * Updates an existing record.
 * Note: This triggers a sync queue item if online sync is enabled.
 *
 * @param record - The updated record (must have existing ID)
 * @returns Promise resolving when update is complete
 */
export async function updateRecord(record: SmokingRecord): Promise<void> {
  await withStore(STORES.RECORDS, 'readwrite', (store) => store.put(record));
}

/**
 * Deletes a record by ID.
 * Note: This triggers a sync queue item if online sync is enabled.
 *
 * @param id - The record ID to delete
 * @returns Promise resolving when delete is complete
 */
export async function deleteRecord(id: string): Promise<void> {
  await withStore(STORES.RECORDS, 'readwrite', (store) => store.delete(id));
}

/**
 * Deletes all records for a specific user.
 * Use with caution! This is typically only used during account deletion.
 *
 * @param userId - The user ID
 * @returns Promise resolving when all deletes are complete
 */
export async function deleteAllRecords(userId: string): Promise<void> {
  const records = await getRecordsByUser(userId);
  const db = await (await import('./db')).openDB();

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(STORES.RECORDS, 'readwrite');
      const store = transaction.objectStore(STORES.RECORDS);

      for (const record of records) {
        store.delete(record.id);
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
 * Counts total records for a user.
 * Useful for displaying stats without loading all records.
 *
 * @param userId - The user ID
 * @returns Promise resolving to count
 */
export async function countRecords(userId: string): Promise<number> {
  const records = await getRecordsByUser(userId);
  return records.length;
}

/**
 * Gets the most recent record for a user.
 * Useful for "last activity" features.
 *
 * @param userId - The user ID
 * @returns Promise resolving to the most recent record, or undefined
 */
export async function getLatestRecord(
  userId: string
): Promise<SmokingRecord | undefined> {
  const records = await getRecordsByUser(userId);

  if (records.length === 0) {
    return undefined;
  }

  // Sort by timestamp descending
  records.sort((a, b) => b.timestamp - a.timestamp);

  return records[0];
}
