/**
 * Push Notification Subscription Management
 * Client-side FCM token management for Swan PWA
 */

import { getMessaging, getToken, deleteToken, onMessage, type Messaging } from 'firebase/messaging';
import { doc, setDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// FCM Messaging instance (cached)
let messagingInstance: Messaging | null = null;

/**
 * Device type detection
 */
function getDeviceType(): 'ios' | 'android' | 'desktop' {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  }
  if (/android/.test(userAgent)) {
    return 'android';
  }
  return 'desktop';
}

/**
 * Check if the browser supports push notifications
 */
export function isPushNotificationSupported(): boolean {
  return (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

/**
 * Check if running as installed PWA (standalone mode)
 */
export function isRunningAsInstalledPWA(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * Check if iOS and requires home screen installation for push
 */
export function isIOSRequiringInstallation(): boolean {
  const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
  return isIOS && !isRunningAsInstalledPWA();
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isPushNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) {
    console.warn('[Push] Push notifications not supported in this browser');
    return 'denied';
  }

  // Check iOS standalone mode requirement
  if (isIOSRequiringInstallation()) {
    console.warn('[Push] iOS requires the app to be installed to home screen for push notifications');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('[Push] Permission result:', permission);
    return permission;
  } catch (error) {
    console.error('[Push] Error requesting permission:', error);
    return 'denied';
  }
}

/**
 * Get Firebase Messaging instance
 * Lazy initialization to avoid SSR issues
 */
async function getMessagingInstance(): Promise<Messaging | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (messagingInstance) {
    return messagingInstance;
  }

  try {
    // Dynamic import to avoid SSR issues
    const { getApp } = await import('firebase/app');
    const app = getApp();
    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch (error) {
    console.error('[Push] Error getting messaging instance:', error);
    return null;
  }
}

/**
 * Register the FCM service worker
 */
async function registerFCMServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
    console.log('[Push] FCM Service Worker registered:', registration.scope);
    return registration;
  } catch (error) {
    console.error('[Push] Error registering FCM service worker:', error);
    return null;
  }
}

/**
 * Get FCM token for the current device
 */
export async function getFCMToken(): Promise<string | null> {
  if (!isPushNotificationSupported()) {
    console.warn('[Push] Push notifications not supported');
    return null;
  }

  // Check permission first
  if (Notification.permission !== 'granted') {
    console.warn('[Push] Notification permission not granted');
    return null;
  }

  try {
    // Get VAPID key from environment
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('[Push] VAPID key not configured');
      return null;
    }

    // Register FCM service worker
    const swRegistration = await registerFCMServiceWorker();
    if (!swRegistration) {
      console.error('[Push] Failed to register FCM service worker');
      return null;
    }

    // Get messaging instance
    const messaging = await getMessagingInstance();
    if (!messaging) {
      console.error('[Push] Failed to get messaging instance');
      return null;
    }

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swRegistration,
    });

    console.log('[Push] FCM token obtained:', token.substring(0, 20) + '...');
    return token;
  } catch (error) {
    console.error('[Push] Error getting FCM token:', error);
    return null;
  }
}

/**
 * Save FCM token to Firestore
 */
export async function saveFCMTokenToFirestore(
  userId: string,
  token: string
): Promise<boolean> {
  try {
    const tokenDocRef = doc(db, 'users', userId, 'pushTokens', token);

    await setDoc(tokenDocRef, {
      token,
      deviceType: getDeviceType(),
      userAgent: navigator.userAgent,
      createdAt: serverTimestamp(),
      lastUsedAt: serverTimestamp(),
    });

    console.log('[Push] Token saved to Firestore');
    return true;
  } catch (error) {
    console.error('[Push] Error saving token to Firestore:', error);
    return false;
  }
}

/**
 * Remove FCM token from Firestore
 */
export async function removeFCMTokenFromFirestore(
  userId: string,
  token: string
): Promise<boolean> {
  try {
    const tokenDocRef = doc(db, 'users', userId, 'pushTokens', token);
    await deleteDoc(tokenDocRef);
    console.log('[Push] Token removed from Firestore');
    return true;
  } catch (error) {
    console.error('[Push] Error removing token from Firestore:', error);
    return false;
  }
}

/**
 * Subscribe to push notifications
 * Complete flow: request permission -> get token -> save to Firestore
 */
export async function subscribeToPushNotifications(
  userId: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  // Check iOS installation requirement
  if (isIOSRequiringInstallation()) {
    return {
      success: false,
      error: 'ios_installation_required',
    };
  }

  // Request permission
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    return {
      success: false,
      error: permission === 'denied' ? 'permission_denied' : 'permission_dismissed',
    };
  }

  // Get FCM token
  const token = await getFCMToken();
  if (!token) {
    return {
      success: false,
      error: 'token_error',
    };
  }

  // Save to Firestore
  const saved = await saveFCMTokenToFirestore(userId, token);
  if (!saved) {
    return {
      success: false,
      error: 'save_error',
    };
  }

  return {
    success: true,
    token,
  };
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(
  userId: string
): Promise<boolean> {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) {
      return false;
    }

    // Get current token
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      return false;
    }

    const swRegistration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    if (!swRegistration) {
      return false;
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swRegistration,
    });

    if (token) {
      // Remove from Firestore
      await removeFCMTokenFromFirestore(userId, token);

      // Delete token from FCM
      await deleteToken(messaging);
    }

    console.log('[Push] Successfully unsubscribed from push notifications');
    return true;
  } catch (error) {
    console.error('[Push] Error unsubscribing:', error);
    return false;
  }
}

/**
 * Set up foreground message handler
 * This is called when the app is in the foreground and receives a message
 */
export function setupForegroundMessageHandler(
  callback: (payload: {
    title?: string;
    body?: string;
    data?: Record<string, string>;
  }) => void
): (() => void) | null {
  if (typeof window === 'undefined') {
    return null;
  }

  getMessagingInstance().then((messaging) => {
    if (!messaging) {
      return;
    }

    onMessage(messaging, (payload) => {
      console.log('[Push] Foreground message received:', payload);

      callback({
        title: payload.notification?.title,
        body: payload.notification?.body,
        data: payload.data as Record<string, string>,
      });
    });
  });

  // Return cleanup function
  return () => {
    // Note: Firebase doesn't provide an official way to remove message listeners
    // This is a placeholder for future cleanup if needed
  };
}

/**
 * Check if user has an active push subscription
 */
export async function hasActivePushSubscription(userId: string): Promise<boolean> {
  try {
    const token = await getFCMToken();
    if (!token) {
      return false;
    }

    const tokenDocRef = doc(db, 'users', userId, 'pushTokens', token);
    const tokenDoc = await getDoc(tokenDocRef);

    return tokenDoc.exists();
  } catch (error) {
    console.error('[Push] Error checking subscription:', error);
    return false;
  }
}
