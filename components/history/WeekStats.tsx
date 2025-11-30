import { FC } from 'react';
import { formatMoney } from '@/lib/utils/summary';

interface WeekStatsProps {
  stats: {
    totalSmoked: number;
    totalResisted: number;
    moneySaved: number;
    resistanceRate: number;
  };
  period?: '7days' | '30days' | 'all';
}

export const WeekStats: FC<WeekStatsProps> = ({ stats, period = '7days' }) => {
  const periodLabel = {
    '7days': '直近7日間',
    '30days': '直近30日間',
    'all': '全期間',
  };

  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 shadow-sm border border-teal-100 dark:border-slate-600">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {periodLabel[period]}の統計
        </h2>
        {stats.resistanceRate > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-3xl">🏆</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 tabular-nums">
                {Math.round(stats.resistanceRate)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">成功率</div>
            </div>
          </div>
        )}
      </div>

      {/* 統計グリッド */}
      <div className="grid grid-cols-3 gap-4">
        {/* 喫煙本数 */}
        <div className="text-center bg-white/60 dark:bg-slate-900/30 rounded-xl p-4">
          <div className="text-4xl font-bold tabular-nums text-neutral-700 dark:text-neutral-300">
            {stats.totalSmoked}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">本</div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">喫煙</div>
        </div>

        {/* 我慢成功 */}
        <div className="text-center bg-white/60 dark:bg-slate-900/30 rounded-xl p-4">
          <div className="text-4xl font-bold tabular-nums text-green-600 dark:text-green-400">
            {stats.totalResisted}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">回</div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">我慢成功</div>
        </div>

        {/* 節約額 */}
        <div className="text-center bg-white/60 dark:bg-slate-900/30 rounded-xl p-4">
          <div className="text-3xl font-bold tabular-nums text-teal-600 dark:text-teal-400">
            ¥{formatMoney(stats.moneySaved)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">節約</div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">お金</div>
        </div>
      </div>

      {/* 励ましメッセージ */}
      {stats.totalResisted > 0 && (
        <div className="mt-6 text-center">
          <p className="text-base font-medium text-teal-700 dark:text-teal-300">
            {stats.resistanceRate >= 70
              ? '素晴らしい！この調子で続けましょう 💪'
              : stats.resistanceRate >= 50
              ? '良いペースです。あなたは強い！ 🌟'
              : '一歩ずつ前進しています。応援しています 🤗'}
          </p>
        </div>
      )}
    </div>
  );
};
