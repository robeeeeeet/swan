'use client';

import { useEffect, useState, memo, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { getWeightedRandomTip, type Tip, getCurrentTimeSlot, getCurrentDayType } from '@/lib/tips';
import { addTipRating, getTipRating } from '@/lib/indexeddb';
import { addTipRatingToFirestore } from '@/lib/firebase/tipRatings';
import { useAuth } from '@/hooks/useAuth';
import { TipRatingType, TipRating } from '@/types';

/**
 * カテゴリー別の絵文字マッピング
 */
const CATEGORY_EMOJI: Record<string, string> = {
  '感覚刺激': '💧',
  '呼吸法': '🌬️',
  '代替行動': '🎯',
  '心理・認知': '🧠',
  '運動': '🏃',
  '環境調整': '🏠',
  '食事・栄養': '🥗',
  'コミュニケーション': '💬',
  '急速休息': '😴',
};

/**
 * Random tip component with rating functionality
 *
 * Features:
 * - Time-based filtering (shows appropriate tips for current time)
 * - Weekend mode (relaxed restrictions on weekends)
 * - Good/Bad rating buttons for personalization
 * - Weighted random selection based on ratings
 * - Auto-refreshes tip every 5 minutes
 * - Smooth fade-in animation on tip change
 */
function RandomTipComponent() {
  const { user } = useAuth();
  const [tip, setTip] = useState<Tip | null>(null);
  const [key, setKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentRating, setCurrentRating] = useState<TipRating | null>(null);
  const [ratingFeedback, setRatingFeedback] = useState<'good' | 'bad' | null>(null);

  // 現在の時間帯情報（デバッグ用）
  const [timeInfo, setTimeInfo] = useState({ timeSlot: '', dayType: '' });

  // Tipを取得する関数
  const fetchTip = useCallback(async (excludeId?: number) => {
    try {
      const newTip = await getWeightedRandomTip(
        getCurrentTimeSlot(),
        getCurrentDayType(),
        excludeId
      );
      setTip(newTip);
      setRatingFeedback(null);

      // 現在の評価を取得
      const rating = await getTipRating(newTip.id);
      setCurrentRating(rating);

      setTimeInfo({
        timeSlot: getCurrentTimeSlot(),
        dayType: getCurrentDayType(),
      });
    } catch (error) {
      console.error('Failed to fetch tip:', error);
    }
  }, []);

  // 手動更新関数
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchTip(tip?.id);
    setKey((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  }, [fetchTip, tip?.id]);

  // 評価を送信する関数（何度でも評価可能）
  const handleRating = useCallback(
    async (rating: TipRatingType) => {
      if (!tip) return;

      try {
        // IndexedDB（ローカル）に保存
        const updatedRating = await addTipRating(tip.id, rating);
        setCurrentRating(updatedRating);
        setRatingFeedback(rating);

        // Firestore（クラウド）にも保存（ユーザーがログインしている場合）
        if (user?.uid) {
          try {
            await addTipRatingToFirestore(user.uid, tip.id, rating);
          } catch (firestoreError) {
            // Firestoreへの保存失敗は致命的ではないのでログのみ
            console.warn('Failed to save rating to Firestore:', firestoreError);
          }
        }

        // フィードバック表示をリセット（連続評価のため）
        setTimeout(() => {
          setRatingFeedback(null);
        }, 800);
      } catch (error) {
        console.error('Failed to save rating:', error);
      }
    },
    [tip, user?.uid]
  );

  // 初期化
  useEffect(() => {
    if (!mounted) {
      fetchTip();
      setMounted(true);
    }

    // 5分ごとにリフレッシュ
    const interval = setInterval(() => {
      fetchTip(tip?.id);
      setKey((prev) => prev + 1);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [mounted, fetchTip, tip?.id]);

  if (!tip) {
    return (
      <Card variant="default" padding="md">
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4 mb-3" />
            <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const categoryEmoji = CATEGORY_EMOJI[tip.category] || '💡';

  return (
    <Card variant="default" padding="md">
      <CardContent>
        <div key={key} className="animate-in fade-in duration-500">
          {/* ヘッダー: カテゴリーバッジ + ランキングリンク + 更新ボタン */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span
                className="text-lg flex-shrink-0 transition-transform duration-300 hover:scale-110"
                aria-hidden="true"
              >
                {categoryEmoji}
              </span>
              <span className="text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded-full">
                {tip.category}
              </span>
            </div>
            <div className="flex items-center gap-1">

              {/* ランキングリンク */}
              <Link
                href="/tips-ranking"
                className="flex items-center justify-center w-8 h-8 rounded-full text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                aria-label="Tips人気ランキング"
                title="Tips人気ランキング"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </Link>
              {/* 更新ボタン */}
              <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center justify-center w-8 h-8 rounded-full text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors disabled:opacity-50"
              aria-label="別のTipsを表示"
              title="別のTipsを表示"
            >
              <svg
                className={`w-5 h-5 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            </div>
          </div>

          {/* アクション（メイン） */}
          <p className="text-base font-semibold text-neutral-800 dark:text-neutral-100 mb-1">
            {tip.action}
          </p>

          {/* 説明 */}
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
            {tip.description}
          </p>

          {/* Good/Bad 評価ボタン */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              このTipsは役立ちそう？
            </span>
            <div className="flex items-center gap-2">
              {/* フィードバック表示 */}
              {ratingFeedback && (
                <span
                  className={`text-xs font-medium animate-in fade-in duration-300 ${
                    ratingFeedback === 'good'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {ratingFeedback === 'good' ? 'ありがとう！' : '記録しました'}
                </span>
              )}

              {/* Good ボタン */}
              <button
                onClick={() => handleRating('good')}
                className={`
                  flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium
                  transition-all duration-200 min-h-[36px]
                  ${
                    ratingFeedback === 'good'
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 scale-110'
                      : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 active:scale-95'
                  }
                `}
                aria-label="役立ちそう"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
                <span className="hidden sm:inline">Good</span>
              </button>

              {/* Bad ボタン */}
              <button
                onClick={() => handleRating('bad')}
                className={`
                  flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium
                  transition-all duration-200 min-h-[36px]
                  ${
                    ratingFeedback === 'bad'
                      ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 scale-110'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95'
                  }
                `}
                aria-label="今は使えない"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                  />
                </svg>
                <span className="hidden sm:inline">Bad</span>
              </button>
            </div>
          </div>

          {/* 評価数表示（あれば） */}
          {currentRating && (currentRating.goodCount > 0 || currentRating.badCount > 0) && (
            <div className="mt-2 text-xs text-neutral-400 dark:text-neutral-500 text-right">
              👍 {currentRating.goodCount} / 👎 {currentRating.badCount}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Memoize to prevent unnecessary re-renders when parent updates
export default memo(RandomTipComponent);
