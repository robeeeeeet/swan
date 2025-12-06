/**
 * AI Coaching Service
 * Business logic for generating personalized coaching messages
 */

import {
  generateText,
  isGeminiConfigured,
  COACHING_GENERATION_CONFIG,
} from './client';
import {
  UserCoachingContext,
  getMorningBriefingPrompt,
  getCravingAlertPrompt,
  getStepDownPrompt,
  getSurvivalCheckPrompt,
  getSOSEncouragementPrompt,
  getSuccessCelebrationPrompt,
  getRandomFallbackMessage,
} from './prompts';

/**
 * Types of coaching messages
 */
export type CoachingMessageType =
  | 'morning_briefing'   // C-01: モーニング・ブリーフィング
  | 'craving_alert'      // C-02: 魔の時間帯アラート
  | 'step_down'          // C-03: ステップダウン提案
  | 'survival_check'     // C-04: 生存確認
  | 'sos_encouragement'  // D-03: SOS励まし
  | 'success_celebration'; // 成功祝福

/**
 * Result of generating a coaching message
 */
export interface CoachingResult {
  /** The generated message */
  message: string;
  /** Type of message */
  type: CoachingMessageType;
  /** Whether AI was used (false means fallback was used) */
  usedAI: boolean;
  /** Error message if generation failed */
  error?: string;
}

/**
 * Generate a coaching message based on type and context
 */
export async function generateCoachingMessage(
  type: CoachingMessageType,
  context: UserCoachingContext
): Promise<CoachingResult> {
  // Check if AI is configured
  if (!isGeminiConfigured()) {
    console.warn('[Coaching] Gemini API not configured, using fallback');
    return {
      message: getFallbackMessage(type),
      type,
      usedAI: false,
      error: 'AI not configured',
    };
  }

  try {
    const prompt = getPromptForType(type, context);
    const message = await generateText(prompt, COACHING_GENERATION_CONFIG);

    return {
      message,
      type,
      usedAI: true,
    };
  } catch (error) {
    console.error('[Coaching] Error generating message:', error);

    // Fallback to static messages on error
    return {
      message: getFallbackMessage(type),
      type,
      usedAI: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get the appropriate prompt for a message type
 */
function getPromptForType(
  type: CoachingMessageType,
  context: UserCoachingContext
): string {
  switch (type) {
    case 'morning_briefing':
      return getMorningBriefingPrompt(context);
    case 'craving_alert':
      return getCravingAlertPrompt(context);
    case 'step_down':
      return getStepDownPrompt(context);
    case 'survival_check':
      return getSurvivalCheckPrompt(context);
    case 'sos_encouragement':
      return getSOSEncouragementPrompt(context);
    case 'success_celebration':
      return getSuccessCelebrationPrompt(context);
    default:
      throw new Error(`Unknown coaching message type: ${type}`);
  }
}

/**
 * Get a fallback message for a given type
 */
function getFallbackMessage(type: CoachingMessageType): string {
  const typeToFallbackKey: Record<CoachingMessageType, keyof typeof import('./prompts').FALLBACK_MESSAGES> = {
    morning_briefing: 'morningBriefing',
    craving_alert: 'cravingAlert',
    step_down: 'stepDown',
    survival_check: 'survivalCheck',
    sos_encouragement: 'sosEncouragement',
    success_celebration: 'successCelebration',
  };

  return getRandomFallbackMessage(typeToFallbackKey[type]);
}

/**
 * Determine the current time of day
 */
export function getCurrentTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 17) {
    return 'afternoon';
  } else if (hour >= 17 && hour < 21) {
    return 'evening';
  } else {
    return 'night';
  }
}

/**
 * Check if user should receive a step-down suggestion
 * Returns true if user has consistently performed below their goal
 */
export function shouldSuggestStepDown(
  weeklyAverage: number,
  dailyGoal: number,
  daysTracking: number
): boolean {
  // Need at least 7 days of data
  if (daysTracking < 7) {
    return false;
  }

  // Suggest step-down if weekly average is at least 2 below goal
  return weeklyAverage <= dailyGoal - 2;
}

/**
 * Get typical craving hours for a user based on their history
 * Returns array of hours (0-23) when cravings are most likely
 */
export function getTypicalCravingHours(
  cravingTimestamps: number[]
): number[] {
  if (cravingTimestamps.length < 5) {
    // Not enough data, return common craving times
    return [9, 12, 15, 18, 21]; // After meals, afternoon, evening
  }

  // Count occurrences per hour
  const hourCounts = new Array(24).fill(0);

  for (const timestamp of cravingTimestamps) {
    const hour = new Date(timestamp).getHours();
    hourCounts[hour]++;
  }

  // Find hours with above-average craving counts
  const avgCount = cravingTimestamps.length / 24;
  const peakHours: number[] = [];

  for (let hour = 0; hour < 24; hour++) {
    if (hourCounts[hour] > avgCount * 1.5) {
      peakHours.push(hour);
    }
  }

  // Return at least 3 hours
  if (peakHours.length < 3) {
    // Sort by count and take top 5
    const sorted = hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((item) => item.hour);
    return sorted;
  }

  return peakHours;
}

/**
 * Check if current time is approaching a typical craving hour
 */
export function isApproachingCravingTime(
  typicalCravingHours: number[],
  minutesBefore: number = 30
): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const hour of typicalCravingHours) {
    const cravingMinutes = hour * 60;
    const diff = cravingMinutes - currentMinutes;

    // Check if within the specified window before the craving time
    if (diff > 0 && diff <= minutesBefore) {
      return true;
    }
  }

  return false;
}

/**
 * Build coaching context from user data
 */
export function buildCoachingContext(data: {
  daysTracking: number;
  todaySmoked: number;
  todayCraved: number;
  todayResisted: number;
  dailyGoal: number;
  weeklyAverage?: number;
  yesterdaySmoked?: number;
  situationTags?: string[];
  userName?: string;
}): UserCoachingContext {
  return {
    ...data,
    timeOfDay: getCurrentTimeOfDay(),
  };
}
