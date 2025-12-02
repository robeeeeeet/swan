'use client';

import { FC, useState } from 'react';
import Button from '@/components/ui/Button';

interface InstallGuideProps {
  onComplete: () => void;
  onSkip: () => void;
}

/**
 * iOSインストールガイドコンポーネント
 *
 * ホーム画面への追加手順を視覚的に説明し、
 * Web Push通知の前提条件であることをユーザーに伝える
 */
export const InstallGuide: FC<InstallGuideProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Swanをホーム画面に追加',
      description: 'アプリのように使えるようになります',
      emoji: '🦢',
      illustration: (
        <div className="relative w-full max-w-sm mx-auto aspect-square">
          {/* スマホの枠 */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3rem] p-4 shadow-2xl">
            {/* 画面部分 */}
            <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
              {/* ステータスバー */}
              <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-black/5 to-transparent flex items-center justify-center">
                <div className="text-xs text-gray-900 font-medium">9:41</div>
              </div>

              {/* Swanアプリ画面のプレビュー */}
              <div className="pt-12 px-4 pb-8 h-full flex flex-col">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-3">🦢</div>
                  <h3 className="text-xl font-bold text-gray-900">Swan</h3>
                  <p className="text-sm text-gray-600">禁煙・減煙サポート</p>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full space-y-3">
                    <div className="h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl" />
                    <div className="h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ホーム画面追加の強調 */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-teal-500 text-white px-6 py-3 rounded-full shadow-lg text-sm font-bold whitespace-nowrap animate-pulse">
            ホーム画面に追加
          </div>
        </div>
      ),
    },
    {
      title: '共有ボタンをタップ',
      description: '画面下部の「共有」アイコンを探してください',
      emoji: '📤',
      illustration: (
        <div className="relative w-full max-w-sm mx-auto">
          {/* Safari ブラウザの UI */}
          <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl p-4 shadow-xl">
            {/* アドレスバー */}
            <div className="bg-white rounded-2xl p-3 mb-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-300 rounded-full" />
                <div className="flex-1 bg-gray-100 rounded-lg h-8 flex items-center px-3">
                  <span className="text-xs text-gray-600">swan-app.vercel.app</span>
                </div>
              </div>
            </div>

            {/* コンテンツエリア */}
            <div className="bg-white rounded-2xl h-64 mb-4" />

            {/* ツールバー */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-4">
              <div className="flex justify-around">
                <div className="text-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mx-auto mb-1" />
                  <div className="text-xs text-gray-600">戻る</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mx-auto mb-1" />
                  <div className="text-xs text-gray-600">進む</div>
                </div>
                <div className="text-center relative">
                  {/* 共有ボタンを強調 */}
                  <div className="w-10 h-10 bg-teal-500 rounded-full mx-auto mb-1 flex items-center justify-center shadow-lg ring-4 ring-teal-200 animate-pulse">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <div className="text-xs font-bold text-teal-600">共有</div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-teal-500 text-white px-3 py-1 rounded-full text-xs whitespace-nowrap shadow-lg">
                    ここをタップ →
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mx-auto mb-1" />
                  <div className="text-xs text-gray-600">タブ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'ホーム画面に追加',
      description: '共有メニューから選択してください',
      emoji: '➕',
      illustration: (
        <div className="relative w-full max-w-sm mx-auto">
          {/* 共有メニュー */}
          <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl p-6 shadow-xl">
            <div className="bg-white rounded-2xl p-4 mb-4">
              {/* アプリプレビュー */}
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">🦢</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Swan</h4>
                  <p className="text-xs text-gray-600">swan-app.vercel.app</p>
                </div>
              </div>
            </div>

            {/* アクションリスト */}
            <div className="space-y-2">
              <div className="bg-white rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <span className="text-sm text-gray-700">メッセージ</span>
              </div>
              <div className="bg-white rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <span className="text-sm text-gray-700">メール</span>
              </div>
              {/* ホーム画面に追加を強調 */}
              <div className="bg-teal-500 rounded-xl p-4 flex items-center gap-3 shadow-lg ring-4 ring-teal-200 animate-pulse">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-white">ホーム画面に追加</span>
              </div>
              <div className="bg-white rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <span className="text-sm text-gray-700">ブックマーク</span>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-teal-500 text-white px-6 py-3 rounded-full shadow-lg text-sm font-bold whitespace-nowrap animate-pulse">
            これを選択 ↑
          </div>
        </div>
      ),
    },
    {
      title: '完了！',
      description: 'これで通知を受け取れます',
      emoji: '🎉',
      illustration: (
        <div className="relative w-full max-w-sm mx-auto">
          {/* ホーム画面 */}
          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-[3rem] p-6 shadow-2xl">
            <div className="grid grid-cols-4 gap-4">
              {/* 既存のアプリアイコン（グレー） */}
              {[...Array(11)].map((_, i) => (
                <div key={i} className="aspect-square bg-white/20 backdrop-blur rounded-2xl" />
              ))}

              {/* Swanアイコンを強調 */}
              <div className="aspect-square bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center relative ring-4 ring-yellow-300 animate-pulse">
                <div className="text-3xl">🦢</div>
                <div className="text-[8px] font-bold text-gray-900 mt-1">Swan</div>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                  ここに追加！
                </div>
              </div>

              {/* 残りのスロット */}
              {[...Array(8)].map((_, i) => (
                <div key={`bottom-${i}`} className="aspect-square bg-white/20 backdrop-blur rounded-2xl" />
              ))}
            </div>

            {/* ドック */}
            <div className="mt-8 bg-white/30 backdrop-blur rounded-3xl p-4">
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={`dock-${i}`} className="aspect-square bg-white/40 backdrop-blur rounded-2xl" />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-lg font-semibold text-gray-900 mb-2">
              ✨ これでアプリのように使えます
            </p>
            <p className="text-sm text-gray-600">
              通知も受け取れるようになりました
            </p>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col">
      {/* ヘッダー */}
      <div className="safe-area-top px-6 py-4 flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          ステップ {currentStep + 1} / {steps.length}
        </div>
        {!isLastStep && (
          <button
            onClick={onSkip}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium"
          >
            後で
          </button>
        )}
      </div>

      {/* プログレスバー */}
      <div className="px-6 mb-8">
        <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 px-6 pb-8 overflow-y-auto">
        {/* 絵文字 */}
        <div className="text-center mb-6">
          <div className="text-7xl animate-bounce">{step.emoji}</div>
        </div>

        {/* タイトル・説明 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {step.title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {step.description}
          </p>
        </div>

        {/* イラスト */}
        <div className="mb-8">
          {step.illustration}
        </div>

        {/* 追加情報（最初のステップのみ） */}
        {isFirstStep && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">ℹ️</div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  なぜ必要なの？
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                  iPhoneで通知を受け取るには、ホーム画面に追加する必要があります。
                  これにより、励ましのメッセージや魔の時間帯アラートをお届けできます。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ボトムナビゲーション */}
      <div className="safe-area-bottom px-6 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur border-t border-gray-200 dark:border-slate-700">
        <div className="flex gap-3">
          {!isFirstStep && (
            <Button
              variant="ghost"
              onClick={handlePrev}
              className="min-w-[100px]"
              aria-label="前のステップ"
            >
              戻る
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleNext}
            fullWidth={isFirstStep}
            aria-label={isLastStep ? '完了' : '次へ'}
          >
            {isLastStep ? '完了' : '次へ'}
          </Button>
        </div>
      </div>
    </div>
  );
};
