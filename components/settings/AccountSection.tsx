'use client';

import { FC, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';

/**
 * アカウント管理セクション
 *
 * - アカウント情報表示
 * - アカウントリンク（匿名→Google）
 * - サインアウト
 * - データ削除（確認モーダル付き）
 */
export const AccountSection: FC = () => {
  const { user, signOut, linkWithGoogle } = useAuth();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const isAnonymous = user?.isAnonymous;

  const handleLinkAccount = async () => {
    setIsLinking(true);
    setLinkError(null);
    try {
      await linkWithGoogle();
    } catch (error) {
      setLinkError('アカウントのリンクに失敗しました');
      console.error('Account link error:', error);
    } finally {
      setIsLinking(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setShowSignOutModal(false);
  };

  return (
    <>
      <Card>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              👤 アカウント管理
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              アカウント情報とセキュリティ
            </p>
          </div>

          {/* アカウント情報 */}
          <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                アカウント種別
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {isAnonymous ? '匿名アカウント' : 'Googleアカウント'}
              </span>
            </div>
            {!isAnonymous && user?.email && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  メールアドレス
                </span>
                <span className="font-medium text-gray-900 dark:text-white text-sm">
                  {user.email}
                </span>
              </div>
            )}
          </div>

          {/* アカウントリンク（匿名の場合のみ） */}
          {isAnonymous && (
            <div className="space-y-2">
              <Button
                variant="primary"
                fullWidth
                onClick={handleLinkAccount}
                disabled={isLinking}
              >
                {isLinking ? '連携中...' : 'Googleアカウントと連携'}
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                データを引き継いで複数デバイスで同期できます
              </p>
              {linkError && (
                <p className="text-sm text-red-600 dark:text-red-400 text-center">
                  {linkError}
                </p>
              )}
            </div>
          )}

          {/* サインアウト */}
          <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowSignOutModal(true)}
            >
              サインアウト
            </Button>
          </div>

          {/* 注意事項 */}
          {isAnonymous && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                ⚠️ 匿名アカウントでサインアウトすると、データが失われます。
                Googleアカウントとの連携をおすすめします。
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* サインアウト確認モーダル */}
      <Modal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        title="サインアウト"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            {isAnonymous
              ? '匿名アカウントでサインアウトすると、すべてのデータが失われます。本当にサインアウトしますか？'
              : 'サインアウトしてもデータは保持されます。再度サインインすると元に戻ります。'}
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowSignOutModal(false)}
            >
              キャンセル
            </Button>
            <Button
              variant="error"
              fullWidth
              onClick={handleSignOut}
            >
              サインアウト
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
