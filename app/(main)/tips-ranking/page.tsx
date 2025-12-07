'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { getAllTipsWithScores, type Tip, getAllCategories, type TipCategory } from '@/lib/tips';
import { TipWithScore } from '@/types';
import Link from 'next/link';

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
 * ランクに応じたメダル表示
 */
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return <span className="text-2xl">🥇</span>;
  }
  if (rank === 2) {
    return <span className="text-2xl">🥈</span>;
  }
  if (rank === 3) {
    return <span className="text-2xl">🥉</span>;
  }
  return (
    <span className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold text-neutral-500">
      {rank}
    </span>
  );
}

/**
 * 評価バー表示
 */
function RatingBar({ goodCount, badCount }: { goodCount: number; badCount: number }) {
  const total = goodCount + badCount;
  if (total === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <span>まだ評価がありません</span>
      </div>
    );
  }

  const goodPercent = Math.round((goodCount / total) * 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
            style={{ width: `${goodPercent}%` }}
          />
        </div>
        <span className="text-xs font-medium text-green-600 dark:text-green-400 w-12 text-right">
          {goodPercent}%
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span>👍 {goodCount}</span>
        <span>👎 {badCount}</span>
      </div>
    </div>
  );
}

type SortType = 'popular' | 'rating' | 'total';

export default function TipsRankingPage() {
  const [tips, setTips] = useState<(Tip & TipWithScore)[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortType>('popular');
  const [filterCategory, setFilterCategory] = useState<TipCategory | 'all'>('all');
  const [categories, setCategories] = useState<TipCategory[]>([]);

  // データ取得
  const fetchData = useCallback(async () => {
    try {
      const allTips = await getAllTipsWithScores();
      setTips(allTips);
      setCategories(getAllCategories());
    } catch (error) {
      console.error('Failed to fetch tips:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ソート処理
  const sortedTips = [...tips]
    .filter((tip) => filterCategory === 'all' || tip.category === filterCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          // Good数で降順
          return b.goodCount - a.goodCount;
        case 'rating':
          // Wilson Scoreで降順（評価の質）
          return b.wilsonScore - a.wilsonScore;
        case 'total':
          // 総評価数で降順（話題性）
          return b.totalRatings - a.totalRatings;
        default:
          return 0;
      }
    });

  // 統計情報
  const stats = {
    totalRatings: tips.reduce((sum, t) => sum + t.totalRatings, 0),
    totalGood: tips.reduce((sum, t) => sum + t.goodCount, 0),
    ratedTips: tips.filter((t) => t.totalRatings > 0).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-slate-900 p-4">
        <div className="max-w-lg mx-auto space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-200 dark:bg-slate-700 rounded w-1/2" />
            <div className="h-24 bg-neutral-200 dark:bg-slate-700 rounded" />
            <div className="h-48 bg-neutral-200 dark:bg-slate-700 rounded" />
            <div className="h-48 bg-neutral-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-slate-900 pb-20">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-neutral-200 dark:border-slate-700">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="戻る"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-neutral-800 dark:text-white">
                Tips人気ランキング
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                みんなが役立つと思ったTips
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* 統計サマリー */}
        <Card variant="default" padding="md">
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  {stats.totalRatings}
                </div>
                <div className="text-xs text-neutral-500">総評価数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.totalGood}
                </div>
                <div className="text-xs text-neutral-500">Good数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.ratedTips}/{tips.length}
                </div>
                <div className="text-xs text-neutral-500">評価済みTips</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* フィルター・ソート */}
        <div className="space-y-3">
          {/* ソートボタン */}
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('popular')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                sortBy === 'popular'
                  ? 'bg-teal-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              👍 人気順
            </button>
            <button
              onClick={() => setSortBy('rating')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                sortBy === 'rating'
                  ? 'bg-teal-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              ⭐ 評価順
            </button>
            <button
              onClick={() => setSortBy('total')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                sortBy === 'total'
                  ? 'bg-teal-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              🔥 話題順
            </button>
          </div>

          {/* カテゴリーフィルター */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filterCategory === 'all'
                  ? 'bg-neutral-800 dark:bg-white text-white dark:text-neutral-800'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              すべて
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                  filterCategory === category
                    ? 'bg-neutral-800 dark:bg-white text-white dark:text-neutral-800'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <span>{CATEGORY_EMOJI[category]}</span>
                <span>{category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ランキングリスト */}
        <div className="space-y-3">
          {sortedTips.length === 0 ? (
            <Card variant="default" padding="md">
              <CardContent>
                <div className="text-center py-8 text-neutral-500">
                  <p>該当するTipsがありません</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            sortedTips.map((tip, index) => (
              <Card key={tip.id} variant="default" padding="md">
                <CardContent>
                  <div className="flex gap-3">
                    {/* ランク */}
                    <div className="flex-shrink-0 flex items-start pt-1">
                      <RankBadge rank={index + 1} />
                    </div>

                    {/* コンテンツ */}
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* カテゴリー */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{CATEGORY_EMOJI[tip.category]}</span>
                        <span className="text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded-full">
                          {tip.category}
                        </span>
                      </div>

                      {/* アクション */}
                      <h3 className="font-semibold text-neutral-800 dark:text-neutral-100">
                        {tip.action}
                      </h3>

                      {/* 説明 */}
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                        {tip.description}
                      </p>

                      {/* 評価バー */}
                      <RatingBar goodCount={tip.goodCount} badCount={tip.badCount} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* フッター説明 */}
        <div className="text-center text-xs text-neutral-400 dark:text-neutral-500 py-4">
          <p>ダッシュボードでTipsを評価すると</p>
          <p>あなたに合ったTipsが表示されやすくなります</p>
        </div>
      </main>
    </div>
  );
}
