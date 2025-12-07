'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuth } from '@/hooks/useAuth';
import { useRecords } from '@/hooks/useRecords';
import { useAchievements } from '@/hooks/useAchievements';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import GoalHeader from '@/components/dashboard/GoalHeader';
import RecordButton from '@/components/dashboard/RecordButton';
import RandomTip from '@/components/dashboard/RandomTip';
import { AchievementPanel } from '@/components/dashboard/AchievementPanel';
import { InstallPromptBanner } from '@/components/install/InstallPromptBanner';
import { PushPermissionPrompt } from '@/components/pwa/PushPermissionPrompt';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { SOSModal } from '@/components/sos/SOSModal';
import { RecordType, SituationTag, SmokingRecord } from '@/types';
import { SITUATION_TAGS, getTagLabel, getTagEmoji } from '@/constants/tags';
import { getRandomMessage, RESISTANCE_MESSAGES, NEUTRAL_MESSAGES } from '@/constants/messages';

export default function DashboardPage() {
  const { user } = useAuth();
  const { settings } = useSettingsStore();
  const {
    todayRecords,
    getTodayCount,
    createRecord,
    deleteRecord,
    isLoading,
    syncPending,
    isOnline,
  } = useRecords();
  const { stats: achievementStats, isLoading: achievementsLoading, refresh: refreshAchievements } = useAchievements();
  const { shouldShowGuide, dismissGuide } = useInstallPrompt();

  // Modal states
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [pendingRecordType, setPendingRecordType] = useState<RecordType | null>(null);
  const [selectedTags, setSelectedTags] = useState<SituationTag[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 後から記録用の状態
  const [isBackdatedRecord, setIsBackdatedRecord] = useState(false);
  const [customDateTime, setCustomDateTime] = useState<string>('');

  // 履歴削除用の状態
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<SmokingRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get counts
  const smokedCount = getTodayCount('smoked');
  const cravedCount = getTodayCount('craved');
  const resistedCount = getTodayCount('resisted');

  // Get daily goal
  const dailyGoal = settings?.goals.dailyTarget ?? 20;

  // Auto-hide feedback message
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => {
        setFeedbackMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  // Handle record button click
  const handleRecordClick = (type: RecordType) => {
    if (type === 'craved') {
      // Show SOS modal for cravings
      setPendingRecordType(type);
      setShowSOSModal(true);
    } else {
      // Show tag modal for other types
      setPendingRecordType(type);
      setShowTagModal(true);
    }
  };

  // Handle "just record" from SOS modal
  const handleRecordCraving = () => {
    setPendingRecordType('craved');
    setShowTagModal(true);
  };

  // Toggle tag selection
  const toggleTag = (tag: SituationTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Submit record with tags
  const submitRecord = async () => {
    if (!user || !pendingRecordType || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // カスタムタイムスタンプの計算（後から記録の場合）
      let customTimestamp: number | undefined;
      if (isBackdatedRecord && customDateTime) {
        customTimestamp = new Date(customDateTime).getTime();
      }

      // Create record (saves to IndexedDB and syncs to Firestore)
      await createRecord(pendingRecordType, selectedTags, customTimestamp);

      // Show feedback message
      if (pendingRecordType === 'resisted') {
        setFeedbackMessage(getRandomMessage(RESISTANCE_MESSAGES));
      } else if (pendingRecordType === 'smoked') {
        setFeedbackMessage(getRandomMessage(NEUTRAL_MESSAGES));
      } else if (pendingRecordType === 'craved') {
        setFeedbackMessage('記録しました');
      }

      // Refresh achievements panel to show updated stats
      refreshAchievements();

      // Close modal and reset states
      setShowTagModal(false);
      setPendingRecordType(null);
      setSelectedTags([]);
      setIsBackdatedRecord(false);
      setCustomDateTime('');
    } catch (error) {
      console.error('Failed to create record:', error);
      setFeedbackMessage('記録の保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle record deletion
  const handleDeleteRecord = async () => {
    if (!recordToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteRecord(recordToDelete.id);
      setFeedbackMessage('記録を削除しました');
      refreshAchievements();
      setRecordToDelete(null);
    } catch (error) {
      console.error('Failed to delete record:', error);
      setFeedbackMessage('削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle app refresh (Service Worker update)
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Service Workerの更新をチェック
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          // 新しいService Workerがあれば更新
          await registration.update();

          // waiting状態のService Workerがあれば即座にアクティベート
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      }

      // ページをリロード
      window.location.reload();
    } catch (error) {
      console.error('Failed to refresh:', error);
      // エラーが発生してもリロードは試みる
      window.location.reload();
    }
  };

  // Get record type label
  const getRecordTypeLabel = (type: RecordType) => {
    switch (type) {
      case 'smoked': return '吸った';
      case 'craved': return '吸いたかった';
      case 'resisted': return '我慢できた';
    }
  };

  // Get record type color
  const getRecordTypeColor = (type: RecordType) => {
    switch (type) {
      case 'smoked': return 'text-neutral-600 dark:text-neutral-400';
      case 'craved': return 'text-warning';
      case 'resisted': return 'text-success';
    }
  };

  // Format time from timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
            ダッシュボード
          </h1>
          <div className="flex items-center gap-2">
            {/* 更新ボタン */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center justify-center min-h-[44px] min-w-[44px] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors disabled:opacity-50"
              aria-label="アプリを更新"
            >
              <svg
                className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <a
              href="https://forms.gle/xZAiA2jSB5mfUmkL7"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center min-h-[44px] min-w-[44px] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
              aria-label="フィードバック"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </a>
            <Link
              href="/history"
              className="flex items-center justify-center min-h-[44px] min-w-[44px] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
              aria-label="履歴"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </Link>
            <Link
              href="/settings"
              className="flex items-center justify-center min-h-[44px] min-w-[44px] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
              aria-label="設定"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Offline/Sync Status */}
        {!isOnline && (
          <div className="bg-warning/10 border border-warning text-warning-dark dark:text-warning px-4 py-2 rounded-lg text-sm text-center">
            オフライン - データは後で同期されます
          </div>
        )}
        {syncPending && isOnline && (
          <div className="bg-primary/10 border border-primary text-primary-dark dark:text-primary px-4 py-2 rounded-lg text-sm text-center">
            同期中...
          </div>
        )}

        {/* Install Prompt Banner */}
        {shouldShowGuide && (
          <InstallPromptBanner onDismiss={dismissGuide} />
        )}

        {/* Push Notification Permission Prompt */}
        <PushPermissionPrompt variant="banner" />

        {/* Goal Header - タップで履歴表示 */}
        <button
          onClick={() => setShowHistoryModal(true)}
          className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-2xl"
          aria-label="今日の履歴を表示"
        >
          <GoalHeader dailyGoal={dailyGoal} smokedToday={smokedCount} />
        </button>

        {/* Random Tip */}
        <RandomTip />

        {/* Achievement Panel (B-03) */}
        {!achievementsLoading && achievementStats.daysTracking > 0 && (
          <AchievementPanel
            totalMoneySaved={achievementStats.totalMoneySaved}
            totalMinutesSaved={achievementStats.totalMinutesSaved}
            totalResisted={achievementStats.totalResisted}
            daysTracking={achievementStats.daysTracking}
          />
        )}

        {/* Record Buttons */}
        <div className="grid grid-cols-1 gap-4">
          <RecordButton
            type="smoked"
            count={smokedCount}
            onClick={() => handleRecordClick('smoked')}
          />
          <RecordButton
            type="craved"
            count={cravedCount}
            onClick={() => handleRecordClick('craved')}
          />
          <RecordButton
            type="resisted"
            count={resistedCount}
            onClick={() => handleRecordClick('resisted')}
          />
        </div>

        {/* Stats Preview - タップで履歴表示 */}
        <button
          onClick={() => setShowHistoryModal(true)}
          className="w-full text-left bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="今日の履歴を表示"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              今日の記録
            </h3>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              タップで詳細
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold tabular-nums text-neutral-600 dark:text-neutral-400">
                {smokedCount}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">
                吸った
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold tabular-nums text-warning">
                {cravedCount}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">
                吸いたかった
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold tabular-nums text-success">
                {resistedCount}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">
                我慢できた
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* SOS Modal */}
      <SOSModal
        isOpen={showSOSModal}
        onClose={() => {
          setShowSOSModal(false);
          setPendingRecordType(null);
        }}
        onRecordCraving={handleRecordCraving}
      />

      {/* Tag Selection Modal */}
      <Modal
        isOpen={showTagModal}
        onClose={() => {
          setShowTagModal(false);
          setPendingRecordType(null);
          setSelectedTags([]);
          setIsBackdatedRecord(false);
          setCustomDateTime('');
        }}
        title="状況を選択（任意）"
        size="md"
        closeOnBackdropClick={false}
        closeOnEscape={false}
        showCloseButton={false}
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            どんな状況でしたか？（複数選択可）
          </p>

          {/* Tag buttons */}
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(SITUATION_TAGS).map((tag) => {
              const situationTag = tag as SituationTag;
              const isSelected = selectedTags.includes(situationTag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(situationTag)}
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all
                    ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }
                  `}
                >
                  <span className="text-xl">{getTagEmoji(situationTag)}</span>
                  <span className="text-sm font-medium">
                    {getTagLabel(situationTag)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 後から記録セクション */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setIsBackdatedRecord(!isBackdatedRecord)}
              className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            >
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${isBackdatedRecord ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                後から記録
              </span>
            </button>

            {/* 日時入力フィールド（展開時） */}
            {isBackdatedRecord && (
              <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg animate-in fade-in duration-200">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  記録する日時
                </label>
                <input
                  type="datetime-local"
                  value={customDateTime}
                  onChange={(e) => setCustomDateTime(e.target.value)}
                  max={new Date().toISOString().slice(0, 16)}
                  className="
                    w-full px-3 py-2
                    bg-white dark:bg-neutral-700
                    border-2 border-neutral-300 dark:border-neutral-600
                    rounded-lg
                    text-neutral-900 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                    min-h-[44px]
                  "
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  過去の日時を選択して記録できます
                </p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setShowTagModal(false);
                setPendingRecordType(null);
                setSelectedTags([]);
                setIsBackdatedRecord(false);
                setCustomDateTime('');
              }}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={submitRecord}
              disabled={isSubmitting || (isBackdatedRecord && !customDateTime)}
              loading={isSubmitting}
            >
              記録する
            </Button>
          </div>
        </div>
      </Modal>

      {/* History Modal - 今日の履歴一覧 */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="今日の履歴"
        size="md"
      >
        <div className="space-y-2">
          {todayRecords.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              まだ記録がありません
            </div>
          ) : (
            <>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                タップして削除できます
              </p>
              {[...todayRecords]
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((record) => (
                  <button
                    key={record.id}
                    onClick={() => setRecordToDelete(record)}
                    className="w-full flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {record.type === 'smoked' ? '🚬' : record.type === 'craved' ? '😣' : '💪'}
                      </span>
                      <div>
                        <div className={`font-medium ${getRecordTypeColor(record.type)}`}>
                          {getRecordTypeLabel(record.type)}
                        </div>
                        {record.tags.length > 0 && (
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            {record.tags.map(tag => getTagLabel(tag)).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400 tabular-nums">
                        {formatTime(record.timestamp)}
                      </span>
                      <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                  </button>
                ))}
            </>
          )}
        </div>
        <div className="mt-6">
          <Button
            variant="outline"
            fullWidth
            onClick={() => setShowHistoryModal(false)}
          >
            閉じる
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={recordToDelete !== null}
        onClose={() => setRecordToDelete(null)}
        title="記録を削除"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-300">
            この記録を削除しますか？
          </p>
          {recordToDelete && (
            <div className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {recordToDelete.type === 'smoked' ? '🚬' : recordToDelete.type === 'craved' ? '😣' : '💪'}
                </span>
                <div>
                  <div className={`font-medium ${getRecordTypeColor(recordToDelete.type)}`}>
                    {getRecordTypeLabel(recordToDelete.type)}
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {formatTime(recordToDelete.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setRecordToDelete(null)}
              disabled={isDeleting}
            >
              キャンセル
            </Button>
            <Button
              variant="error"
              fullWidth
              onClick={handleDeleteRecord}
              disabled={isDeleting}
              loading={isDeleting}
            >
              削除する
            </Button>
          </div>
        </div>
      </Modal>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-6 py-3 rounded-full shadow-lg">
            {feedbackMessage}
          </div>
        </div>
      )}
    </div>
  );
}
