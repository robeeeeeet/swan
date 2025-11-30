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
        return {
          userId,
          notifications: {
            enabled: false,
            morningBriefing: true,
            dangerousTimeAlerts: true,
            stepDownSuggestions: true,
            survivalCheck: true,
            privacyMode: false,
            quietHoursStart: '22:00',
            quietHoursEnd: '08:00',
          },
          goals: {
            dailyTarget: 20,
            stepDownEnabled: true,
            stepDownRate: 0.9,
          },
          app: {
            theme: 'system',
            language: 'ja',
            cigarettePrice: 600,
            cigarettesPerPack: 20,
            minutesPerCigarette: 7,
          },
        };
      },
    }),
    {
      name: 'swan-settings-storage',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
