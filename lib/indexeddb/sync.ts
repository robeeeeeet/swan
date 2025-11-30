/**
 * IndexedDB Sync Queue Operations
 *
 * Manages the sync queue for offline operations.
 * When offline, CRUD operations are queued and synced to Firestore when online.
 */

import { STORES, withStore, withCursor, SyncQueueItem, SyncOperation } from './db';

const MAX_RETRIES = 3;

/**
 * Adds an operation to the sync queue.
 * This is called whenever a CRUD operation happens while offline.
 *
 * @param storeName - The store name (records, summaries, settings)
 * @param operation - The operation type (create, update, delete)
 * @param documentId - The Firestore document ID
 * @param data - The data to sync (not needed for delete)
 * @returns Promise resolving to the queue item ID
 */
export async function addToSyncQueue(
  storeName: string,
  operation: SyncOperation,
  documentId: string,
  data?: any
): Promise<string> {
  const queueItem: SyncQueueItem = {
    id: `${storeName}_${operation}_${documentId}_${Date.now()}`,
    storeName,
    operation,
    documentId,
    data,
    timestamp: Date.now(),
    retries: 0,
  };

  await withStore(STORES.SYNC_QUEUE, 'readwrite', (store) => store.put(queueItem));

  return queueItem.id;
}

/**
 * Retrieves all pending sync queue items.
 * Items are sorted by timestamp (oldest first) for FIFO processing.
 *
 * @returns Promise resolving to array of queue items
 */
export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  const items = await withCursor(
    STORES.SYNC_QUEUE,
    (cursor) => cursor.value as SyncQueueItem
  );

  // Sort by timestamp ascending (oldest first)
  return items.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Retrieves sync queue items for a specific store.
 * Useful for selective syncing.
 *
 * @param storeName - The store name to filter by
 * @returns Promise resolving to array of queue items
 */
export async function getSyncItemsByStore(
  storeName: string
): Promise<SyncQueueItem[]> {
  return await withCursor(
    STORES.SYNC_QUEUE,
    (cursor) => cursor.value as SyncQueueItem,
    'storeName',
    IDBKeyRange.only(storeName)
  );
}

/**
 * Retrieves a single sync queue item by ID.
 *
 * @param id - The queue item ID
 * @returns Promise resolving to the queue item, or undefined if not found
 */
export async function getSyncItem(id: string): Promise<SyncQueueItem | undefined> {
  return await withStore(STORES.SYNC_QUEUE, 'readonly', (store) => store.get(id));
}

/**
 * Updates a sync queue item.
 * Used to track retries and errors.
 *
 * @param item - The updated queue item
 * @returns Promise resolving when update is complete
 */
export async function updateSyncItem(item: SyncQueueItem): Promise<void> {
  await withStore(STORES.SYNC_QUEUE, 'readwrite', (store) => store.put(item));
}

/**
 * Removes a sync queue item after successful sync.
 *
 * @param id - The queue item ID to remove
 * @returns Promise resolving when delete is complete
 */
export async function removeSyncItem(id: string): Promise<void> {
  await withStore(STORES.SYNC_QUEUE, 'readwrite', (store) => store.delete(id));
}

/**
 * Removes multiple sync queue items in a batch.
 * More efficient than calling removeSyncItem multiple times.
 *
 * @param ids - Array of queue item IDs to remove
 * @returns Promise resolving when all deletes are complete
 */
export async function removeSyncItems(ids: string[]): Promise<void> {
  const db = await (await import('./db')).openDB();

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);

      for (const id of ids) {
        store.delete(id);
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
 * Increments the retry count for a sync item and records the error.
 * Returns true if the item should be retried, false if max retries exceeded.
 *
 * @param id - The queue item ID
 * @param error - The error message
 * @returns Promise resolving to true if should retry, false if max retries exceeded
 */
export async function incrementRetry(id: string, error: string): Promise<boolean> {
  const item = await getSyncItem(id);

  if (!item) {
    return false;
  }

  item.retries += 1;
  item.lastError = error;

  if (item.retries >= MAX_RETRIES) {
    // Max retries exceeded - keep in queue but mark as failed
    await updateSyncItem(item);
    return false;
  }

  await updateSyncItem(item);
  return true;
}

/**
 * Gets all failed sync items (those that exceeded max retries).
 * These items need manual intervention or should be reported to the user.
 *
 * @returns Promise resolving to array of failed queue items
 */
export async function getFailedSyncItems(): Promise<SyncQueueItem[]> {
  const allItems = await getPendingSyncItems();
  return allItems.filter((item) => item.retries >= MAX_RETRIES);
}

/**
 * Clears all sync queue items.
 * Use with caution! This discards all pending offline operations.
 *
 * @returns Promise resolving when queue is cleared
 */
export async function clearSyncQueue(): Promise<void> {
  const db = await (await import('./db')).openDB();

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Clear failed: ${request.error?.message}`));
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
 * Clears failed sync items from the queue.
 * Useful for cleaning up after manual intervention.
 *
 * @returns Promise resolving to number of items cleared
 */
export async function clearFailedSyncItems(): Promise<number> {
  const failedItems = await getFailedSyncItems();
  const ids = failedItems.map((item) => item.id);

  if (ids.length > 0) {
    await removeSyncItems(ids);
  }

  return ids.length;
}

/**
 * Gets the count of pending sync items.
 * Useful for displaying sync status to the user.
 *
 * @returns Promise resolving to count of pending items
 */
export async function getPendingSyncCount(): Promise<number> {
  const items = await getPendingSyncItems();
  return items.length;
}

/**
 * Checks if there are any pending sync operations.
 * Useful for determining if sync is needed.
 *
 * @returns Promise resolving to true if there are pending items
 */
export async function hasPendingSync(): Promise<boolean> {
  const count = await getPendingSyncCount();
  return count > 0;
}

/**
 * Deduplicates sync queue items.
 * If multiple operations exist for the same document, keeps only the latest.
 * This is useful to optimize sync after extended offline periods.
 *
 * @returns Promise resolving to number of items removed
 */
export async function deduplicateSyncQueue(): Promise<number> {
  const allItems = await getPendingSyncItems();

  // Group by storeName + documentId
  const groups = new Map<string, SyncQueueItem[]>();

  for (const item of allItems) {
    const key = `${item.storeName}_${item.documentId}`;
    const group = groups.get(key) || [];
    group.push(item);
    groups.set(key, group);
  }

  // For each group, keep only the latest operation
  const itemsToRemove: string[] = [];

  for (const group of groups.values()) {
    if (group.length > 1) {
      // Sort by timestamp descending
      group.sort((a, b) => b.timestamp - a.timestamp);

      // Keep the first (newest), remove the rest
      for (let i = 1; i < group.length; i++) {
        itemsToRemove.push(group[i].id);
      }
    }
  }

  if (itemsToRemove.length > 0) {
    await removeSyncItems(itemsToRemove);
  }

  return itemsToRemove.length;
}
