/**
 * Tips Module
 *
 * Provides tip scoring, selection, and management functionality.
 * Uses Wilson Score Lower Bound for fair tip ranking based on user ratings.
 */

export {
  calculateWilsonScore,
  calculateWeight,
  calculateAllTipScores,
  weightedRandomSelect,
  getWeightedRandomTip,
  getAllTipsWithScores,
} from './scoring';

// Re-export from constants for convenience
export {
  TIPS,
  type Tip,
  type TipCategory,
  type TimeSlot,
  type DayType,
  getCurrentTimeSlot,
  getCurrentDayType,
  isTipAvailable,
  getAvailableTips,
  getRandomTip,
  getRandomAvailableTip,
  getTipsByCategory,
  getAllCategories,
  getTipById,
} from '@/constants/tips';
