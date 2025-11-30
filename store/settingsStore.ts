import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSettings, NotificationSettings, GoalSettings, AppSettings } from '@/types';
import { Timestamp } from 'firebase/firestore';

interface SettingsState {
  settings: UserSettings | null;
  isLoading: boolean;

  // Actions
  setSettings: (settings: UserSettings) => void;
  updateNotifications: (notifications: Partial<NotificationSettings>) => void;
  updateGoals: (goals: Partial<GoalSettings>) => void;
  updateApp: (app: Partial<AppSettings>) => void;
  setLoading: (isLoading: boolean) => void;

  // Helpers
  getDefaultSettings: (userId: string) => UserSettings;
}

/**
 * Settings store
 * Manages user preferences and configuration
 *
 * Persisted to localStorage with Firebase sync
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: null,
      isLoading: false,

      setSettings: (settings) => set({ settings }),

      updateNotifications: (notifications) =>
        set((state) => ({
          settings: state.settings
            ? {
                ...state.settings,
                notifications: {
                  ...state.settings.notifications,
                  ...notifications,
                },
                updatedAt: Timestamp.now(),
              }
            : null,
        })),

      updateGoals: (goals) =>
        set((state) => ({
          settings: state.settings
            ? {
                ...state.settings,
                goals: {
                  ...state.settings.goals,
                  ...goals,
                },
                updatedAt: Timestamp.now(),
              }
            : null,
        })),

      updateApp: (app) =>
        set((state) => ({
          settings: state.settings
            ? {
                ...state.settings,
                app: {
                  ...state.settings.app,
                  ...app,
                },
                updatedAt: Timestamp.now(),
              }
            : null,
        })),

      setLoading: (isLoading) => set({ isLoading }),

      getDefaultSettings: (userId: string): UserSettings => {
        const now = Timestamp.now();
        return {
          userId,
          notifications: {
            enabled: false,
            morningBriefing: true,
            magicTimeAlert: true,
            stepDownProposal: true,
            aliveCheck: true,
            detailedMessages: false,
            morningBriefingTime: '07:00',
          },
          goals: {
            dailyGoal: 20,
            autoAdjustGoal: true,
            minimumGoal: 1,
            initialDailyCount: 20,
            baselineSetAt: now,
          },
          app: {
            onboardingCompleted: false,
            installGuideShown: false,
            sosTimerDuration: 180,
            breathingCycles: 3,
            theme: 'system',
            localDataOnly: false,
          },
          createdAt: now,
          updatedAt: now,
        };
      },
    }),
    {
      name: 'swan-settings-storage',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
