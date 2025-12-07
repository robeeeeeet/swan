/**
 * IndexedDB operations for Tip Ratings
 *
 * Manages user ratings (good/bad) for tips to enable personalized recommendations.
 * Ratings are stored both as aggregates (per tip) and as history (individual ratings).
 */

import { TipRating, TipRatingRecord, TipRatingType } from '@/types';
import { openDB, STORES } from './db';

/**
 * Get all tip ratings
 */
export async function getAllTipRatings(): Promise<TipRating[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.TIP_RATINGS, 'readonly');
    const store = transaction.objectStore(STORES.TIP_RATINGS);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get tip ratings: ${request.error?.message}`));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get rating for a specific tip
 */
export async function getTipRating(tipId: number): Promise<TipRating | null> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.TIP_RATINGS, 'readonly');
    const store = transaction.objectStore(STORES.TIP_RATINGS);
    const request = store.get(tipId);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get tip rating: ${request.error?.message}`));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Add a rating for a tip
 * Updates both the aggregate and records the individual rating in history
 */
export async function addTipRating(
  tipId: number,
  rating: TipRatingType
): Promise<TipRating> {
  const db = await openDB();
  const timestamp = Date.now();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [STORES.TIP_RATINGS, STORES.TIP_RATING_HISTORY],
      'readwrite'
    );

    const ratingsStore = transaction.objectStore(STORES.TIP_RATINGS);
    const historyStore = transaction.objectStore(STORES.TIP_RATING_HISTORY);

    // First, get existing rating
    const getRequest = ratingsStore.get(tipId);

    getRequest.onsuccess = () => {
      const existing: TipRating | undefined = getRequest.result;

      // Create or update aggregate rating
      const newRating: TipRating = {
        tipId,
        goodCount: (existing?.goodCount || 0) + (rating === 'good' ? 1 : 0),
        badCount: (existing?.badCount || 0) + (rating === 'bad' ? 1 : 0),
        lastRatedAt: timestamp,
      };

      // Save aggregate
      const putRequest = ratingsStore.put(newRating);

      putRequest.onerror = () => {
        reject(new Error(`Failed to save tip rating: ${putRequest.error?.message}`));
      };

      // Save to history
      const historyRecord: TipRatingRecord = {
        id: `${tipId}_${timestamp}`,
        tipId,
        rating,
        timestamp,
      };

      const historyRequest = historyStore.add(historyRecord);

      historyRequest.onerror = () => {
        // History save failure is not critical
        console.warn('Failed to save rating history:', historyRequest.error);
      };

      putRequest.onsuccess = () => {
        resolve(newRating);
      };
    };

    getRequest.onerror = () => {
      reject(new Error(`Failed to get existing rating: ${getRequest.error?.message}`));
    };

    transaction.oncomplete = () => {
      db.close();
    };

    transaction.onerror = () => {
      db.close();
      reject(new Error(`Transaction failed: ${transaction.error?.message}`));
    };
  });
}

/**
 * Get rating history for a specific tip
 */
export async function getTipRatingHistory(tipId: number): Promise<TipRatingRecord[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.TIP_RATING_HISTORY, 'readonly');
    const store = transaction.objectStore(STORES.TIP_RATING_HISTORY);
    const index = store.index('tipId');
    const request = index.getAll(tipId);

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get rating history: ${request.error?.message}`));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get all rating history (for export/analysis)
 */
export async function getAllRatingHistory(): Promise<TipRatingRecord[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.TIP_RATING_HISTORY, 'readonly');
    const store = transaction.objectStore(STORES.TIP_RATING_HISTORY);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get all rating history: ${request.error?.message}`));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Clear all tip ratings (for testing/reset)
 */
export async function clearAllTipRatings(): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [STORES.TIP_RATINGS, STORES.TIP_RATING_HISTORY],
      'readwrite'
    );

    const ratingsStore = transaction.objectStore(STORES.TIP_RATINGS);
    const historyStore = transaction.objectStore(STORES.TIP_RATING_HISTORY);

    ratingsStore.clear();
    historyStore.clear();

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(new Error(`Failed to clear ratings: ${transaction.error?.message}`));
    };
  });
}

/**
 * Import ratings (for testing/migration)
 */
export async function importTipRatings(ratings: TipRating[]): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.TIP_RATINGS, 'readwrite');
    const store = transaction.objectStore(STORES.TIP_RATINGS);

    for (const rating of ratings) {
      store.put(rating);
    }

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(new Error(`Failed to import ratings: ${transaction.error?.message}`));
    };
  });
}
