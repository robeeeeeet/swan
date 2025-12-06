/**
 * AI Module
 * Re-exports all AI-related functionality for Swan
 */

// Client utilities
export {
  getGeminiClient,
  getModelName,
  generateText,
  generateTextStream,
  isGeminiConfigured,
  COACHING_GENERATION_CONFIG,
  ANALYSIS_GENERATION_CONFIG,
} from './client';

// Prompt templates and context
export {
  type UserCoachingContext,
  BASE_SYSTEM_PROMPT,
  getMorningBriefingPrompt,
  getCravingAlertPrompt,
  getStepDownPrompt,
  getSurvivalCheckPrompt,
  getSOSEncouragementPrompt,
  getSuccessCelebrationPrompt,
  FALLBACK_MESSAGES,
  getRandomFallbackMessage,
} from './prompts';

// Coaching service
export {
  type CoachingMessageType,
  type CoachingResult,
  generateCoachingMessage,
  getCurrentTimeOfDay,
  shouldSuggestStepDown,
  getTypicalCravingHours,
  isApproachingCravingTime,
  buildCoachingContext,
} from './coaching';
