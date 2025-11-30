'use client';

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Timer } from '@/components/sos/Timer';
import Button from '@/components/ui/Button';
import Celebration from '@/components/ui/Celebration';
import { RESISTANCE_MESSAGES } from '@/constants/messages';

const TimerPage: FC = () => {
  const router = useRouter();
  const [showCelebration, setShowCelebration] = useState(false);

  const handleComplete = () => {
    setShowCelebration(true);
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
  };

  const handleRecordSuccess = () => {
    // TODO: 「我慢できた」記録を保存
    router.push('/dashboard');
  };

  const randomMessage = RESISTANCE_MESSAGES[Math.floor(Math.random() * RESISTANCE_MESSAGES.length)];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
        <div className="px-4 py-3 max-w-lg mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            ariaLabel="戻る"
          >
            ← 戻る
          </Button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            3分タイマー
          </h1>
          <div className="w-16" /> {/* スペーサー */}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="px-4 py-8 max-w-lg mx-auto">
        {/* タイマーコンポーネント */}
        <Timer onComplete={handleComplete} />

        {/* ヒント */}
        <div className="mt-12 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <div className="text-3xl">💡</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  待っている間にできること
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">•</span>
                    <span>深呼吸をして心を落ち着ける</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">•</span>
                    <span>水を一杯飲む</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">•</span>
                    <span>軽いストレッチをする</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">•</span>
                    <span>好きな音楽を聴く</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 深呼吸モードへの誘導 */}
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-2xl p-6 border border-teal-200 dark:border-teal-700">
            <div className="flex items-start gap-3 mb-4">
              <div className="text-3xl">🌬️</div>
              <div>
                <h3 className="font-semibold text-teal-900 dark:text-teal-100 mb-2">
                  深呼吸モードを試す
                </h3>
                <p className="text-sm text-teal-700 dark:text-teal-300">
                  呼吸法で心を落ち着けましょう
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              fullWidth
              onClick={() => router.push('/sos/breathing')}
              ariaLabel="深呼吸モードへ"
            >
              深呼吸モードへ
            </Button>
          </div>
        </div>
      </main>

      {/* 祝福アニメーション */}
      <Celebration
        show={showCelebration}
        message={randomMessage}
        onComplete={handleCelebrationComplete}
      />
    </div>
  );
};

export default TimerPage;
