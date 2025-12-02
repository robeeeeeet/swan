'use client';

import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { InstallGuide } from '@/components/install/InstallGuide';

/**
 * インストールガイドページ
 *
 * iOS Safari でのホーム画面追加手順を説明する
 * 設定ページからアクセス可能
 */
const InstallGuidePage: FC = () => {
  const router = useRouter();

  const handleComplete = () => {
    // ガイド完了をlocalStorageに保存
    localStorage.setItem('swan_install_guide_completed', 'true');
    // ダッシュボードに戻る
    router.push('/dashboard');
  };

  const handleSkip = () => {
    // スキップしたことを記録
    localStorage.setItem('swan_install_guide_dismissed', 'true');
    // ダッシュボードに戻る
    router.push('/dashboard');
  };

  return <InstallGuide onComplete={handleComplete} onSkip={handleSkip} />;
};

export default InstallGuidePage;
