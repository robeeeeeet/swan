'use client';

import { memo } from 'react';

export interface GoalHeaderProps {
  dailyGoal: number;
  smokedToday: number;
}

/**
 * Goal progress header component
 * Shows "今日の目標: あと○本"
 *
 * Features:
 * - Dynamic visual feedback based on progress
 * - Smooth animations for progress bar
 * - Tabular nums for consistent number display
 * - Celebration state when goal achieved
 * - Warning state when goal exceeded
 * - ARIA labels for screen readers
 * - Memoized for performance
 */
function GoalHeaderComponent({ dailyGoal, smokedToday }: GoalHeaderProps) {
  const remaining = Math.max(0, dailyGoal - smokedToday);
  const progress = dailyGoal > 0 ? (smokedToday / dailyGoal) * 100 : 0;
  const exceeded = smokedToday > dailyGoal;
  const achieved = smokedToday === dailyGoal && dailyGoal > 0;

  // Dynamic background gradient based on state
  const backgroundGradient = exceeded
    ? 'bg-gradient-to-br from-amber-500 to-amber-600'
    : achieved
    ? 'bg-gradient-to-br from-green-500 to-green-600'
    : 'bg-gradient-to-br from-teal-500 to-teal-600';

  return (
    <div
      className={`${backgroundGradient} text-white rounded-2xl p-6 shadow-lg transition-all duration-500 animate-in slide-in-from-top-4 fade-in`}
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">今日の目標</h2>
        <span
          className="text-3xl transition-transform duration-300 hover:scale-110"
          aria-hidden="true"
        >
          {exceeded ? '⚠️' : achieved ? '🎉' : '🎯'}
        </span>
      </div>

      {/* Progress - Main display */}
      <div className="mb-4">
        {exceeded ? (
          <div className="text-center animate-in zoom-in-50 fade-in duration-300">
            <p className="text-3xl font-bold tabular-nums mb-1">
              +{smokedToday - dailyGoal}本オーバー
            </p>
            <p className="text-sm opacity-90">
              目標: {dailyGoal}本 / 実際: {smokedToday}本
            </p>
          </div>
        ) : achieved ? (
          <div className="text-center animate-in zoom-in-50 fade-in duration-300">
            <p className="text-3xl font-bold mb-1">目標達成！</p>
            <p className="text-sm opacity-90">
              素晴らしい！今日はこれで終わりにしましょう
            </p>
          </div>
        ) : (
          <div className="text-center animate-in fade-in duration-300">
            <p className="text-sm opacity-90 mb-1">あと</p>
            <p className="text-6xl font-bold tabular-nums leading-none transition-all duration-300">
              {remaining}
            </p>
            <p className="text-lg mt-2">本</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
        <div
          className={`h-full transition-all duration-700 ease-out ${
            exceeded
              ? 'bg-white animate-pulse'
              : achieved
              ? 'bg-white shadow-sm shadow-white/50'
              : 'bg-white/90'
          }`}
          style={{ width: `${Math.min(100, progress)}%` }}
          role="progressbar"
          aria-valuenow={smokedToday}
          aria-valuemin={0}
          aria-valuemax={dailyGoal}
          aria-label={`今日の喫煙本数 ${smokedToday}/${dailyGoal}本`}
        />
      </div>

      {/* Details */}
      <div className="mt-3 flex justify-between text-sm opacity-90 tabular-nums">
        <span>目標: {dailyGoal}本</span>
        <span>実際: {smokedToday}本</span>
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(GoalHeaderComponent);
