'use client';

import { FC } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { formatMoney, formatLifeRegained } from '@/lib/utils/summary';

interface AchievementPanelProps {
  totalMoneySaved: number;
  totalMinutesSaved: number;
  totalResisted: number;
  daysTracking: number;
}

/**
 * Achievement Panel Component (B-03)
 *
 * Displays cumulative achievements to motivate users:
 * - Total money saved
 * - Life regained (converted from minutes)
 * - Total successful resistances
 * - Days of tracking
 *
 * Design Philosophy:
 * - Warm, encouraging tone with Swan Design System colors
 * - Large numbers with contextual icons
 * - Grid layout for easy scanning
 * - Celebrates user progress without judgment
 */
export const AchievementPanel: FC<AchievementPanelProps> = ({
  totalMoneySaved,
  totalMinutesSaved,
  totalResisted,
  daysTracking,
}) => {
  const achievements = [
    {
      id: 'money',
      icon: '💰',
      label: '節約金額',
      value: `¥${formatMoney(totalMoneySaved)}`,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      description: '健康と財布に優しい選択',
    },
    {
      id: 'life',
      icon: '⏰',
      label: '取り戻した時間',
      value: formatLifeRegained(totalMinutesSaved),
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
      description: 'あなたの大切な時間',
    },
    {
      id: 'resisted',
      icon: '🏆',
      label: '我慢成功回数',
      value: `${totalResisted}回`,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      description: 'あなたの強さの証',
    },
    {
      id: 'days',
      icon: '📅',
      label: '記録継続日数',
      value: `${daysTracking}日`,
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-50 dark:bg-violet-900/20',
      description: '毎日の積み重ね',
    },
  ];

  return (
    <Card className="overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-600 dark:from-teal-700 dark:to-teal-800 px-5 py-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">✨</span>
          あなたの成果
        </h2>
        <p className="text-teal-50 text-sm mt-1">
          頑張っている自分を誇りに思いましょう
        </p>
      </div>

      <CardContent className="p-4">
        {/* Achievement Grid */}
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`
                ${achievement.bgColor}
                rounded-xl p-4
                transition-all duration-200
                hover:scale-105
                cursor-default
              `}
            >
              {/* Icon */}
              <div className="text-3xl mb-2">{achievement.icon}</div>

              {/* Label */}
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                {achievement.label}
              </div>

              {/* Value */}
              <div
                className={`
                  ${achievement.color}
                  text-2xl font-bold
                  tabular-nums
                  mb-1
                `}
              >
                {achievement.value}
              </div>

              {/* Description */}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {achievement.description}
              </div>
            </div>
          ))}
        </div>

        {/* Encouragement Message */}
        {totalResisted > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-800 dark:text-orange-200 text-center font-medium">
              {getEncouragementMessage(totalResisted, totalMoneySaved)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Generates contextual encouragement messages based on achievements
 */
function getEncouragementMessage(
  totalResisted: number,
  totalMoneySaved: number
): string {
  if (totalResisted >= 100) {
    return '🎉 素晴らしい！100回以上も我慢に成功しています。あなたの意志の強さに感動です！';
  }

  if (totalResisted >= 50) {
    return '👏 50回以上の成功！この調子で続けましょう。あなたは本当に頑張っています！';
  }

  if (totalResisted >= 20) {
    return '💪 20回以上も我慢できました。一歩ずつ、確実に前進しています！';
  }

  if (totalResisted >= 10) {
    return '✨ 10回の成功達成！小さな勝利の積み重ねが大きな成果を生みます！';
  }

  if (totalMoneySaved >= 1000) {
    return '💰 もう1,000円以上節約できました。自分へのご褒美を考えてみては？';
  }

  if (totalResisted >= 5) {
    return '🌟 最初の一歩を踏み出しました。この勢いで続けていきましょう！';
  }

  return '🤗 毎日の小さな努力が、大きな変化を生み出します。一緒に頑張りましょう！';
}
