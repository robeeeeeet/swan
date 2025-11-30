import {
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth } from './config';

/**
 * Sign in anonymously
 * Used for first-time users who want to try the app without creating an account
 */
export const signInAnonymous = async (): Promise<User> => {
  try {
    // Set persistence to local (survives browser restarts)
    await setPersistence(auth, browserLocalPersistence);
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error('Anonymous sign-in failed:', error);
    throw error;
  }
};

/**
 * Sign in with Google
 * Allows users to link their anonymous account to a Google account
 */
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error) {
    console.error('Google sign-in failed:', error);
    throw error;
  }
};

/**
 * Link anonymous account with Google account
 * Preserves user data when upgrading from anonymous to permanent account
 */
export const linkAnonymousWithGoogle = async (): Promise<User> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }

    if (!currentUser.isAnonymous) {
      throw new Error('Current user is not anonymous');
    }

    const provider = new GoogleAuthProvider();
    const userCredential = await linkWithPopup(currentUser, provider);
    return userCredential.user;
  } catch (error) {
    console.error('Linking anonymous account with Google failed:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign-out failed:', error);
    throw error;
  }
};

/**
 * Subscribe to authentication state changes
 * @param callback Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const onAuthChange = (
  callback: (user: User | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get the current user
 * @returns Current user or null if not authenticated
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Check if user is anonymous
 */
export const isAnonymousUser = (): boolean => {
  const user = auth.currentUser;
  return user?.isAnonymous ?? false;
};
