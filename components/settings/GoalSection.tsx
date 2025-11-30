'use client';

import { FC, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { GoalSettings } from '@/types';

interface GoalSectionProps {
  goals: GoalSettings;
  onUpdate: (goals: Partial<GoalSettings>) => void;
}

const MAX_DAILY_TARGET = 50; // 現実的な上限

/**
 * 目標設定セクション
 *
 * - 日次目標本数
 * - 自動ステップダウン設定
 */
export const GoalSection: FC<GoalSectionProps> = ({ goals, onUpdate }) => {
  // ローカル状態で入力値を管理
  const [inputValue, setInputValue] = useState(goals.dailyTarget.toString());

  // 親からの値が変わったら同期
  useEffect(() => {
    setInputValue(goals.dailyTarget.toString());
  }, [goals.dailyTarget]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 数字のみ許可（空文字列も許可）
    if (value === '' || /^\d+$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleBlur = () => {
    // フォーカスが外れたときに値を確定
    const numValue = parseInt(inputValue) || 0;
    const clampedValue = Math.min(numValue, MAX_DAILY_TARGET);
    setInputValue(clampedValue.toString());
    onUpdate({ dailyTarget: clampedValue });
  };

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
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={inputValue}
              onChange={handleChange}
              onBlur={handleBlur}
              className="
                flex-1 px-4 py-3 text-lg font-semibold text-center
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
            0〜{MAX_DAILY_TARGET}本まで設定可能。現在の喫煙本数より少し少なめに設定するのがおすすめです
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
