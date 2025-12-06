/**
 * useCoaching Hook
 * React hook for AI coaching functionality
 */

'use client';

import { useState, useCallback } from 'react';
import { useRecords } from './useRecords';
import { useAchievements } from './useAchievements';
import { useSettingsStore } from '@/store/settingsStore';

export type CoachingMessageType =
  | 'morning_briefing'
  | 'craving_alert'
  | 'step_down'
  | 'survival_check'
  | 'sos_encouragement'
  | 'success_celebration';

export interface CoachingMessage {
  message: string;
  type: CoachingMessageType;
  usedAI: boolean;
  error?: string;
}

interface UseCoachingReturn {
  /** Generate a coaching message */
  generateMessage: (type: CoachingMessageType, situationTags?: string[]) => Promise<CoachingMessage | null>;
  /** Current message (if any) */
  currentMessage: CoachingMessage | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Clear the current message */
  clearMessage: () => void;
}

export function useCoaching(): UseCoachingReturn {
  const [currentMessage, setCurrentMessage] = useState<CoachingMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getTodayCount } = useRecords();
  const { stats } = useAchievements();
  const { settings } = useSettingsStore();

  const generateMessage = useCallback(
    async (
      type: CoachingMessageType,
      situationTags?: string[]
    ): Promise<CoachingMessage | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // Build context from current user state
        const context = {
          daysTracking: stats.daysTracking || 1,
          todaySmoked: getTodayCount('smoked'),
          todayCraved: getTodayCount('craved'),
          todayResisted: getTodayCount('resisted'),
          dailyGoal: settings?.goals.dailyTarget ?? 20,
          situationTags,
        };

        const response = await fetch('/api/coaching', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type, context }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate message');
        }

        const result: CoachingMessage = await response.json();
        setCurrentMessage(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('[useCoaching] Error:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [getTodayCount, stats.daysTracking, settings?.goals.dailyTarget]
  );

  const clearMessage = useCallback(() => {
    setCurrentMessage(null);
    setError(null);
  }, []);

  return {
    generateMessage,
    currentMessage,
    isLoading,
    error,
    clearMessage,
  };
}

/**
 * SOS-specific coaching hook
 * Convenience wrapper for SOS encouragement messages
 */
export function useSOSCoaching() {
  const { generateMessage, currentMessage, isLoading, error, clearMessage } =
    useCoaching();

  const getEncouragement = useCallback(
    async (situationTags?: string[]) => {
      return generateMessage('sos_encouragement', situationTags);
    },
    [generateMessage]
  );

  const celebrateSuccess = useCallback(async () => {
    return generateMessage('success_celebration');
  }, [generateMessage]);

  return {
    getEncouragement,
    celebrateSuccess,
    currentMessage,
    isLoading,
    error,
    clearMessage,
  };
}

export default useCoaching;
