'use client';

import { FC } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

interface InstallPromptBannerProps {
  onDismiss: () => void;
}

/**
 * インストールプロンプトバナー
 *
 * ダッシュボード上部に表示され、ユーザーにインストールを促す
 */
export const InstallPromptBanner: FC<InstallPromptBannerProps> = ({ onDismiss }) => {
  const router = useRouter();

  const handleInstall = () => {
    router.push('/install-guide');
  };

  return (
    <div className="relative bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 shadow-lg overflow-hidden animate-slide-up">
      {/* 背景装飾 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

      {/* コンテンツ */}
      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-4xl flex-shrink-0">🦢</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">
              Swanをインストール
            </h3>
            <p className="text-teal-50 text-sm leading-relaxed">
              ホーム画面に追加すると、アプリのように使えて、励ましの通知も受け取れます。
            </p>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={handleInstall}
            aria-label="インストール方法を見る"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              インストール方法を見る
            </span>
          </Button>
          <button
            onClick={onDismiss}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white/80 hover:text-white transition-colors"
            aria-label="閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
