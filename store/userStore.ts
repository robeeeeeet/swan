import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@/types';

interface UserState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearUser: () => void;
}

/**
 * User store
 * Manages authenticated user state
 *
 * Persisted to localStorage for session continuity
 */
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      error: null,

      setUser: (user) => set({ user, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearUser: () => set({ user: null, error: null }),
    }),
    {
      name: 'swan-user-storage',
      // Only persist user data, not loading/error states
      partialize: (state) => ({ user: state.user }),
    }
  )
);
