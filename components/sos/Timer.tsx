'use client';

import { FC, useState, useEffect, useCallback } from 'react';
import Button from '@/components/ui/Button';

interface TimerProps {
  initialSeconds?: number;
  onComplete?: () => void;
}

export const Timer: FC<TimerProps> = ({
  initialSeconds = 180, // デフォルト3分
  onComplete
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  // タイマー進捗（0-100%）
  const progress = ((initialSeconds - secondsLeft) / initialSeconds) * 100;

  // 分:秒のフォーマット
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // タイマー処理
  useEffect(() => {
    if (!isRunning || secondsLeft === 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setHasCompleted(true);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, onComplete]);

  const handleStart = useCallback(() => {
    setIsRunning(true);
    setHasCompleted(false);
  }, []);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setSecondsLeft(initialSeconds);
    setHasCompleted(false);
  }, [initialSeconds]);

  // 円形プログレスバーのSVG計算
  const size = 280;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* 円形プログレスバー */}
      <div className="relative">
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          aria-label={`タイマー ${timeDisplay}`}
        >
          {/* 背景の円 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200 dark:text-slate-700"
          />

          {/* プログレスの円 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#timerGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />

          {/* グラデーション定義 */}
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" /> {/* オレンジ */}
              <stop offset="100%" stopColor="#14b8a6" /> {/* ティール */}
            </linearGradient>
          </defs>
        </svg>

        {/* 中央の時間表示 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="text-7xl font-bold tabular-nums tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #14b8a6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {timeDisplay}
          </div>
          {hasCompleted && (
            <div className="mt-2 text-2xl animate-bounce">
              🎉
            </div>
          )}
        </div>
      </div>

      {/* メッセージ */}
      <div className="text-center px-4 max-w-md">
        {!isRunning && !hasCompleted && secondsLeft === initialSeconds && (
          <p className="text-lg text-gray-600 dark:text-gray-300">
            まずは3分だけ待ってみましょう。<br />
            この衝動は必ず過ぎ去ります。
          </p>
        )}

        {isRunning && (
          <p className="text-lg font-medium text-orange-600 dark:text-orange-400 animate-pulse-gentle">
            もう少しです。頑張りましょう！
          </p>
        )}

        {hasCompleted && (
          <div className="space-y-2">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              素晴らしい！
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              3分間、よく我慢できました。<br />
              この調子で続けましょう。
            </p>
          </div>
        )}
      </div>

      {/* コントロールボタン */}
      <div className="flex gap-4 w-full max-w-md px-4">
        {!isRunning && !hasCompleted && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleStart}
            ariaLabel="タイマーを開始"
          >
            開始
          </Button>
        )}

        {isRunning && (
          <>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={handlePause}
              ariaLabel="タイマーを一時停止"
            >
              一時停止
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={handleReset}
              ariaLabel="タイマーをリセット"
            >
              リセット
            </Button>
          </>
        )}

        {!isRunning && secondsLeft > 0 && secondsLeft < initialSeconds && (
          <>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleStart}
              ariaLabel="タイマーを再開"
            >
              再開
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={handleReset}
              ariaLabel="タイマーをリセット"
            >
              リセット
            </Button>
          </>
        )}

        {hasCompleted && (
          <Button
            variant="success"
            size="lg"
            fullWidth
            onClick={handleReset}
            ariaLabel="タイマーをもう一度"
          >
            もう一度
          </Button>
        )}
      </div>
    </div>
  );
};
