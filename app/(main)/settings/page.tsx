'use client';

import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useSettingsStore } from '@/store/settingsStore';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { GoalSection } from '@/components/settings/GoalSection';
import { CostSection } from '@/components/settings/CostSection';
import { NotificationSection } from '@/components/settings/NotificationSection';
import { AccountSection } from '@/components/settings/AccountSection';
import { saveSettings, getSettings } from '@/lib/indexeddb';
import { NotificationSettings, GoalSettings, AppSettings } from '@/types';

/**
 * 設定ページ
 *
 * - 目標設定（日次目標本数、ステップダウン）
 * - コスト設定（タバコ価格、節約計算）
 * - 通知設定（各種通知のON/OFF、プライバシーモード）
 * - アカウント管理（サインアウト、アカウントリンク）
 *
 * データ永続化:
 * - IndexedDB（オフライン対応）
 * - Firestore（オンライン時に自動同期）
 */
const SettingsPage: FC = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const {
    settings,
    setSettings,
    updateNotifications,
    updateGoals,
    updateApp,
    getDefaultSettings,
  } = useSettingsStore();
  const { isInstalled, isIOS } = useInstallPrompt();

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // 認証チェック
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  // 設定の初期ロード
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.uid) return;

      try {
        // IndexedDBから設定を読み込み
        const storedSettings = await getSettings(user.uid);

        if (storedSettings) {
          setSettings(storedSettings);
        } else {
          // 設定が存在しない場合はデフォルト設定を作成
          const defaultSettings = getDefaultSettings(user.uid);
          setSettings(defaultSettings);
          await saveSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, [user?.uid, setSettings, getDefaultSettings]);

  // 設定を保存（IndexedDB + Firestore）
  const handleSave = async () => {
    if (!user?.uid) return;

    // Zustandの状態更新は非同期なので、最新の状態を取得
    // 少し遅延を入れて確実に最新の状態を取得
    await new Promise(resolve => setTimeout(resolve, 0));
    const currentSettings = useSettingsStore.getState().settings;

    if (!currentSettings) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      await saveSettings(currentSettings);
      setSaveMessage('保存しました ✓');

      // 3秒後にメッセージを消す
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveMessage('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  // ローディング状態
  if (authLoading || !user || !settings) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-24">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="px-4 py-3 max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white min-h-[44px] min-w-[44px]"
            aria-label="戻る"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-medium">戻る</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            設定
          </h1>
          <div className="w-16"></div> {/* スペーサー */}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="px-4 py-6 max-w-lg mx-auto space-y-4">
        {/* 保存メッセージ */}
        {saveMessage && (
          <div
            className={`
              p-4 rounded-xl text-center font-medium
              ${
                saveMessage.includes('成功') || saveMessage.includes('✓')
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
              }
            `}
          >
            {saveMessage}
          </div>
        )}

        {/* 目標設定セクション */}
        <GoalSection
          goals={settings.goals}
          onUpdate={(goals) => {
            updateGoals(goals);
            handleSave();
          }}
        />

        {/* コスト設定セクション */}
        <CostSection
          app={settings.app}
          onUpdate={(app) => {
            updateApp(app);
            handleSave();
          }}
        />

        {/* 通知設定セクション */}
        <NotificationSection
          notifications={settings.notifications}
          onUpdate={(notifications) => {
            updateNotifications(notifications);
            handleSave();
          }}
        />

        {/* アカウント管理セクション */}
        <AccountSection />

        {/* インストールガイドセクション（iOSでまだインストールしていない場合） */}
        {isIOS && !isInstalled && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow">
            <div className="flex items-start gap-4">
              <div className="text-4xl flex-shrink-0">🦢</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  ホーム画面に追加
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  アプリのように使えて、通知も受け取れるようになります
                </p>
                <Link
                  href="/install-guide"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors min-h-[44px]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  インストール方法を見る
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* アプリ情報 */}
        <div className="pt-8 pb-4 text-center space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Swan - 禁煙・減煙サポート
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Version 1.0.0
          </p>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
