'use client';

import { FC, useState, useEffect, useCallback } from 'react';
import Button from '@/components/ui/Button';

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'pause';

interface BreathingCircleProps {
  onComplete?: () => void;
}

export const BreathingCircle: FC<BreathingCircleProps> = ({ onComplete }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [secondsInPhase, setSecondsInPhase] = useState(0);

  // 呼吸パターン（秒）
  const BREATHING_PATTERN = {
    inhale: 4,    // 吸う
    hold: 4,      // 止める
    exhale: 6,    // 吐く
    pause: 2,     // 休憩
  };

  const TOTAL_CYCLES = 5; // 5サイクルで完了

  // フェーズごとのメッセージ
  const PHASE_MESSAGES: Record<BreathingPhase, string> = {
    inhale: '鼻からゆっくり息を吸って',
    hold: '息を止めて',
    exhale: '口からゆっくり息を吐いて',
    pause: '自然に呼吸して',
  };

  // フェーズごとの円のサイズ（スケール）
  const PHASE_SCALES: Record<BreathingPhase, number> = {
    inhale: 1.5,   // 大きく膨らむ
    hold: 1.5,     // 保持
    exhale: 0.6,   // 小さく縮む
    pause: 1.0,    // 通常サイズ
  };

  // 呼吸サイクル処理
  useEffect(() => {
    if (!isActive) return;

    const phaseDuration = BREATHING_PATTERN[phase];

    if (secondsInPhase < phaseDuration) {
      const timer = setTimeout(() => {
        setSecondsInPhase((prev) => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    // 次のフェーズへ移行
    const phases: BreathingPhase[] = ['inhale', 'hold', 'exhale', 'pause'];
    const currentIndex = phases.indexOf(phase);
    const nextIndex = (currentIndex + 1) % phases.length;
    const nextPhase = phases[nextIndex];

    // pauseの終わりでサイクルカウント増加
    if (phase === 'pause') {
      const newCycleCount = cycleCount + 1;
      setCycleCount(newCycleCount);

      if (newCycleCount >= TOTAL_CYCLES) {
        setIsActive(false);
        onComplete?.();
        return;
      }
    }

    setPhase(nextPhase);
    setSecondsInPhase(0);
  }, [isActive, phase, secondsInPhase, cycleCount, onComplete]);

  const handleStart = useCallback(() => {
    setIsActive(true);
    setPhase('inhale');
    setCycleCount(0);
    setSecondsInPhase(0);
  }, []);

  const handleStop = useCallback(() => {
    setIsActive(false);
    setPhase('inhale');
    setCycleCount(0);
    setSecondsInPhase(0);
  }, []);

  const currentScale = PHASE_SCALES[phase];
  const isCompleted = cycleCount >= TOTAL_CYCLES && !isActive;

  return (
    <div className="flex flex-col items-center justify-center space-y-8 min-h-[600px]">
      {/* 呼吸サークル */}
      <div className="relative flex items-center justify-center h-80">
        {/* 外側のリング（ガイド） */}
        <div
          className="absolute rounded-full border-4 border-dashed border-gray-300 dark:border-slate-600 opacity-30"
          style={{
            width: '280px',
            height: '280px',
          }}
        />

        {/* 呼吸する円 */}
        <div
          className="rounded-full flex items-center justify-center transition-transform duration-[3000ms] ease-in-out"
          style={{
            width: '160px',
            height: '160px',
            transform: `scale(${isActive ? currentScale : 1})`,
            background: isCompleted
              ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
              : 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
            boxShadow: isActive
              ? `0 0 ${40 * currentScale}px rgba(20, 184, 166, 0.5)`
              : '0 0 20px rgba(20, 184, 166, 0.3)',
          }}
          aria-label={`呼吸サークル: ${PHASE_MESSAGES[phase]}`}
        >
          {/* 中央のテキスト */}
          <div className="text-center text-white">
            {isCompleted ? (
              <div className="text-5xl">🌸</div>
            ) : isActive ? (
              <div className="text-4xl font-bold tabular-nums">
                {BREATHING_PATTERN[phase] - secondsInPhase}
              </div>
            ) : (
              <div className="text-5xl">🌬️</div>
            )}
          </div>
        </div>

        {/* パルス効果（吸う時のみ） */}
        {isActive && phase === 'inhale' && (
          <div
            className="absolute rounded-full border-4 border-teal-400 dark:border-teal-300 opacity-50 animate-ping"
            style={{
              width: `${160 * currentScale}px`,
              height: `${160 * currentScale}px`,
            }}
          />
        )}
      </div>

      {/* フェーズメッセージ */}
      <div className="text-center px-4 h-20 flex items-center justify-center">
        {!isActive && !isCompleted && (
          <p className="text-lg text-gray-600 dark:text-gray-300">
            深呼吸で心を落ち着けましょう
          </p>
        )}

        {isActive && (
          <div className="space-y-2">
            <p className="text-2xl font-semibold text-teal-600 dark:text-teal-400">
              {PHASE_MESSAGES[phase]}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              サイクル {cycleCount + 1} / {TOTAL_CYCLES}
            </p>
          </div>
        )}

        {isCompleted && (
          <div className="space-y-2">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              お疲れ様でした！
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              深呼吸で心が落ち着きましたか？
            </p>
          </div>
        )}
      </div>

      {/* プログレスバー */}
      {isActive && (
        <div className="w-full max-w-md px-4">
          <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-1000 ease-linear"
              style={{
                width: `${((cycleCount * 4 + ['inhale', 'hold', 'exhale', 'pause'].indexOf(phase) + 1) / (TOTAL_CYCLES * 4)) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* コントロールボタン */}
      <div className="flex gap-4 w-full max-w-md px-4">
        {!isActive && !isCompleted && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleStart}
            ariaLabel="深呼吸を開始"
          >
            開始
          </Button>
        )}

        {isActive && (
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={handleStop}
            ariaLabel="深呼吸を終了"
          >
            終了
          </Button>
        )}

        {isCompleted && (
          <Button
            variant="success"
            size="lg"
            fullWidth
            onClick={handleStart}
            ariaLabel="もう一度深呼吸"
          >
            もう一度
          </Button>
        )}
      </div>
    </div>
  );
};
