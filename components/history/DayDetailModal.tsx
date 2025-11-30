import { FC, useMemo } from 'react';
import { DailySummary, SmokingRecord, SituationTag } from '@/types';
import { formatDate, formatTime } from '@/lib/utils/summary';
import { SITUATION_TAGS } from '@/constants/tags';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: DailySummary;
  records: SmokingRecord[];
}

export const DayDetailModal: FC<DayDetailModalProps> = ({
  isOpen,
  onClose,
  summary,
  records,
}) => {
  // 時間帯別の集計
  const hourlyData = useMemo(() => {
    const hours = new Array(24).fill(0);
    records.forEach((record) => {
      const hour = new Date(record.timestamp).getHours();
      hours[hour]++;
    });
    return hours;
  }, [records]);

  // タグ別の集計
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();

    records.forEach((record) => {
      record.tags.forEach((tagId) => {
        counts.set(tagId, (counts.get(tagId) || 0) + 1);
      });
    });

    const tagArray = Array.from(counts.entries())
      .map(([tagId, count]) => {
        const situationTag = tagId as SituationTag;
        const tag = SITUATION_TAGS[situationTag];
        return tag ? { id: situationTag, ...tag, count } : null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.count - a.count);

    return tagArray;
  }, [records]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* モーダルコンテンツ */}
      <div
        className="relative bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-auto animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* ハンドル（モバイル） */}
        <div className="sm:hidden flex justify-center pt-3">
          <div className="w-10 h-1 bg-gray-300 dark:bg-slate-600 rounded-full" />
        </div>

        {/* ヘッダー */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
              {formatDate(summary.date)}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="閉じる"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* サマリー */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center bg-gray-50 dark:bg-slate-900/50 rounded-xl p-3">
              <div className="text-3xl font-bold tabular-nums text-gray-600 dark:text-gray-300">
                {summary.totalSmoked}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">吸った</div>
            </div>
            <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
              <div className="text-3xl font-bold tabular-nums text-green-600 dark:text-green-400">
                {summary.totalResisted}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">我慢</div>
            </div>
            <div className="text-center bg-swan-primary-50 dark:bg-swan-primary-900/20 rounded-xl p-3">
              <div className="text-2xl font-bold tabular-nums text-swan-primary-600 dark:text-swan-primary-400">
                ¥{Math.round(summary.moneySaved || 0)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">節約</div>
            </div>
          </div>

          {/* タグ分析 */}
          {tagCounts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">状況タグ</h3>
              <div className="space-y-2">
                {tagCounts.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900/50 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{tag.emoji}</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {tag.label}
                      </span>
                    </div>
                    <span className="text-sm font-bold tabular-nums text-gray-600 dark:text-gray-400">
                      {tag.count}回
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 時間帯分析 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">時間帯別</h3>
            <div className="grid grid-cols-6 gap-1">
              {hourlyData.map((count, hour) => {
                const maxCount = Math.max(...hourlyData);
                const opacity = count > 0 ? 0.2 + (count / maxCount) * 0.8 : 0.1;

                return (
                  <div key={hour} className="text-center" title={`${hour}時: ${count}回`}>
                    <div
                      className="h-8 rounded bg-swan-primary-500 dark:bg-swan-primary-400 mb-1"
                      style={{ opacity }}
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                      {hour}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              色が濃いほど喫煙回数が多い時間帯
            </p>
          </div>

          {/* 記録一覧 */}
          {records.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                記録（{records.length}件）
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-900/50 rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {record.type === 'smoked' ? '🚬' : record.type === 'resisted' ? '✅' : '💭'}
                      </span>
                      <span className="font-medium text-gray-700 dark:text-gray-300 tabular-nums">
                        {formatTime(new Date(record.timestamp).toISOString())}
                      </span>
                      {record.tags.length > 0 && (
                        <span className="text-gray-500 dark:text-gray-400">
                          {SITUATION_TAGS[record.tags[0] as SituationTag]?.emoji}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
