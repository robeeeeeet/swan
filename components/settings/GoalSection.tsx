'use client';

import { FC } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { GoalSettings } from '@/types';

interface GoalSectionProps {
  goals: GoalSettings;
  onUpdate: (goals: Partial<GoalSettings>) => void;
}

/**
 * 目標設定セクション
 *
 * - 日次目標本数
 * - 自動ステップダウン設定
 */
export const GoalSection: FC<GoalSectionProps> = ({ goals, onUpdate }) => {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            🎯 目標設定
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            あなたの禁煙・減煙目標を設定します
          </p>
        </div>

        {/* 日次目標本数 */}
        <div className="space-y-2">
          <label
            htmlFor="dailyTarget"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            1日の目標本数
          </label>
          <div className="flex items-center gap-3">
            <input
              id="dailyTarget"
              type="number"
              min="0"
              max="100"
              value={goals.dailyTarget}
              onChange={(e) =>
                onUpdate({ dailyTarget: parseInt(e.target.value) || 0 })
              }
              className="
                flex-1 px-4 py-3 text-lg font-semibold
                bg-white dark:bg-slate-700
                border-2 border-gray-300 dark:border-slate-600
                rounded-xl
                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                tabular-nums
                min-h-[44px]
              "
            />
            <span className="text-gray-600 dark:text-gray-400 font-medium">本</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            現在の喫煙本数より少し少なめに設定するのがおすすめです
          </p>
        </div>

        {/* 自動ステップダウン */}
        <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            AIによる目標調整
          </p>
          <label className="flex items-center justify-between cursor-pointer min-h-[44px]">
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                自動ステップダウン
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                進捗に応じて目標を自動調整
              </p>
            </div>
            <input
              type="checkbox"
              checked={goals.stepDownEnabled}
              onChange={(e) => onUpdate({ stepDownEnabled: e.target.checked })}
              className="
                w-6 h-6 rounded
                text-teal-500
                border-gray-300 dark:border-slate-600
                focus:ring-2 focus:ring-teal-500
                cursor-pointer
              "
            />
          </label>
        </div>
      </CardContent>
    </Card>
  );
};
