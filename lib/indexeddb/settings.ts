/**
 * IndexedDB Settings Store Operations
 *
 * Provides CRUD operations for user settings stored in IndexedDB.
 * Settings include notification preferences, goals, and app configuration.
 */

import { UserSettings } from '@/types';
import { STORES, withStore } from './db';

/**
 * Saves user settings to IndexedDB.
 * Settings are keyed by userId, so each user has one settings document.
 *
 * @param settings - The user settings to save
 * @returns Promise resolving when save is complete
 */
export async function saveSettings(settings: UserSettings): Promise<void> {
  await withStore(STORES.SETTINGS, 'readwrite', (store) => store.put(settings));
}

/**
 * Retrieves user settings by userId.
 *
 * @param userId - The user ID
 * @returns Promise resolving to the settings, or undefined if not found
 */
export async function getSettings(userId: string): Promise<UserSettings | undefined> {
  return await withStore(STORES.SETTINGS, 'readonly', (store) => store.get(userId));
}

/**
 * Updates user settings.
 * This is an alias for saveSettings since settings use userId as the key.
 *
 * @param settings - The updated settings
 * @returns Promise resolving when update is complete
 */
export async function updateSettings(settings: UserSettings): Promise<void> {
  await saveSettings(settings);
}

/**
 * Partially updates user settings by merging with existing settings.
 * Only the provided fields will be updated.
 *
 * @param userId - The user ID
 * @param partial - Partial settings to merge
 * @returns Promise resolving when update is complete
 */
export async function updatePartialSettings(
  userId: string,
  partial: Partial<UserSettings>
): Promise<void> {
  const existing = await getSettings(userId);

  if (!existing) {
    throw new Error('Settings not found for user');
  }

  const updated: UserSettings = {
    ...existing,
    ...partial,
    userId, // Ensure userId is not changed
  };

  await saveSettings(updated);
}

/**
 * Deletes user settings.
 * Typically only used during account deletion.
 *
 * @param userId - The user ID
 * @returns Promise resolving when delete is complete
 */
export async function deleteSettings(userId: string): Promise<void> {
  await withStore(STORES.SETTINGS, 'readwrite', (store) => store.delete(userId));
}

/**
 * Creates default settings for a new user.
 * These are the initial settings assigned when a user first signs up.
 *
 * @param userId - The user ID
 * @returns Default UserSettings object
 */
export function createDefaultSettings(userId: string): UserSettings {
  return {
    userId,
    notifications: {
      enabled: false, // Start with notifications disabled until user opts in
      morningBriefing: true,
      dangerousTimeAlerts: true,
      stepDownSuggestions: true,
      survivalCheck: true,
      privacyMode: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
    },
    goals: {
      dailyTarget: 20, // Default target of 20 cigarettes per day
      stepDownEnabled: true,
      stepDownRate: 0.9, // Reduce by 10% when conditions are met
    },
    app: {
      theme: 'system',
      language: 'ja',
      cigarettePrice: 600, // Default Japanese cigarette price (¥600)
      cigarettesPerPack: 20,
      minutesPerCigarette: 7, // Average smoking time
    },
  };
}

/**
 * Initializes settings for a new user.
 * Creates and saves default settings if none exist.
 *
 * @param userId - The user ID
 * @returns Promise resolving to the created settings
 */
export async function initializeSettings(userId: string): Promise<UserSettings> {
  const existing = await getSettings(userId);

  if (existing) {
    return existing;
  }

  const defaultSettings = createDefaultSettings(userId);
  await saveSettings(defaultSettings);

  return defaultSettings;
}
