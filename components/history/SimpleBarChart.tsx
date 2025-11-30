import { FC, useMemo } from 'react';
import { getLocalDateString } from '@/lib/utils/date';

interface ChartData {
  date: string;
  count: number;
  label: string;
}

interface SimpleBarChartProps {
  data: ChartData[];
  maxValue?: number;
  height?: number;
}

export const SimpleBarChart: FC<SimpleBarChartProps> = ({
  data,
  maxValue,
  height = 200,
}) => {
  const max = maxValue || Math.max(...data.map((d) => d.count), 1);

  // 今日の日付をローカルタイムゾーンで取得（レンダリング間で安定）
  const today = useMemo(() => getLocalDateString(), []);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">本数推移</h3>

      {/* チャート */}
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {data.map((item) => {
          const barHeight = (item.count / max) * 100;
          const isToday = item.date === today;

          return (
            <div key={item.date} className="flex-1 flex flex-col items-center gap-2">
              {/* バー */}
              <div className="w-full flex flex-col justify-end" style={{ height: '100%' }}>
                {/* 本数表示 */}
                {item.count > 0 && (
                  <div className="text-center mb-1">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 tabular-nums">
                      {item.count}
                    </span>
                  </div>
                )}

                {/* バー本体 */}
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    isToday
                      ? 'bg-gradient-to-t from-teal-500 to-teal-400'
                      : 'bg-gradient-to-t from-gray-400 to-gray-300 dark:from-slate-600 dark:to-slate-500'
                  }`}
                  style={{ height: `${barHeight}%`, minHeight: item.count > 0 ? '4px' : '0' }}
                />
              </div>

              {/* ラベル */}
              <div className="text-center">
                <div
                  className={`text-xs font-medium ${
                    isToday
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {item.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 凡例 */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-teal-500 to-teal-400" />
          <span className="text-gray-600 dark:text-gray-300">今日</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-gray-400 to-gray-300 dark:from-slate-600 dark:to-slate-500" />
          <span className="text-gray-600 dark:text-gray-300">過去</span>
        </div>
      </div>
    </div>
  );
};
