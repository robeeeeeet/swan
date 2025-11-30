/**
 * Firestore CRUD Operations
 *
 * Provides cloud-based data persistence using Firebase Firestore.
 * Integrates with IndexedDB for offline-first architecture.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';
import { SmokingRecord, DailySummary, UserSettings } from '@/types';

// Collection names
const COLLECTIONS = {
  RECORDS: 'records',
  SUMMARIES: 'summaries',
  SETTINGS: 'settings',
} as const;

/**
 * Converts Firestore timestamp to JavaScript timestamp (milliseconds)
 */
function convertTimestamp(timestamp: any): number {
  if (timestamp instanceof Timestamp) {
    return timestamp.toMillis();
  }
  return timestamp;
}

// ============================================================================
// RECORDS OPERATIONS
// ============================================================================

/**
 * Saves a smoking record to Firestore.
 *
 * @param record - The smoking record to save
 * @returns Promise resolving when save is complete
 */
export async function saveRecordToFirestore(record: SmokingRecord): Promise<void> {
  const recordRef = doc(db, COLLECTIONS.RECORDS, record.id);
  await setDoc(recordRef, record);
}

/**
 * Retrieves a single record from Firestore by ID.
 *
 * @param id - The record ID
 * @returns Promise resolving to the record, or null if not found
 */
export async function getRecordFromFirestore(
  id: string
): Promise<SmokingRecord | null> {
  const recordRef = doc(db, COLLECTIONS.RECORDS, id);
  const snapshot = await getDoc(recordRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return {
    ...data,
    timestamp: convertTimestamp(data.timestamp),
  } as SmokingRecord;
}

/**
 * Retrieves all records for a specific user from Firestore.
 *
 * @param userId - The user ID
 * @param limitCount - Optional limit on number of records
 * @returns Promise resolving to array of records
 */
export async function getRecordsFromFirestore(
  userId: string,
  limitCount?: number
): Promise<SmokingRecord[]> {
  const constraints: QueryConstraint[] = [
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
  ];

  if (limitCount) {
    constraints.push(limit(limitCount));
  }

  const q = query(collection(db, COLLECTIONS.RECORDS), ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      timestamp: convertTimestamp(data.timestamp),
    } as SmokingRecord;
  });
}

/**
 * Retrieves records for a specific user on a specific date.
 *
 * @param userId - The user ID
 * @param date - The date in YYYY-MM-DD format
 * @returns Promise resolving to array of records
 */
export async function getRecordsByDateFromFirestore(
  userId: string,
  date: string
): Promise<SmokingRecord[]> {
  const q = query(
    collection(db, COLLECTIONS.RECORDS),
    where('userId', '==', userId),
    where('date', '==', date),
    orderBy('timestamp', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      timestamp: convertTimestamp(data.timestamp),
    } as SmokingRecord;
  });
}

/**
 * Updates a record in Firestore.
 *
 * @param record - The updated record
 * @returns Promise resolving when update is complete
 */
export async function updateRecordInFirestore(record: SmokingRecord): Promise<void> {
  const recordRef = doc(db, COLLECTIONS.RECORDS, record.id);
  await updateDoc(recordRef, { ...record });
}

/**
 * Deletes a record from Firestore.
 *
 * @param id - The record ID to delete
 * @returns Promise resolving when delete is complete
 */
export async function deleteRecordFromFirestore(id: string): Promise<void> {
  const recordRef = doc(db, COLLECTIONS.RECORDS, id);
  await deleteDoc(recordRef);
}

// ============================================================================
// SUMMARIES OPERATIONS
// ============================================================================

/**
 * Saves a daily summary to Firestore.
 *
 * @param summary - The daily summary to save
 * @returns Promise resolving when save is complete
 */
export async function saveSummaryToFirestore(summary: DailySummary): Promise<void> {
  const summaryRef = doc(db, COLLECTIONS.SUMMARIES, summary.id);
  await setDoc(summaryRef, summary);
}

/**
 * Retrieves a summary from Firestore by ID.
 *
 * @param id - The summary ID (format: userId_YYYY-MM-DD)
 * @returns Promise resolving to the summary, or null if not found
 */
export async function getSummaryFromFirestore(
  id: string
): Promise<DailySummary | null> {
  const summaryRef = doc(db, COLLECTIONS.SUMMARIES, id);
  const snapshot = await getDoc(summaryRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as DailySummary;
}

/**
 * Retrieves a summary for a specific user and date.
 *
 * @param userId - The user ID
 * @param date - The date in YYYY-MM-DD format
 * @returns Promise resolving to the summary, or null if not found
 */
export async function getSummaryByDateFromFirestore(
  userId: string,
  date: string
): Promise<DailySummary | null> {
  const id = `${userId}_${date}`;
  return await getSummaryFromFirestore(id);
}

/**
 * Retrieves all summaries for a specific user from Firestore.
 *
 * @param userId - The user ID
 * @param limitCount - Optional limit on number of summaries
 * @returns Promise resolving to array of summaries
 */
export async function getSummariesFromFirestore(
  userId: string,
  limitCount?: number
): Promise<DailySummary[]> {
  const constraints: QueryConstraint[] = [
    where('userId', '==', userId),
    orderBy('date', 'desc'),
  ];

  if (limitCount) {
    constraints.push(limit(limitCount));
  }

  const q = query(collection(db, COLLECTIONS.SUMMARIES), ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => doc.data() as DailySummary);
}

/**
 * Updates a summary in Firestore.
 *
 * @param summary - The updated summary
 * @returns Promise resolving when update is complete
 */
export async function updateSummaryInFirestore(summary: DailySummary): Promise<void> {
  const summaryRef = doc(db, COLLECTIONS.SUMMARIES, summary.id);
  await updateDoc(summaryRef, { ...summary });
}

/**
 * Deletes a summary from Firestore.
 *
 * @param id - The summary ID to delete
 * @returns Promise resolving when delete is complete
 */
export async function deleteSummaryFromFirestore(id: string): Promise<void> {
  const summaryRef = doc(db, COLLECTIONS.SUMMARIES, id);
  await deleteDoc(summaryRef);
}

// ============================================================================
// SETTINGS OPERATIONS
// ============================================================================

/**
 * Saves user settings to Firestore.
 *
 * @param settings - The user settings to save
 * @returns Promise resolving when save is complete
 */
export async function saveSettingsToFirestore(settings: UserSettings): Promise<void> {
  const settingsRef = doc(db, COLLECTIONS.SETTINGS, settings.userId);
  await setDoc(settingsRef, settings);
}

/**
 * Retrieves user settings from Firestore.
 *
 * @param userId - The user ID
 * @returns Promise resolving to the settings, or null if not found
 */
export async function getSettingsFromFirestore(
  userId: string
): Promise<UserSettings | null> {
  const settingsRef = doc(db, COLLECTIONS.SETTINGS, userId);
  const snapshot = await getDoc(settingsRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as UserSettings;
}

/**
 * Updates user settings in Firestore.
 *
 * @param settings - The updated settings
 * @returns Promise resolving when update is complete
 */
export async function updateSettingsInFirestore(
  settings: UserSettings
): Promise<void> {
  const settingsRef = doc(db, COLLECTIONS.SETTINGS, settings.userId);
  await updateDoc(settingsRef, { ...settings });
}

/**
 * Partially updates user settings in Firestore.
 * Only the provided fields will be updated.
 *
 * @param userId - The user ID
 * @param partial - Partial settings to merge
 * @returns Promise resolving when update is complete
 */
export async function updatePartialSettingsInFirestore(
  userId: string,
  partial: Partial<UserSettings>
): Promise<void> {
  const settingsRef = doc(db, COLLECTIONS.SETTINGS, userId);
  await updateDoc(settingsRef, partial);
}

/**
 * Deletes user settings from Firestore.
 *
 * @param userId - The user ID
 * @returns Promise resolving when delete is complete
 */
export async function deleteSettingsFromFirestore(userId: string): Promise<void> {
  const settingsRef = doc(db, COLLECTIONS.SETTINGS, userId);
  await deleteDoc(settingsRef);
}
