/**
 * usePushPermission Hook
 * React hook for managing push notification permissions and subscriptions
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUserStore } from '@/store/userStore';
import {
  isPushNotificationSupported,
  isIOSRequiringInstallation,
  isRunningAsInstalledPWA,
  getNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  hasActivePushSubscription,
  setupForegroundMessageHandler,
} from '@/lib/push/subscription';

export type PushPermissionState =
  | 'loading'           // 初期読み込み中
  | 'unsupported'       // ブラウザが非対応
  | 'ios-not-installed' // iOSでホーム画面追加が必要
  | 'prompt'            // 許可リクエスト可能
  | 'granted'           // 許可済み
  | 'denied'            // 拒否済み
  | 'subscribed';       // 購読完了

interface UsePushPermissionReturn {
  /** Current permission state */
  permissionState: PushPermissionState;
  /** Whether push is supported in this browser */
  isSupported: boolean;
  /** Whether running as installed PWA */
  isInstalled: boolean;
  /** Whether iOS and needs installation */
  needsIOSInstallation: boolean;
  /** Whether currently loading */
  isLoading: boolean;
  /** Whether the user has an active subscription */
  isSubscribed: boolean;
  /** Subscribe to push notifications */
  subscribe: () => Promise<{ success: boolean; error?: string }>;
  /** Unsubscribe from push notifications */
  unsubscribe: () => Promise<boolean>;
  /** Refresh the permission state */
  refresh: () => Promise<void>;
  /** Last error message */
  error: string | null;
}

export function usePushPermission(): UsePushPermissionReturn {
  const { user } = useUserStore();
  const [permissionState, setPermissionState] = useState<PushPermissionState>('loading');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derived states
  const isSupported = typeof window !== 'undefined' && isPushNotificationSupported();
  const isInstalled = typeof window !== 'undefined' && isRunningAsInstalledPWA();
  const needsIOSInstallation = typeof window !== 'undefined' && isIOSRequiringInstallation();

  /**
   * Determine the current permission state
   */
  const determineState = useCallback(async (): Promise<PushPermissionState> => {
    // Check browser support
    if (!isPushNotificationSupported()) {
      return 'unsupported';
    }

    // Check iOS installation requirement
    if (isIOSRequiringInstallation()) {
      return 'ios-not-installed';
    }

    // Check current permission
    const permission = getNotificationPermission();

    if (permission === 'denied') {
      return 'denied';
    }

    if (permission === 'granted') {
      // Check if actually subscribed
      if (user?.uid) {
        const hasSubscription = await hasActivePushSubscription(user.uid);
        if (hasSubscription) {
          return 'subscribed';
        }
      }
      return 'granted';
    }

    // Permission is 'default' (not yet asked)
    return 'prompt';
  }, [user?.uid]);

  /**
   * Refresh the permission state
   */
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const state = await determineState();
      setPermissionState(state);
      setIsSubscribed(state === 'subscribed');
    } catch (err) {
      console.error('[usePushPermission] Error refreshing state:', err);
      setError('状態の更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [determineState]);

  /**
   * Subscribe to push notifications
   */
  const subscribe = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!user?.uid) {
      return { success: false, error: 'ログインが必要です' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await subscribeToPushNotifications(user.uid);

      if (result.success) {
        setPermissionState('subscribed');
        setIsSubscribed(true);
        return { success: true };
      } else {
        // Map error codes to user-friendly messages
        const errorMessages: Record<string, string> = {
          'ios_installation_required': 'iOSでは「ホーム画面に追加」が必要です',
          'permission_denied': '通知が拒否されました。ブラウザの設定から許可してください',
          'permission_dismissed': '通知の許可がキャンセルされました',
          'token_error': 'トークンの取得に失敗しました',
          'save_error': 'サーバーへの保存に失敗しました',
        };

        const errorMessage = errorMessages[result.error || ''] || '通知の設定に失敗しました';
        setError(errorMessage);
        await refresh();

        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error('[usePushPermission] Subscribe error:', err);
      const errorMessage = '通知の設定中にエラーが発生しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, refresh]);

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!user?.uid) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await unsubscribeFromPushNotifications(user.uid);

      if (success) {
        setPermissionState('granted');
        setIsSubscribed(false);
      } else {
        setError('通知の解除に失敗しました');
      }

      return success;
    } catch (err) {
      console.error('[usePushPermission] Unsubscribe error:', err);
      setError('通知の解除中にエラーが発生しました');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Initial state check
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    refresh();
  }, [refresh]);

  // Set up foreground message handler
  useEffect(() => {
    if (typeof window === 'undefined' || !isSubscribed) {
      return;
    }

    const cleanup = setupForegroundMessageHandler((payload) => {
      console.log('[usePushPermission] Foreground message:', payload);

      // Show a toast or update UI when receiving foreground messages
      // This could be integrated with a toast notification system
      if (payload.title && Notification.permission === 'granted') {
        // Show browser notification for foreground messages too
        new Notification(payload.title, {
          body: payload.body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
        });
      }
    });

    return () => {
      cleanup?.();
    };
  }, [isSubscribed]);

  return {
    permissionState,
    isSupported,
    isInstalled,
    needsIOSInstallation,
    isLoading,
    isSubscribed,
    subscribe,
    unsubscribe,
    refresh,
    error,
  };
}

/**
 * Get user-friendly status message for the current permission state
 */
export function getPermissionStateMessage(state: PushPermissionState): string {
  const messages: Record<PushPermissionState, string> = {
    'loading': '読み込み中...',
    'unsupported': 'このブラウザは通知に対応していません',
    'ios-not-installed': 'ホーム画面に追加すると通知を受け取れます',
    'prompt': '通知を有効にすると、励ましメッセージを受け取れます',
    'granted': '通知を有効にできます',
    'denied': '通知がブロックされています',
    'subscribed': '通知が有効です',
  };

  return messages[state];
}
