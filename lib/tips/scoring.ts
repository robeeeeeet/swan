/**
 * Tip Scoring and Selection Algorithm
 *
 * Uses Wilson Score Lower Bound for calculating tip quality scores.
 * This algorithm is used by Reddit for ranking and provides fair scoring
 * even with small sample sizes.
 */

import { TipRating, TipWithScore } from '@/types';
import { Tip, TIPS, getAvailableTips, TimeSlot, DayType } from '@/constants/tips';
import { getAllTipRatings } from '@/lib/indexeddb';
import { getGlobalTipRatings, getPersonalTipRatings, GlobalTipRating, PersonalTipRating } from '@/lib/firebase/tipRatings';

/**
 * Calculate Wilson Score Lower Bound
 *
 * The Wilson score interval is a confidence interval for a proportion.
 * We use the lower bound to be conservative - a tip needs more positive
 * ratings to be considered "good" rather than just lucky.
 *
 * Formula:
 * (p + z²/2n - z * sqrt((p*(1-p) + z²/4n) / n)) / (1 + z²/n)
 *
 * Where:
 * - p = positive ratings / total ratings
 * - n = total ratings
 * - z = 1.96 for 95% confidence (we use 1.0 for more exploration)
 *
 * @param goodCount - Number of positive ratings
 * @param badCount - Number of negative ratings
 * @param confidence - Z-score for confidence interval (default: 1.0 for more exploration)
 * @returns Wilson score lower bound (0-1)
 */
export function calculateWilsonScore(
  goodCount: number,
  badCount: number,
  confidence: number = 1.0
): number {
  const total = goodCount + badCount;

  // No ratings = neutral score
  if (total === 0) {
    return 0.5;
  }

  const p = goodCount / total;
  const z = confidence;
  const z2 = z * z;

  const numerator = p + z2 / (2 * total) - z * Math.sqrt((p * (1 - p) + z2 / (4 * total)) / total);
  const denominator = 1 + z2 / total;

  return Math.max(0, Math.min(1, numerator / denominator));
}

/**
 * Calculate selection weight from Wilson score
 *
 * Weight calculation:
 * - Base weight: 0.3 (30% of selection probability)
 * - Score multiplier: 0.7 (70% based on Wilson score)
 * - Minimum weight: 0.1 (ensures all tips have a chance)
 *
 * This ensures:
 * - Bad tips still have 10% chance of appearing (for re-evaluation)
 * - Good tips can have up to 100% chance
 * - New tips have ~50% chance
 *
 * @param wilsonScore - The Wilson score (0-1)
 * @returns Selection weight (0.1-1.0)
 */
export function calculateWeight(wilsonScore: number): number {
  const BASE_WEIGHT = 0.3;
  const SCORE_MULTIPLIER = 0.7;
  const MIN_WEIGHT = 0.1;

  return Math.max(MIN_WEIGHT, BASE_WEIGHT + wilsonScore * SCORE_MULTIPLIER);
}

/**
 * Calculate scores for all tips
 *
 * @param ratings - Map of tip ratings by tipId
 * @returns Array of tips with their scores
 */
export function calculateAllTipScores(ratings: TipRating[]): TipWithScore[] {
  // Create a map for quick lookup
  const ratingMap = new Map<number, TipRating>();
  for (const rating of ratings) {
    ratingMap.set(rating.tipId, rating);
  }

  return TIPS.map((tip) => {
    const rating = ratingMap.get(tip.id);
    const goodCount = rating?.goodCount ?? 0;
    const badCount = rating?.badCount ?? 0;
    const totalRatings = goodCount + badCount;
    const wilsonScore = calculateWilsonScore(goodCount, badCount);
    const weight = calculateWeight(wilsonScore);

    return {
      tipId: tip.id,
      wilsonScore,
      weight,
      goodCount,
      badCount,
      totalRatings,
    };
  });
}

/**
 * Weighted random selection from an array
 *
 * @param items - Array of items with weights
 * @returns Selected item
 */
export function weightedRandomSelect<T extends { weight: number }>(items: T[]): T {
  if (items.length === 0) {
    throw new Error('Cannot select from empty array');
  }

  if (items.length === 1) {
    return items[0];
  }

  // Calculate total weight
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);

  // Generate random value
  let random = Math.random() * totalWeight;

  // Find the selected item
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item;
    }
  }

  // Fallback (should not reach here)
  return items[items.length - 1];
}

/**
 * Get a weighted random tip based on ratings and time availability
 *
 * @param timeSlot - Optional time slot filter
 * @param dayType - Optional day type filter
 * @param excludeTipId - Optional tip ID to exclude (e.g., current tip)
 * @returns Selected tip
 */
export async function getWeightedRandomTip(
  timeSlot?: TimeSlot,
  dayType?: DayType,
  excludeTipId?: number
): Promise<Tip> {
  // Get available tips for current time
  let availableTips = getAvailableTips(timeSlot, dayType);

  // Exclude specified tip if provided
  if (excludeTipId !== undefined) {
    availableTips = availableTips.filter((tip) => tip.id !== excludeTipId);
  }

  // If no tips available, fall back to all tips
  if (availableTips.length === 0) {
    availableTips = TIPS.filter((tip) => tip.id !== excludeTipId);
  }

  // If still no tips (shouldn't happen), return first tip
  if (availableTips.length === 0) {
    return TIPS[0];
  }

  // Get ratings from IndexedDB
  let ratings: TipRating[] = [];
  try {
    ratings = await getAllTipRatings();
  } catch (error) {
    console.warn('Failed to get tip ratings, using equal weights:', error);
  }

  // Calculate scores for available tips
  const ratingMap = new Map<number, TipRating>();
  for (const rating of ratings) {
    ratingMap.set(rating.tipId, rating);
  }

  const weightedTips = availableTips.map((tip) => {
    const rating = ratingMap.get(tip.id);
    const goodCount = rating?.goodCount ?? 0;
    const badCount = rating?.badCount ?? 0;
    const wilsonScore = calculateWilsonScore(goodCount, badCount);
    const weight = calculateWeight(wilsonScore);

    return {
      tip,
      weight,
    };
  });

  // Select using weighted random
  const selected = weightedRandomSelect(weightedTips);
  return selected.tip;
}

/**
 * Get all tips with their scores for analysis/debugging (from IndexedDB - local)
 */
export async function getAllTipsWithScores(): Promise<(Tip & TipWithScore)[]> {
  const ratings = await getAllTipRatings();
  const scores = calculateAllTipScores(ratings);

  const scoreMap = new Map<number, TipWithScore>();
  for (const score of scores) {
    scoreMap.set(score.tipId, score);
  }

  return TIPS.map((tip) => {
    const score = scoreMap.get(tip.id);
    return {
      ...tip,
      tipId: tip.id,
      wilsonScore: score?.wilsonScore ?? 0.5,
      weight: score?.weight ?? 0.65,
      goodCount: score?.goodCount ?? 0,
      badCount: score?.badCount ?? 0,
      totalRatings: score?.totalRatings ?? 0,
    };
  });
}

/**
 * Get all tips with global scores (from Firestore - all users)
 */
export async function getAllTipsWithGlobalScores(): Promise<(Tip & TipWithScore & { totalUsers: number })[]> {
  try {
    const globalRatings = await getGlobalTipRatings();

    const ratingMap = new Map<number, GlobalTipRating>();
    for (const rating of globalRatings) {
      ratingMap.set(rating.tipId, rating);
    }

    return TIPS.map((tip) => {
      const rating = ratingMap.get(tip.id);
      const goodCount = rating?.goodCount ?? 0;
      const badCount = rating?.badCount ?? 0;
      const totalRatings = goodCount + badCount;
      const wilsonScore = calculateWilsonScore(goodCount, badCount);
      const weight = calculateWeight(wilsonScore);

      return {
        ...tip,
        tipId: tip.id,
        wilsonScore,
        weight,
        goodCount,
        badCount,
        totalRatings,
        totalUsers: rating?.totalUsers ?? 0,
      };
    });
  } catch (error) {
    console.error('Failed to get global tip scores:', error);
    // Fallback to empty scores
    return TIPS.map((tip) => ({
      ...tip,
      tipId: tip.id,
      wilsonScore: 0.5,
      weight: 0.65,
      goodCount: 0,
      badCount: 0,
      totalRatings: 0,
      totalUsers: 0,
    }));
  }
}

/**
 * Get all tips with personal scores from Firestore (for specific user)
 */
export async function getAllTipsWithPersonalScores(userId: string): Promise<(Tip & TipWithScore)[]> {
  try {
    const personalRatings = await getPersonalTipRatings(userId);

    const ratingMap = new Map<number, PersonalTipRating>();
    for (const rating of personalRatings) {
      ratingMap.set(rating.tipId, rating);
    }

    return TIPS.map((tip) => {
      const rating = ratingMap.get(tip.id);
      const goodCount = rating?.goodCount ?? 0;
      const badCount = rating?.badCount ?? 0;
      const totalRatings = goodCount + badCount;
      const wilsonScore = calculateWilsonScore(goodCount, badCount);
      const weight = calculateWeight(wilsonScore);

      return {
        ...tip,
        tipId: tip.id,
        wilsonScore,
        weight,
        goodCount,
        badCount,
        totalRatings,
      };
    });
  } catch (error) {
    console.error('Failed to get personal tip scores:', error);
    // Fallback to empty scores
    return TIPS.map((tip) => ({
      ...tip,
      tipId: tip.id,
      wilsonScore: 0.5,
      weight: 0.65,
      goodCount: 0,
      badCount: 0,
      totalRatings: 0,
    }));
  }
}
