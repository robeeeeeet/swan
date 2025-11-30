import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getSummariesByUser } from '@/lib/indexeddb/summaries';
import { calculateCumulativeStats } from '@/lib/utils/summary';

interface AchievementStats {
  totalMoneySaved: number;
  totalMinutesSaved: number;
  totalResisted: number;
  totalSmoked: number;
  totalCraved: number;
  daysTracking: number;
  averageResistanceRate: number;
}

/**
 * Custom hook for fetching and calculating cumulative achievements
 * Used for the Achievement Panel (B-03)
 */
export function useAchievements() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AchievementStats>({
    totalMoneySaved: 0,
    totalMinutesSaved: 0,
    totalResisted: 0,
    totalSmoked: 0,
    totalCraved: 0,
    daysTracking: 0,
    averageResistanceRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAchievements() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch all summaries from IndexedDB
        const summaries = await getSummariesByUser(user.uid);

        // Calculate cumulative stats
        const cumulativeStats = calculateCumulativeStats(summaries);

        setStats(cumulativeStats);
      } catch (error) {
        console.error('Failed to load achievements:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAchievements();
  }, [user]);

  return {
    stats,
    isLoading,
  };
}
