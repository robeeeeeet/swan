'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/signin');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading spinner while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">Swan</h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
          禁煙・減煙支援アプリ
        </p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
      </div>
    </div>
  );
}
