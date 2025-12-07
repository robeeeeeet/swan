'use client';

import { useEffect } from 'react';
import { User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { useUserStore } from '@/store/userStore';
import { useSettingsStore } from '@/store/settingsStore';
import {
  onAuthChange,
  signInAnonymous,
  signInWithGoogle,
  linkAnonymousWithGoogle,
  signOut as firebaseSignOut,
  getCurrentUser,
  isAnonymousUser,
} from '@/lib/firebase/auth';
import { getSettingsFromFirestore, saveSettingsToFirestore } from '@/lib/firebase/firestore';
import { saveSettings as saveSettingsToIDB, getSettings as getSettingsFromIDB } from '@/lib/indexeddb/settings';
import { UserProfile } from '@/types';

/**
 * Authentication hook
 * Manages user authentication state and provides auth methods
 */
export function useAuth() {
  const { user, isLoading, error, setUser, setLoading, setError, clearUser } = useUserStore();
  const { settings, setSettings, getDefaultSettings } = useSettingsStore();

  // Subscribe to auth state changes
  // Note: We don't call setLoading(true) here because:
  // 1. The initial state in userStore is already isLoading: true
  // 2. Multiple components using useAuth would each trigger setLoading(true),
  //    causing a re-render loop between MainLayout and child components
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser: User | null) => {
      if (firebaseUser) {
        // Convert Firebase User to UserProfile
        const userProfile: UserProfile = {
          uid: firebaseUser.uid,
          isAnonymous: firebaseUser.isAnonymous,
          createdAt: Timestamp.fromDate(
            new Date(firebaseUser.metadata.creationTime || Date.now())
          ),
          displayName: firebaseUser.displayName || undefined,
          email: firebaseUser.email || undefined,
          photoURL: firebaseUser.photoURL || undefined,
        };

        setUser(userProfile);

        // Load settings from Firestore or initialize with defaults
        // Priority: Firestore > IndexedDB > localStorage > Default
        try {
          // First try to get from Firestore (source of truth)
          let loadedSettings = await getSettingsFromFirestore(firebaseUser.uid);

          if (!loadedSettings) {
            // Try IndexedDB next
            const idbSettings = await getSettingsFromIDB(firebaseUser.uid);
            loadedSettings = idbSettings ?? null;
          }

          if (loadedSettings) {
            // Found existing settings - use them
            setSettings(loadedSettings);
            // Ensure they're saved to both IndexedDB and Firestore
            await saveSettingsToIDB(loadedSettings);
            await saveSettingsToFirestore(loadedSettings).catch(err =>
              console.warn('[useAuth] Failed to sync settings to Firestore:', err)
            );
          } else {
            // No existing settings - create defaults
            const defaultSettings = getDefaultSettings(firebaseUser.uid);
            setSettings(defaultSettings);
            // Save to IndexedDB and Firestore
            await saveSettingsToIDB(defaultSettings);
            await saveSettingsToFirestore(defaultSettings).catch(err =>
              console.warn('[useAuth] Failed to save default settings to Firestore:', err)
            );
          }
        } catch (err) {
          console.error('[useAuth] Error loading settings:', err);
          // Fallback to localStorage settings or defaults
          const currentSettings = useSettingsStore.getState().settings;
          if (!currentSettings) {
            const defaultSettings = getDefaultSettings(firebaseUser.uid);
            setSettings(defaultSettings);
          }
        }
      } else {
        clearUser();
      }

      setLoading(false);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sign in anonymously
  const signInAnonymously = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInAnonymous();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '匿名ログインに失敗しました';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Googleログインに失敗しました';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Link anonymous account with Google
  const linkWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      await linkAnonymousWithGoogle();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'アカウントのリンクに失敗しました';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await firebaseSignOut();
      clearUser();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ログアウトに失敗しました';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    isAnonymous: isAnonymousUser(),
    signInAnonymously,
    signInGoogle,
    linkWithGoogle,
    signOut,
  };
}
