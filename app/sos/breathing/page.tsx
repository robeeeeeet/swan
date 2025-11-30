'use client';

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BreathingCircle } from '@/components/sos/BreathingCircle';
import Button from '@/components/ui/Button';
import Celebration from '@/components/ui/Celebration';

const BreathingPage: FC = () => {
  const router = useRouter();
  const [showCelebration, setShowCelebration] = useState(false);

  const handleComplete = () => {
    setShowCelebration(true);
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
        <div className="px-4 py-3 max-w-lg mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            aria-label="戻る"
          >
            ← 戻る
          </Button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            深呼吸モード
          </h1>
          <div className="w-16" /> {/* スペーサー */}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="px-4 py-8 max-w-lg mx-auto">
        {/* 深呼吸コンポーネント */}
        <BreathingCircle onComplete={handleComplete} />

        {/* ガイド */}
        <div className="mt-12 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <div className="text-3xl">📖</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  深呼吸のポイント
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">•</span>
                    <span>楽な姿勢で座るか、立ちます</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">•</span>
                    <span>肩の力を抜いてリラックス</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">•</span>
                    <span>円の動きに合わせてゆっくり呼吸</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">•</span>
                    <span>吸う時はお腹を膨らませるイメージ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">•</span>
                    <span>吐く時は口から細く長く</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* タイマーモードへの誘導 */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-700">
            <div className="flex items-start gap-3 mb-4">
              <div className="text-3xl">⏱️</div>
              <div>
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  3分タイマーを試す
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  まずは3分だけ待ってみましょう
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => router.push('/sos/timer')}
              aria-label="3分タイマーへ"
            >
              3分タイマーへ
            </Button>
          </div>

          {/* 効果の説明 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
            <div className="flex items-start gap-3">
              <div className="text-3xl">🧠</div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  深呼吸の効果
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                  深呼吸は副交感神経を活性化させ、ストレスホルモンを減少させます。
                  心拍数と血圧を下げ、心身をリラックスさせる効果があります。
                  定期的に行うことで、喫煙衝動に対する抵抗力が高まります。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 祝福アニメーション */}
      <Celebration
        show={showCelebration}
        message="素晴らしい深呼吸でした！"
        onComplete={handleCelebrationComplete}
      />
    </div>
  );
};

export default BreathingPage;
