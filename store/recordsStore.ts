import { create } from 'zustand';
import { SmokingRecord, DailySummary, RecordType, SituationTag } from '@/types';

interface RecordsState {
  // Today's records
  todayRecords: SmokingRecord[];
  todaySummary: DailySummary | null;

  // Historical data
  historicalSummaries: DailySummary[];

  // Loading states
  isLoading: boolean;
  isSyncing: boolean;

  // Actions - Records
  addRecord: (record: SmokingRecord) => void;
  removeRecord: (recordId: string) => void;
  setTodayRecords: (records: SmokingRecord[]) => void;

  // Actions - Summary
  setTodaySummary: (summary: DailySummary | null) => void;
  updateTodaySummary: (updates: Partial<DailySummary>) => void;

  // Actions - Historical
  setHistoricalSummaries: (summaries: DailySummary[]) => void;
  addHistoricalSummary: (summary: DailySummary) => void;

  // Actions - States
  setLoading: (isLoading: boolean) => void;
  setSyncing: (isSyncing: boolean) => void;

  // Computed values
  getTodayCount: (type: RecordType) => number;
  getTodayTags: () => SituationTag[];
}

/**
 * Records store
 * Manages smoking/craving records and daily summaries
 *
 * Not persisted - data comes from Firebase/IndexedDB
 */
export const useRecordsStore = create<RecordsState>((set, get) => ({
  // State
  todayRecords: [],
  todaySummary: null,
  historicalSummaries: [],
  isLoading: false,
  isSyncing: false,

  // Records actions
  addRecord: (record) =>
    set((state) => ({
      todayRecords: [...state.todayRecords, record],
    })),

  removeRecord: (recordId) =>
    set((state) => ({
      todayRecords: state.todayRecords.filter((r) => r.id !== recordId),
    })),

  setTodayRecords: (records) => set({ todayRecords: records }),

  // Summary actions
  setTodaySummary: (summary) => set({ todaySummary: summary }),

  updateTodaySummary: (updates) =>
    set((state) => ({
      todaySummary: state.todaySummary
        ? { ...state.todaySummary, ...updates }
        : null,
    })),

  // Historical actions
  setHistoricalSummaries: (summaries) =>
    set({ historicalSummaries: summaries }),

  addHistoricalSummary: (summary) =>
    set((state) => ({
      historicalSummaries: [...state.historicalSummaries, summary],
    })),

  // State actions
  setLoading: (isLoading) => set({ isLoading }),
  setSyncing: (isSyncing) => set({ isSyncing }),

  // Computed values
  getTodayCount: (type) => {
    const { todayRecords } = get();
    return todayRecords.filter((r) => r.type === type).length;
  },

  getTodayTags: () => {
    const { todayRecords } = get();
    const allTags = todayRecords.flatMap((r) => r.tags);
    // Return unique tags
    return Array.from(new Set(allTags));
  },
}));
