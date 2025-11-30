/**
 * IndexedDB Database Configuration and Initialization
 *
 * Swan PWA uses IndexedDB for offline-first data storage.
 * This file defines the database schema and provides initialization logic.
 */

import { SmokingRecord, DailySummary, UserSettings } from '@/types';

// Database configuration
export const DB_NAME = 'SwanDB';
export const DB_VERSION = 1;

// Object store names
export const STORES = {
  RECORDS: 'records',
  SUMMARIES: 'summaries',
  SETTINGS: 'settings',
  SYNC_QUEUE: 'syncQueue',
} as const;

// Sync operation types
export type SyncOperation = 'create' | 'update' | 'delete';

export interface SyncQueueItem {
  id: string; // Unique queue item ID
  storeName: string; // Store name (records, summaries, settings)
  operation: SyncOperation;
  documentId: string; // Firestore document ID
  data?: any; // Data to sync (not needed for delete)
  timestamp: number; // When the operation was queued
  retries: number; // Number of sync attempts
  lastError?: string; // Last error message if sync failed
}

/**
 * Opens the IndexedDB database and ensures schema is up to date.
 * Creates object stores if they don't exist.
 *
 * @returns Promise resolving to IDBDatabase instance
 */
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create records store
      if (!db.objectStoreNames.contains(STORES.RECORDS)) {
        const recordsStore = db.createObjectStore(STORES.RECORDS, { keyPath: 'id' });
        recordsStore.createIndex('userId', 'userId', { unique: false });
        recordsStore.createIndex('timestamp', 'timestamp', { unique: false });
        recordsStore.createIndex('date', 'date', { unique: false });
        recordsStore.createIndex('type', 'type', { unique: false });
      }

      // Create summaries store
      if (!db.objectStoreNames.contains(STORES.SUMMARIES)) {
        const summariesStore = db.createObjectStore(STORES.SUMMARIES, { keyPath: 'id' });
        summariesStore.createIndex('userId', 'userId', { unique: false });
        summariesStore.createIndex('date', 'date', { unique: false });
      }

      // Create settings store
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        const settingsStore = db.createObjectStore(STORES.SETTINGS, { keyPath: 'userId' });
      }

      // Create sync queue store
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncQueueStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
        syncQueueStore.createIndex('timestamp', 'timestamp', { unique: false });
        syncQueueStore.createIndex('storeName', 'storeName', { unique: false });
      }
    };
  });
}

/**
 * Closes the database connection.
 * Should be called when the app is being closed or during cleanup.
 *
 * @param db - The database instance to close
 */
export function closeDB(db: IDBDatabase): void {
  db.close();
}

/**
 * Deletes the entire database.
 * Use with caution - this removes all local data!
 *
 * @returns Promise resolving when database is deleted
 */
export function deleteDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);

    request.onerror = () => {
      reject(new Error('Failed to delete IndexedDB'));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * Generic helper to perform a transaction on an object store.
 * Handles opening/closing connection and error handling.
 *
 * @param storeName - Name of the object store
 * @param mode - Transaction mode ('readonly' or 'readwrite')
 * @param callback - Function to execute with the object store
 * @returns Promise resolving to the callback result
 */
export async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = callback(store);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error(`Transaction failed: ${request.error?.message}`));
      };

      transaction.oncomplete = () => {
        db.close();
      };

      transaction.onerror = () => {
        db.close();
        reject(new Error(`Transaction failed: ${transaction.error?.message}`));
      };
    } catch (error) {
      db.close();
      reject(error);
    }
  });
}

/**
 * Generic helper to perform a cursor-based query on an object store.
 * Useful for filtering, mapping, or iterating over multiple records.
 *
 * @param storeName - Name of the object store
 * @param callback - Function to execute for each cursor result
 * @param indexName - Optional index name to use for the cursor
 * @param query - Optional IDBKeyRange for filtering
 * @returns Promise resolving to array of results
 */
export async function withCursor<T>(
  storeName: string,
  callback: (cursor: IDBCursorWithValue) => T | null,
  indexName?: string,
  query?: IDBKeyRange
): Promise<T[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const source = indexName ? store.index(indexName) : store;
      const request = source.openCursor(query);
      const results: T[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

        if (cursor) {
          const result = callback(cursor);
          if (result !== null) {
            results.push(result);
          }
          cursor.continue();
        } else {
          // No more results
          resolve(results);
        }
      };

      request.onerror = () => {
        reject(new Error(`Cursor query failed: ${request.error?.message}`));
      };

      transaction.oncomplete = () => {
        db.close();
      };

      transaction.onerror = () => {
        db.close();
        reject(new Error(`Transaction failed: ${transaction.error?.message}`));
      };
    } catch (error) {
      db.close();
      reject(error);
    }
  });
}
