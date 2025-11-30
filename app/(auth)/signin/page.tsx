'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function SignInPage() {
  const { signInAnonymously, signInGoogle, isLoading, error } = useAuth();
  const router = useRouter();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleAnonymousSignIn = async () => {
    try {
      setLocalError(null);
      await signInAnonymously();
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ログインに失敗しました';
      setLocalError(errorMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLocalError(null);
      await signInGoogle();
      router.push('/dashboard');
    } catch (err) {
      setLocalError('Googleログインに失敗しました');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 px-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-primary mb-2">Swan</h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            禁煙・減煙支援アプリ
          </p>
        </div>

        {/* Sign In Card */}
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="ログイン"
            subtitle="あなたの禁煙をサポートします"
          />
          <CardContent>
            <div className="space-y-4">
              {/* Error message */}
              {(error || localError) && (
                <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-xl text-sm">
                  {error || localError}
                </div>
              )}

              {/* Anonymous Sign In */}
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleAnonymousSignIn}
                loading={isLoading}
                disabled={isLoading}
              >
                匿名で始める
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-neutral-800 text-neutral-500">
                    または
                  </span>
                </div>
              </div>

              {/* Google Sign In */}
              <Button
                variant="ghost"
                fullWidth
                size="lg"
                onClick={handleGoogleSignIn}
                loading={isLoading}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Googleでログイン
              </Button>

              {/* Info */}
              <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-6">
                匿名で始めると、後からGoogleアカウントと連携できます。
                <br />
                データはデバイスに保存され、同期することもできます。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy note */}
        <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-6">
          ログインすることで、利用規約とプライバシーポリシーに同意したものとみなされます。
        </p>
      </div>
    </div>
  );
}
