/**
 * Firestore operations for Tip Ratings
 *
 * Manages both personal ratings (per user) and global ratings (aggregated across all users).
 * Uses Firestore transactions to ensure consistent counter updates.
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  runTransaction,
  increment,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { TipRatingType } from '@/types';

// ============================================================================
// Types
// ============================================================================

/**
 * Personal tip rating stored per user
 */
export interface PersonalTipRating {
  tipId: number;
  goodCount: number;
  badCount: number;
  lastRatedAt: Timestamp;
}

/**
 * Global tip rating aggregated across all users
 */
export interface GlobalTipRating {
  tipId: number;
  goodCount: number;
  badCount: number;
  totalUsers: number; // Number of unique users who rated this tip
  lastUpdatedAt: Timestamp;
}

// ============================================================================
// Personal Ratings (per user)
// ============================================================================

/**
 * Get all personal tip ratings for a user
 */
export async function getPersonalTipRatings(userId: string): Promise<PersonalTipRating[]> {
  try {
    const ratingsRef = collection(db, 'users', userId, 'tipRatings');
    const snapshot = await getDocs(ratingsRef);

    return snapshot.docs.map((doc) => ({
      tipId: parseInt(doc.id, 10),
      ...doc.data(),
    })) as PersonalTipRating[];
  } catch (error) {
    console.error('Failed to get personal tip ratings:', error);
    return [];
  }
}

/**
 * Get personal rating for a specific tip
 */
export async function getPersonalTipRating(
  userId: string,
  tipId: number
): Promise<PersonalTipRating | null> {
  try {
    const ratingRef = doc(db, 'users', userId, 'tipRatings', String(tipId));
    const snapshot = await getDoc(ratingRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      tipId,
      ...snapshot.data(),
    } as PersonalTipRating;
  } catch (error) {
    console.error('Failed to get personal tip rating:', error);
    return null;
  }
}

// ============================================================================
// Global Ratings (all users)
// ============================================================================

/**
 * Get all global tip ratings
 */
export async function getGlobalTipRatings(): Promise<GlobalTipRating[]> {
  try {
    const ratingsRef = collection(db, 'globalTipRatings');
    const snapshot = await getDocs(ratingsRef);

    return snapshot.docs.map((doc) => ({
      tipId: parseInt(doc.id, 10),
      ...doc.data(),
    })) as GlobalTipRating[];
  } catch (error) {
    console.error('Failed to get global tip ratings:', error);
    return [];
  }
}

/**
 * Get global rating for a specific tip
 */
export async function getGlobalTipRating(tipId: number): Promise<GlobalTipRating | null> {
  try {
    const ratingRef = doc(db, 'globalTipRatings', String(tipId));
    const snapshot = await getDoc(ratingRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      tipId,
      ...snapshot.data(),
    } as GlobalTipRating;
  } catch (error) {
    console.error('Failed to get global tip rating:', error);
    return null;
  }
}

// ============================================================================
// Rating Operations (updates both personal and global)
// ============================================================================

/**
 * Add a rating for a tip
 * Updates both personal rating and global aggregation using a transaction
 */
export async function addTipRatingToFirestore(
  userId: string,
  tipId: number,
  rating: TipRatingType
): Promise<{ personal: PersonalTipRating; global: GlobalTipRating }> {
  const personalRef = doc(db, 'users', userId, 'tipRatings', String(tipId));
  const globalRef = doc(db, 'globalTipRatings', String(tipId));

  const result = await runTransaction(db, async (transaction) => {
    // Get current personal rating
    const personalSnap = await transaction.get(personalRef);
    const globalSnap = await transaction.get(globalRef);

    const isFirstRating = !personalSnap.exists();
    const currentPersonal = personalSnap.exists()
      ? (personalSnap.data() as Omit<PersonalTipRating, 'tipId'>)
      : { goodCount: 0, badCount: 0 };

    // Calculate new personal rating
    const newPersonal: PersonalTipRating = {
      tipId,
      goodCount: currentPersonal.goodCount + (rating === 'good' ? 1 : 0),
      badCount: currentPersonal.badCount + (rating === 'bad' ? 1 : 0),
      lastRatedAt: Timestamp.now(),
    };

    // Update personal rating
    transaction.set(personalRef, newPersonal);

    // Update global rating
    if (globalSnap.exists()) {
      // Update existing global rating
      transaction.update(globalRef, {
        goodCount: increment(rating === 'good' ? 1 : 0),
        badCount: increment(rating === 'bad' ? 1 : 0),
        totalUsers: isFirstRating ? increment(1) : increment(0),
        lastUpdatedAt: serverTimestamp(),
      });
    } else {
      // Create new global rating
      transaction.set(globalRef, {
        tipId,
        goodCount: rating === 'good' ? 1 : 0,
        badCount: rating === 'bad' ? 1 : 0,
        totalUsers: 1,
        lastUpdatedAt: serverTimestamp(),
      });
    }

    // Return new values (for global, we need to calculate since we can't read after write)
    const currentGlobal = globalSnap.exists()
      ? (globalSnap.data() as GlobalTipRating)
      : { goodCount: 0, badCount: 0, totalUsers: 0 };

    const newGlobal: GlobalTipRating = {
      tipId,
      goodCount: currentGlobal.goodCount + (rating === 'good' ? 1 : 0),
      badCount: currentGlobal.badCount + (rating === 'bad' ? 1 : 0),
      totalUsers: currentGlobal.totalUsers + (isFirstRating ? 1 : 0),
      lastUpdatedAt: Timestamp.now(),
    };

    return { personal: newPersonal, global: newGlobal };
  });

  return result;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate Wilson Score for ranking
 */
export function calculateWilsonScoreFromRating(
  goodCount: number,
  badCount: number,
  confidence: number = 1.0
): number {
  const total = goodCount + badCount;

  if (total === 0) {
    return 0.5; // Neutral score for no ratings
  }

  const p = goodCount / total;
  const z = confidence;
  const z2 = z * z;

  const numerator =
    p + z2 / (2 * total) - z * Math.sqrt((p * (1 - p) + z2 / (4 * total)) / total);
  const denominator = 1 + z2 / total;

  return Math.max(0, Math.min(1, numerator / denominator));
}
