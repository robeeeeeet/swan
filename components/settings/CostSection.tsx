'use client';

import { FC, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { AppSettings } from '@/types';

interface CostSectionProps {
  app: AppSettings;
  onUpdate: (app: Partial<AppSettings>) => void;
}

/**
 * コスト設定セクション
 *
 * - タバコ価格（1箱あたり）
 * - 1箱の本数
 * - 1本の喫煙時間
 */
export const CostSection: FC<CostSectionProps> = ({ app, onUpdate }) => {
  // ローカル状態で入力値を管理
  const [priceInput, setPriceInput] = useState(app.cigarettePrice.toString());
  const [packInput, setPackInput] = useState(app.cigarettesPerPack.toString());

  // 親からの値が変わったら同期
  useEffect(() => {
    setPriceInput(app.cigarettePrice.toString());
  }, [app.cigarettePrice]);

  useEffect(() => {
    setPackInput(app.cigarettesPerPack.toString());
  }, [app.cigarettesPerPack]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setPriceInput(value);
    }
  };

  const handlePackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setPackInput(value);
    }
  };

  const handlePriceBlur = () => {
    const numValue = parseInt(priceInput) || 0;
    const clampedValue = Math.min(Math.max(numValue, 0), 10000);
    setPriceInput(clampedValue.toString());
    onUpdate({ cigarettePrice: clampedValue });
  };

  const handlePackBlur = () => {
    const numValue = parseInt(packInput) || 20;
    const clampedValue = Math.min(Math.max(numValue, 1), 100);
    setPackInput(clampedValue.toString());
    onUpdate({ cigarettesPerPack: clampedValue });
  };

  // 1本あたりの価格を計算
  const pricePerCigarette = Math.round(app.cigarettePrice / app.cigarettesPerPack);

  return (
    <Card>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            💰 コスト設定
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            節約金額の計算に使用します
          </p>
        </div>

        {/* タバコ価格 */}
        <div className="space-y-2">
          <label
            htmlFor="cigarettePrice"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            タバコ価格（1箱）
          </label>
          <div className="flex items-center gap-3">
            <input
              id="cigarettePrice"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={priceInput}
              onChange={handlePriceChange}
              onBlur={handlePriceBlur}
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
            <span className="text-gray-600 dark:text-gray-400 font-medium">円</span>
          </div>
        </div>

        {/* 1箱の本数 */}
        <div className="space-y-2">
          <label
            htmlFor="cigarettesPerPack"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            1箱の本数
          </label>
          <div className="flex items-center gap-3">
            <input
              id="cigarettesPerPack"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={packInput}
              onChange={handlePackChange}
              onBlur={handlePackBlur}
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
        </div>

        {/* 計算結果表示 */}
        <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
          <div className="flex justify-between items-center p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              1本あたりの価格
            </span>
            <span className="text-lg font-bold text-teal-600 dark:text-teal-400 tabular-nums">
              約 {pricePerCigarette} 円
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
