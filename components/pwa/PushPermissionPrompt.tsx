'use client';

/**
 * PushPermissionPrompt Component
 * Displays a banner prompting users to enable push notifications
 * Follows Swan design system with gradual, non-intrusive approach
 */

import { useState, useEffect } from 'react';
import { usePushPermission, getPermissionStateMessage } from '@/hooks/usePushPermission';
import { useSettingsStore } from '@/store/settingsStore';
import Button from '@/components/ui/Button';

const DISMISSED_KEY = 'swan-push-prompt-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

interface PushPermissionPromptProps {
  /** Variant of the prompt display */
  variant?: 'banner' | 'card' | 'inline';
  /** Called when permission is successfully granted */
  onSubscribed?: () => void;
  /** Called when the prompt is dismissed */
  onDismissed?: () => void;
}

export function PushPermissionPrompt({
  variant = 'banner',
  onSubscribed,
  onDismissed,
}: PushPermissionPromptProps) {
  const {
    permissionState,
    isSupported,
    needsIOSInstallation,
    isLoading,
    isSubscribed,
    subscribe,
    error,
  } = usePushPermission();

  const { updateNotifications } = useSettingsStore();

  const [isVisible, setIsVisible] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Check if prompt should be shown
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Don't show if:
    // - Not supported
    // - Already subscribed (via permissionState or isSubscribed flag)
    // - Permission denied (can't request again)
    // - iOS needs installation (show install guide instead)
    // - Still loading
    if (
      !isSupported ||
      permissionState === 'subscribed' ||
      isSubscribed ||
      permissionState === 'denied' ||
      permissionState === 'unsupported' ||
      needsIOSInstallation ||
      isLoading
    ) {
      setIsVisible(false);
      return;
    }

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem(DISMISSED_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissedTime < DISMISS_DURATION) {
        setIsVisible(false);
        return;
      }
    }

    // Show prompt for 'prompt' or 'granted' (not yet subscribed) states
    setIsVisible(permissionState === 'prompt' || permissionState === 'granted');
  }, [permissionState, isSupported, needsIOSInstallation, isLoading, isSubscribed]);

  const handleSubscribe = async () => {
    setIsSubscribing(true);

    try {
      const result = await subscribe();

      if (result.success) {
        // 設定ストアも同期して更新
        updateNotifications({ enabled: true });
        setIsVisible(false);
        onSubscribed?.();
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    setIsVisible(false);
    onDismissed?.();
  };

  if (!isVisible) {
    return null;
  }

  // Banner variant - full width at top/bottom
  if (variant === 'banner') {
    return (
      <div className="relative bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl p-4 shadow-lg">
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="閉じる"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex items-start gap-3 pr-6">
          {/* Bell icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base mb-1">
              通知を有効にしませんか？
            </h3>
            <p className="text-sm text-white/90 mb-3">
              毎朝の励ましメッセージや、吸いたくなる時間帯の先回りアラートをお届けします
            </p>

            {error && (
              <p className="text-sm text-red-200 mb-2">
                {error}
              </p>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={handleSubscribe}
              disabled={isSubscribing}
              className="bg-white text-teal-600 hover:bg-white/90"
            >
              {isSubscribing ? '設定中...' : '通知を有効にする'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Card variant - standalone card
  if (variant === 'card') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-teal-600 dark:text-teal-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white">
            通知設定
          </h3>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {getPermissionStateMessage(permissionState)}
        </p>

        {error && (
          <p className="text-sm text-red-500 mb-3">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubscribe}
            disabled={isSubscribing}
          >
            {isSubscribing ? '設定中...' : '有効にする'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
          >
            後で
          </Button>
        </div>
      </div>
    );
  }

  // Inline variant - minimal inline display
  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
      <div className="flex items-center gap-2">
        <svg
          className="w-5 h-5 text-teal-600 dark:text-teal-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <span className="text-sm text-teal-700 dark:text-teal-300">
          通知を有効にする
        </span>
      </div>
      <Button
        variant="primary"
        size="sm"
        onClick={handleSubscribe}
        disabled={isSubscribing}
      >
        {isSubscribing ? '...' : '有効化'}
      </Button>
    </div>
  );
}

export default PushPermissionPrompt;
