'use client';

import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UseInstallPromptReturn {
  /** PWAがインストール可能かどうか */
  isInstallable: boolean;
  /** PWAが既にインストールされているかどうか */
  isInstalled: boolean;
  /** iOS Safariかどうか */
  isIOS: boolean;
  /** インストールプロンプトを表示する（Android/Chromeのみ） */
  promptInstall: () => Promise<boolean>;
  /** インストールガイドを表示すべきかどうか */
  shouldShowGuide: boolean;
  /** インストールガイドを非表示にする */
  dismissGuide: () => void;
}

const INSTALL_GUIDE_DISMISSED_KEY = 'swan_install_guide_dismissed';
const INSTALL_GUIDE_COMPLETED_KEY = 'swan_install_guide_completed';

/**
 * PWAインストール状態を管理するカスタムフック
 *
 * - iOS Safari: ホーム画面追加の手動ガイドを表示
 * - Android/Chrome: ネイティブインストールプロンプトを使用
 * - インストール済み検出: display-mode メディアクエリを使用
 */
export const useInstallPrompt = (): UseInstallPromptReturn => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [shouldShowGuide, setShouldShowGuide] = useState(false);

  // iOS Safari かどうかを判定
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(userAgent) &&
      !/(crios|fxios|opios|edgios)/.test(userAgent); // Chrome, Firefox, Opera, Edge for iOS を除外

    setIsIOS(isIOSDevice);
  }, []);

  // PWAがインストール済みかどうかを判定
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. display-mode が standalone の場合
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    // 2. iOS Safari の場合は navigator.standalone を確認
    // @ts-ignore - iOS Safariの独自プロパティ
    const isIOSStandalone = window.navigator.standalone === true;

    setIsInstalled(isStandalone || isIOSStandalone);
  }, []);

  // beforeinstallprompt イベントをキャッチ（Android/Chromeのみ）
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: Event) => {
      // デフォルトのプロンプトを防ぐ
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // インストール完了イベントを監視
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShouldShowGuide(false);
      localStorage.setItem(INSTALL_GUIDE_COMPLETED_KEY, 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // インストールガイドを表示すべきかどうかを判定
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 既にインストール済み
    if (isInstalled) {
      setShouldShowGuide(false);
      return;
    }

    // ユーザーがガイドを非表示にした
    const isDismissed = localStorage.getItem(INSTALL_GUIDE_DISMISSED_KEY) === 'true';
    if (isDismissed) {
      setShouldShowGuide(false);
      return;
    }

    // ガイドを完了した
    const isCompleted = localStorage.getItem(INSTALL_GUIDE_COMPLETED_KEY) === 'true';
    if (isCompleted) {
      setShouldShowGuide(false);
      return;
    }

    // iOSの場合、初回アクセス時にガイドを表示
    if (isIOS) {
      setShouldShowGuide(true);
    }
  }, [isInstalled, isIOS]);

  /**
   * インストールプロンプトを表示（Android/Chromeのみ）
   */
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.warn('Install prompt is not available');
      return false;
    }

    try {
      // プロンプトを表示
      await deferredPrompt.prompt();

      // ユーザーの選択を待つ
      const { outcome } = await deferredPrompt.userChoice;

      // プロンプトを使い終わったのでクリア
      setDeferredPrompt(null);

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        return true;
      } else {
        console.log('User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    }
  }, [deferredPrompt]);

  /**
   * インストールガイドを非表示にする
   */
  const dismissGuide = useCallback(() => {
    setShouldShowGuide(false);
    localStorage.setItem(INSTALL_GUIDE_DISMISSED_KEY, 'true');
  }, []);

  return {
    isInstallable: !!deferredPrompt || isIOS,
    isInstalled,
    isIOS,
    promptInstall,
    shouldShowGuide,
    dismissGuide,
  };
};
