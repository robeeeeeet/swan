'use client';

import { FC, useState } from 'react';
import { useHistory } from '@/hooks/useHistory';
import { HistoryCard } from '@/components/history/HistoryCard';
import { WeekStats } from '@/components/history/WeekStats';
import { SimpleBarChart } from '@/components/history/SimpleBarChart';
import { DayDetailModal } from '@/components/history/DayDetailModal';
import { DailySummary } from '@/types';

const HistoryPage: FC = () => {
  const {
    records,
    summaries,
    weekStats,
    isLoading,
    selectedPeriod,
    setSelectedPeriod,
    refreshHistory,
  } = useHistory();

  const [selectedDay, setSelectedDay] = useState<DailySummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 選択した日のレコードを取得
  const selectedDayRecords = selectedDay
    ? records.filter((r) => r.date === selectedDay.date)
    : [];

  // チャート用のデータを準備（直近7日分）
  const chartData = summaries
    .slice(0, 7)
    .reverse()
    .map((s) => {
      const date = new Date(s.date);
      const dayLabel = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
      return {
        date: s.date,
        count: s.totalSmoked,
        label: `${date.getDate()}(${dayLabel})`,
      };
    });

  const handleCardClick = (summary: DailySummary) => {
    setSelectedDay(summary);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedDay(null), 300); // アニメーション完了後にクリア
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-swan-primary-500 border-t-transparent" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="px-4 py-4 max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">履歴</h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="px-4 py-6 max-w-lg mx-auto pb-24 space-y-6">
        {/* 期間選択 */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { value: '7days' as const, label: '7日間' },
            { value: '30days' as const, label: '30日間' },
            { value: 'all' as const, label: '全期間' },
          ].map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedPeriod === period.value
                  ? 'bg-swan-primary-500 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:border-swan-primary-300'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* 統計サマリー */}
        <WeekStats stats={weekStats} period={selectedPeriod} />

        {/* 本数推移チャート */}
        {chartData.length > 0 && <SimpleBarChart data={chartData} />}

        {/* 日別カード一覧 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">日別記録</h2>
            <button
              onClick={refreshHistory}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="更新"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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

          {summaries.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                まだ記録がありません
              </h3>
              <p className="text-gray-600 dark:text-gray-400">日々の記録が表示されます</p>
            </div>
          ) : (
            <div className="space-y-3">
              {summaries.map((summary) => (
                <HistoryCard
                  key={summary.date}
                  summary={summary}
                  onClick={() => handleCardClick(summary)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 詳細モーダル */}
      {selectedDay && (
        <DayDetailModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          summary={selectedDay}
          records={selectedDayRecords}
        />
      )}
    </div>
  );
};

export default HistoryPage;
