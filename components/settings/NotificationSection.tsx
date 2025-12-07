'use client';

import { FC, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { usePushPermission, getPermissionStateMessage } from '@/hooks/usePushPermission';
import { NotificationSettings } from '@/types';

interface NotificationSectionProps {
  notifications: NotificationSettings;
  onUpdate: (notifications: Partial<NotificationSettings>) => void;
}

/**
 * 通知設定セクション
 *
 * - 通知の有効/無効
 * - 各種通知タイプのON/OFF
 * - プライバシーモード
 * - サイレント時間帯
 */
export const NotificationSection: FC<NotificationSectionProps> = ({
  notifications,
  onUpdate,
}) => {
  const {
    permissionState,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  } = usePushPermission();

  // 実際のPush通知購読状態とsettingsを同期
  useEffect(() => {
    // 購読済みだがsettingsでは無効になっている場合、settingsを更新
    if (isSubscribed && !notifications.enabled) {
      onUpdate({ enabled: true });
    }
    // 購読していないがsettingsでは有効になっている場合、settingsを更新
    // ただし、ローディング中は更新しない
    if (!isLoading && !isSubscribed && notifications.enabled && permissionState !== 'subscribed') {
      onUpdate({ enabled: false });
    }
  }, [isSubscribed, notifications.enabled, isLoading, permissionState, onUpdate]);

  // 通知有効化スイッチの変更ハンドラー
  const handleNotificationToggle = async (checked: boolean) => {
    if (checked) {
      // 通知を有効にする場合はPush通知を購読
      const result = await subscribe();
      if (result.success) {
        onUpdate({ enabled: true });
      }
    } else {
      // 通知を無効にする場合はPush通知を解除
      const success = await unsubscribe();
      if (success) {
        onUpdate({ enabled: false });
      }
    }
  };

  // 現在有効な通知タイプのみ表示（朝の通知のみ稼働中）
  const notificationTypes = [
    {
      id: 'morningBriefing',
      label: 'モーニング・ブリーフィング',
      description: '毎朝7時に励ましメッセージをお届け',
      emoji: '🌅',
    },
  ];

  // 実際の通知状態（Push通知の購読状態を優先）
  const isNotificationEnabled = isSubscribed || notifications.enabled;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            🔔 通知設定
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Push通知のカスタマイズ
          </p>
        </div>

        {/* メインスイッチ */}
        <div className="pb-4 border-b border-gray-100 dark:border-slate-700">
          <label className="flex items-center justify-between min-h-[44px]">
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                通知を有効にする
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isLoading ? '確認中...' : getPermissionStateMessage(permissionState)}
              </p>
            </div>
            <Switch
              checked={isNotificationEnabled}
              onChange={handleNotificationToggle}
              aria-label="通知を有効にする"
              disabled={isLoading || permissionState === 'denied' || permissionState === 'unsupported'}
            />
          </label>
          {permissionState === 'denied' && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
              ブラウザの設定から通知を許可してください
            </p>
          )}
        </div>

        {/* 各種通知タイプ（無効時はグレーアウト表示） */}
        <div className={`space-y-3 ${!isNotificationEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          {notificationTypes.map((type) => (
            <label
              key={type.id}
              className="flex items-center justify-between min-h-[44px] cursor-pointer"
            >
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl">{type.emoji}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {type.label}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {type.description}
                  </p>
                </div>
              </div>
              <Switch
                checked={notifications[type.id as keyof NotificationSettings] as boolean}
                onChange={(checked) => onUpdate({ [type.id]: checked })}
                aria-label={type.label}
                disabled={!isNotificationEnabled}
              />
            </label>
          ))}
        </div>

        {/* プライバシーモード（無効時はグレーアウト表示） */}
        <div className={`pt-4 border-t border-gray-100 dark:border-slate-700 ${!isNotificationEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <label className="flex items-center justify-between min-h-[44px] cursor-pointer">
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                プライバシーモード
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ロック画面で詳細を表示しない
              </p>
            </div>
            <Switch
              checked={notifications.privacyMode}
              onChange={(checked) => onUpdate({ privacyMode: checked })}
              aria-label="プライバシーモード"
              disabled={!isNotificationEnabled}
            />
          </label>
        </div>

        {/* サイレント時間帯（無効時はグレーアウト表示） */}
        <div className={`pt-4 border-t border-gray-100 dark:border-slate-700 space-y-3 ${!isNotificationEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            サイレント時間帯
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="quietHoursStart"
                className="block text-xs text-gray-600 dark:text-gray-400"
              >
                開始時刻
              </label>
              <input
                id="quietHoursStart"
                type="time"
                value={notifications.quietHoursStart}
                onChange={(e) => onUpdate({ quietHoursStart: e.target.value })}
                disabled={!isNotificationEnabled}
                className="
                  w-full px-3 py-2
                  bg-white dark:bg-slate-700
                  border-2 border-gray-300 dark:border-slate-600
                  rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                  min-h-[44px]
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="quietHoursEnd"
                className="block text-xs text-gray-600 dark:text-gray-400"
              >
                終了時刻
              </label>
              <input
                id="quietHoursEnd"
                type="time"
                value={notifications.quietHoursEnd}
                onChange={(e) => onUpdate({ quietHoursEnd: e.target.value })}
                disabled={!isNotificationEnabled}
                className="
                  w-full px-3 py-2
                  bg-white dark:bg-slate-700
                  border-2 border-gray-300 dark:border-slate-600
                  rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                  min-h-[44px]
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            この時間帯は通知が届きません
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
