'use client';

import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuth } from '@/hooks/useAuth';
import { useRecords } from '@/hooks/useRecords';
import GoalHeader from '@/components/dashboard/GoalHeader';
import RecordButton from '@/components/dashboard/RecordButton';
import RandomTip from '@/components/dashboard/RandomTip';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { RecordType, SituationTag } from '@/types';
import { SITUATION_TAGS, getTagLabel, getTagEmoji } from '@/constants/tags';
import { getRandomMessage, RESISTANCE_MESSAGES, NEUTRAL_MESSAGES } from '@/constants/messages';

export default function DashboardPage() {
  const { user } = useAuth();
  const { settings } = useSettingsStore();
  const {
    todayRecords,
    getTodayCount,
    createRecord,
    isLoading,
    syncPending,
    isOnline,
  } = useRecords();

  // Modal states
  const [showTagModal, setShowTagModal] = useState(false);
  const [pendingRecordType, setPendingRecordType] = useState<RecordType | null>(null);
  const [selectedTags, setSelectedTags] = useState<SituationTag[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // SOS flow - to be implemented
      // For now, just show tag modal
      setPendingRecordType(type);
      setShowTagModal(true);
    } else {
      // Show tag modal for tagging
      setPendingRecordType(type);
      setShowTagModal(true);
    }
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
      // Create record (saves to IndexedDB and syncs to Firestore)
      await createRecord(pendingRecordType, selectedTags);

      // Show feedback message
      if (pendingRecordType === 'resisted') {
        setFeedbackMessage(getRandomMessage(RESISTANCE_MESSAGES));
      } else if (pendingRecordType === 'smoked') {
        setFeedbackMessage(getRandomMessage(NEUTRAL_MESSAGES));
      }

      // Close modal
      setShowTagModal(false);
      setPendingRecordType(null);
      setSelectedTags([]);
    } catch (error) {
      console.error('Failed to create record:', error);
      setFeedbackMessage('記録の保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pb-20">
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

        {/* Goal Header */}
        <GoalHeader dailyGoal={dailyGoal} smokedToday={smokedCount} />

        {/* Random Tip */}
        <RandomTip />

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

        {/* Stats Preview */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow">
          <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
            今日の記録
          </h3>
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
        </div>
      </div>

      {/* Tag Selection Modal */}
      <Modal
        isOpen={showTagModal}
        onClose={() => {
          setShowTagModal(false);
          setPendingRecordType(null);
          setSelectedTags([]);
        }}
        title="状況を選択（任意）"
        size="md"
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

          {/* Action buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                setShowTagModal(false);
                setPendingRecordType(null);
                setSelectedTags([]);
              }}
            >
              キャンセル
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={submitRecord}
              disabled={isSubmitting}
            >
              {isSubmitting ? '記録中...' : '記録する'}
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
