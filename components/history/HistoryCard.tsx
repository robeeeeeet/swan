import { FC } from 'react';
import { DailySummary, SituationTag } from '@/types';
import { formatDate } from '@/lib/utils/summary';
import { SITUATION_TAGS } from '@/constants/tags';

interface HistoryCardProps {
  summary: DailySummary;
  onClick: () => void;
}

export const HistoryCard: FC<HistoryCardProps> = ({ summary, onClick }) => {
  const isToday = summary.date === new Date().toISOString().split('T')[0];
  const resistanceRate =
    summary.totalSmoked + summary.totalResisted > 0
      ? Math.round((summary.totalResisted / (summary.totalSmoked + summary.totalResisted)) * 100)
      : 0;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md hover:border-gray-200 dark:hover:border-slate-600 transition-all p-6"
    >
      {/* 日付ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatDate(summary.date)}
          </h3>
          {isToday && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium text-swan-primary-700 bg-swan-primary-50 dark:text-swan-primary-300 dark:bg-swan-primary-900/20 rounded-full">
              今日
            </span>
          )}
        </div>

        {/* 成功率バッジ */}
        {summary.totalResisted > 0 && (
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 tabular-nums">
              {resistanceRate}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">成功率</div>
          </div>
        )}
      </div>

      {/* 統計グリッド */}
      <div className="grid grid-cols-3 gap-4">
        {/* 喫煙本数 */}
        <div className="text-center">
          <div className="text-3xl font-bold tabular-nums text-gray-600 dark:text-gray-300">
            {summary.totalSmoked}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">吸った</div>
        </div>

        {/* 我慢成功 */}
        <div className="text-center">
          <div className="text-3xl font-bold tabular-nums text-green-600 dark:text-green-400">
            {summary.totalResisted}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">我慢</div>
        </div>

        {/* 節約額 */}
        <div className="text-center">
          <div className="text-2xl font-bold tabular-nums text-swan-primary-600 dark:text-swan-primary-400">
            ¥{Math.round(summary.moneySaved || 0)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">節約</div>
        </div>
      </div>

      {/* タグプレビュー（最大3つ） */}
      {summary.mostCommonTags && summary.mostCommonTags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {summary.mostCommonTags.slice(0, 3).map((tagId) => {
            const tag = SITUATION_TAGS[tagId as SituationTag];
            if (!tag) return null;

            return (
              <span
                key={tagId}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-full"
              >
                <span>{tag.emoji}</span>
                <span>{tag.label}</span>
              </span>
            );
          })}
          {summary.mostCommonTags.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              +{summary.mostCommonTags.length - 3}
            </span>
          )}
        </div>
      )}
    </button>
  );
};
