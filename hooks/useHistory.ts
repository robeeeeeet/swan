/**
 * useHistory Hook
 *
 * Provides history data management for the history page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { SmokingRecord, DailySummary } from '@/types';
import { useUserStore } from '@/store/userStore';
import { useSettingsStore } from '@/store/settingsStore';
import { getRecordsByUser } from '@/lib/indexeddb/records';
import { getSummaryByDate } from '@/lib/indexeddb/summaries';
import { calculateDailySummary } from '@/lib/utils/summary';
import { getLocalDateString, getLocalMidnight } from '@/lib/utils/date';

export type HistoryPeriod = '7days' | '30days' | 'all';

interface UseHistoryReturn {
  records: SmokingRecord[];
  summaries: DailySummary[];
  weekStats: {
    totalSmoked: number;
    totalResisted: number;
    moneySaved: number;
    resistanceRate: number;
  };
  isLoading: boolean;
  selectedPeriod: HistoryPeriod;
  setSelectedPeriod: (period: HistoryPeriod) => void;
  refreshHistory: () => Promise<void>;
}

export const useHistory = (): UseHistoryReturn => {
  const user = useUserStore((state) => state.user);
  const settings = useSettingsStore((state) => state.settings);
  const [records, setRecords] = useState<SmokingRecord[]>([]);
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<HistoryPeriod>('7days');

  const loadHistory = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // 期間に応じた日数を計算
      const days = selectedPeriod === '7days' ? 7 : selectedPeriod === '30days' ? 30 : 365;

      // Get all records for the user
      const allRecords = await getRecordsByUser(user.uid);

      // Filter records by date range (using local timezone)
      const startDate = getLocalMidnight();
      startDate.setDate(startDate.getDate() - days);
      const startTimestamp = startDate.getTime();

      const filteredRecords = allRecords.filter(r => r.timestamp >= startTimestamp);
      setRecords(filteredRecords);

      // Generate daily summaries
      const summariesMap = new Map<string, DailySummary>();
      const todayStr = getLocalDateString();

      for (let i = 0; i < days; i++) {
        const date = getLocalMidnight();
        date.setDate(date.getDate() - i);
        const dateStr = getLocalDateString(date);

        // Get existing summary or calculate new one
        let summary = await getSummaryByDate(user.uid, dateStr);

        if (!summary) {
          // Calculate summary from records
          const dayRecords = filteredRecords.filter(r => r.date === dateStr);

          if (dayRecords.length > 0 || dateStr === todayStr) {
            summary = calculateDailySummary(
              user.uid,
              dateStr,
              dayRecords,
              settings?.app.cigarettePrice || 600,
              settings?.app.cigarettesPerPack || 20,
              settings?.app.minutesPerCigarette || 7,
              settings?.goals.dailyTarget || 20
            );
          }
        }

        if (summary) {
          summariesMap.set(dateStr, summary);
        }
      }

      // Convert to array and sort by date (newest first)
      const summariesArray = Array.from(summariesMap.values()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setSummaries(summariesArray);

    } catch (error) {
      console.error('履歴の読み込みに失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, settings, selectedPeriod]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Calculate week stats
  const weekStats = {
    totalSmoked: summaries.reduce((sum, s) => sum + s.totalSmoked, 0),
    totalResisted: summaries.reduce((sum, s) => sum + s.totalResisted, 0),
    moneySaved: summaries.reduce((sum, s) => sum + (s.moneySaved || 0), 0),
    resistanceRate:
      summaries.reduce((sum, s) => sum + s.totalCraved, 0) > 0
        ? (summaries.reduce((sum, s) => sum + s.totalResisted, 0) /
            summaries.reduce((sum, s) => sum + s.totalCraved, 0)) *
          100
        : 0,
  };

  return {
    records,
    summaries,
    weekStats,
    isLoading,
    selectedPeriod,
    setSelectedPeriod,
    refreshHistory: loadHistory,
  };
};
