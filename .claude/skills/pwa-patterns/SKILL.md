---
name: pwa-patterns
description: PWA実装パターン集。Service Worker、Workboxキャッシュ戦略、Web Push通知、iOS対応、オフラインファースト、Background Sync、IndexedDBスキーマ設計。PWA機能の実装・最適化時に使用。
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
---

# PWA 実装パターン集（Swan PWA プロジェクト用）

このスキルは、禁煙・減煙PWAアプリ「Swan」におけるPWA機能実装のベストプラクティスとパターン集です。

## 目次

1. [Service Worker ライフサイクル](#1-service-worker-ライフサイクル)
2. [Workbox キャッシュ戦略](#2-workbox-キャッシュ戦略)
3. [Web Push 通知](#3-web-push-通知)
4. [iOS PWA 対応](#4-ios-pwa-対応)
5. [オフラインファースト アーキテクチャ](#5-オフラインファースト-アーキテクチャ)
6. [Background Sync](#6-background-sync)
7. [IndexedDB スキーマ設計](#7-indexeddb-スキーマ設計)

---

## 1. Service Worker ライフサイクル

### ライフサイクルの理解

```
インストール → アクティベート → 待機/アイドル → フェッチ/メッセージ処理 → 終了
    ↓              ↓
 キャッシュ作成    古いキャッシュ削除
```

### 基本的な Service Worker 登録

```typescript
// lib/serviceWorker.ts
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker is not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none', // 常に最新のSWをチェック
    });

    // 更新チェック
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // 新しいバージョンが利用可能
            dispatchEvent(new CustomEvent('sw-update-available'));
          }
        });
      }
    });

    console.log('Service Worker registered:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}
```

### 更新管理パターン

```typescript
// components/UpdatePrompt.tsx
import { useEffect, useState } from 'react';

export const UpdatePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setShowPrompt(true);
    window.addEventListener('sw-update-available', handleUpdate);
    return () => window.removeEventListener('sw-update-available', handleUpdate);
  }, []);

  const handleUpdate = async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.waiting) {
      // 新しいSWにスキップして即座にアクティベート
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
      <p className="font-medium">新しいバージョンが利用可能です</p>
      <button
        onClick={handleUpdate}
        className="mt-2 bg-white text-blue-600 px-4 py-2 rounded font-semibold"
      >
        今すぐ更新
      </button>
    </div>
  );
};
```

### Service Worker 側の SKIP_WAITING 処理

```javascript
// public/sw.js
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // 古いキャッシュを削除
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      }),
      // 即座にクライアントを制御
      self.clients.claim(),
    ])
  );
});
```

---

## 2. Workbox キャッシュ戦略

### Next.js + next-pwa 設定

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    // 静的アセット: CacheFirst
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1年
        },
      },
    },
    // 画像: CacheFirst
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30日
        },
      },
    },
    // API: NetworkFirst（最新データ優先）
    {
      urlPattern: /^https:\/\/api\..*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 5, // 5分
        },
        networkTimeoutSeconds: 10,
      },
    },
    // HTMLページ: StaleWhileRevalidate
    {
      urlPattern: /^https:\/\/.*\.html$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'html-cache',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24, // 1日
        },
      },
    },
  ],
});

module.exports = withPWA({
  // Next.js config
});
```

### キャッシュ戦略の選択ガイド

| 戦略 | 使用場面 | 特徴 |
|------|---------|------|
| **CacheFirst** | 静的アセット（画像、フォント、JS/CSS） | 高速、オフライン対応、更新頻度低いリソース向け |
| **NetworkFirst** | API、動的コンテンツ | 最新データ優先、ネットワーク失敗時キャッシュ使用 |
| **StaleWhileRevalidate** | 頻繁に更新されるが即座の最新性は不要 | キャッシュ返却後バックグラウンド更新 |
| **NetworkOnly** | 認証、決済など | キャッシュしない、常に最新 |
| **CacheOnly** | 完全オフライン対応アセット | ネットワーク使用しない |

### カスタム Workbox 設定（手動）

```javascript
// public/sw.js (Workbox使用)
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// プリキャッシュ（ビルド時に生成されるマニフェスト）
precacheAndRoute(self.__WB_MANIFEST);

// 喫煙記録API: NetworkFirst（最新データ重要）
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/smoke-records'),
  new NetworkFirst({
    cacheName: 'smoke-records-api',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24, // 1日
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
    networkTimeoutSeconds: 5, // 5秒でタイムアウト
  })
);

// 統計データAPI: StaleWhileRevalidate（やや古くてもOK）
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/statistics'),
  new StaleWhileRevalidate({
    cacheName: 'statistics-api',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 30, // 30分
      }),
    ],
  })
);

// アプリアイコン: CacheFirst
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30日
      }),
    ],
  })
);
```

---

## 3. Web Push 通知

### VAPID キー生成と設定

```bash
# VAPID キーペア生成
npx web-push generate-vapid-keys
```

```typescript
// lib/config/push.ts
export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;
export const VAPID_SUBJECT = 'mailto:support@swan-app.example.com';
```

### Push 通知購読の実装

```typescript
// lib/pushNotification.ts
import { VAPID_PUBLIC_KEY } from './config/push';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready;

    // 既存の購読をチェック
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      return subscription;
    }

    // 新規購読
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true, // 必須: 通知を表示することを約束
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // サーバーに購読情報を送信
    await sendSubscriptionToServer(subscription);

    return subscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
}

async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  });
}

export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
    }

    return true;
  } catch (error) {
    console.error('Push unsubscription failed:', error);
    return false;
  }
}
```

### 通知許可の段階的UX

```typescript
// hooks/usePushPermission.ts
import { useState, useEffect, useCallback } from 'react';

type PermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

interface UsePushPermissionReturn {
  permission: PermissionState;
  isSupported: boolean;
  requestPermission: () => Promise<boolean>;
  isPending: boolean;
}

export function usePushPermission(): UsePushPermissionReturn {
  const [permission, setPermission] = useState<PermissionState>('prompt');
  const [isPending, setIsPending] = useState(false);

  const isSupported = typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window;

  useEffect(() => {
    if (!isSupported) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission as PermissionState);
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    setIsPending(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);

      if (result === 'granted') {
        await subscribeToPush();
        return true;
      }
      return false;
    } finally {
      setIsPending(false);
    }
  }, [isSupported]);

  return { permission, isSupported, requestPermission, isPending };
}
```

### 通知許可誘導コンポーネント

```tsx
// components/PushPermissionPrompt.tsx
import { FC, useState } from 'react';
import { usePushPermission } from '@/hooks/usePushPermission';

interface PushPermissionPromptProps {
  onComplete?: () => void;
}

export const PushPermissionPrompt: FC<PushPermissionPromptProps> = ({ onComplete }) => {
  const { permission, requestPermission, isPending, isSupported } = usePushPermission();
  const [step, setStep] = useState<'explain' | 'request'>('explain');

  if (!isSupported || permission === 'granted' || permission === 'denied') {
    return null;
  }

  const handleExplainComplete = () => {
    setStep('request');
  };

  const handleRequest = async () => {
    const granted = await requestPermission();
    if (granted) {
      onComplete?.();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
        {step === 'explain' ? (
          <>
            <h2 className="text-xl font-bold mb-4">通知でサポートします</h2>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <p className="font-medium">魔の時間帯アラート</p>
                  <p className="text-sm text-gray-600">吸いたくなる時間の前にお知らせ</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">🌅</span>
                <div>
                  <p className="font-medium">モーニング・ブリーフィング</p>
                  <p className="text-sm text-gray-600">毎朝の目標確認と励まし</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="font-medium">成果のお祝い</p>
                  <p className="text-sm text-gray-600">マイルストーン達成を一緒に喜びます</p>
                </div>
              </li>
            </ul>
            <button
              onClick={handleExplainComplete}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold"
            >
              通知を設定する
            </button>
            <button
              onClick={onComplete}
              className="w-full mt-2 text-gray-500 py-2"
            >
              あとで設定する
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">通知を許可してください</h2>
            <p className="text-gray-600 mb-6">
              ブラウザの通知許可ダイアログが表示されます。
              「許可」をタップしてください。
            </p>
            <button
              onClick={handleRequest}
              disabled={isPending}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {isPending ? '処理中...' : '許可する'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
```

### Service Worker での通知受信

```javascript
// public/sw.js
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: data.actions || [],
    tag: data.tag || 'default', // 同じtagの通知は上書き
    renotify: data.renotify || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 既存のウィンドウがあればフォーカス
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // なければ新しいウィンドウを開く
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
```

### サーバーサイド通知送信（Node.js）

```typescript
// lib/server/pushService.ts
import webPush from 'web-push';
import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } from '../config/push';

webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  actions?: Array<{ action: string; title: string }>;
}

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    await webPush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (error: any) {
    // 購読が無効な場合（410 Gone）
    if (error.statusCode === 410) {
      // DBから購読を削除
      await removeSubscription(subscription.endpoint);
    }
    console.error('Push notification failed:', error);
    return false;
  }
}

// 禁煙アプリ用の通知タイプ
export const NotificationTypes = {
  CRAVING_ALERT: (minutesBefore: number) => ({
    title: '魔の時間帯が近づいています',
    body: `あと${minutesBefore}分。深呼吸して乗り越えましょう！`,
    url: '/coping-strategies',
    tag: 'craving-alert',
    actions: [
      { action: 'coping', title: '対処法を見る' },
      { action: 'dismiss', title: '大丈夫' },
    ],
  }),

  MORNING_BRIEFING: (dayCount: number, todayGoal: number) => ({
    title: `禁煙${dayCount}日目の朝です`,
    body: `今日の目標: ${todayGoal}本以下。あなたならできます！`,
    url: '/dashboard',
    tag: 'morning-briefing',
  }),

  MILESTONE_ACHIEVED: (milestone: string) => ({
    title: '目標達成おめでとうございます！',
    body: milestone,
    url: '/achievements',
    tag: 'milestone',
  }),

  GENTLE_REMINDER: () => ({
    title: '調子はいかがですか？',
    body: 'Swanがいつでもサポートします',
    url: '/',
    tag: 'reminder',
  }),
};
```

---

## 4. iOS PWA 対応

### iOS 特有の制約

| 制約 | 説明 | 回避策 |
|------|------|--------|
| **ホーム画面必須** | Safari単体では通知不可 | インストール誘導UI必須 |
| **Service Worker制限** | バックグラウンド実行に制限 | フォアグラウンド依存設計 |
| **ストレージ制限** | 50MB程度、7日間未使用で削除 | 定期的なアクセス促進 |
| **Audio/Video自動再生** | ユーザー操作が必要 | ユーザーアクション後に再生 |
| **manifest.json部分対応** | 一部プロパティ未対応 | meta/linkタグで補完 |

### iOS インストール検出と誘導

```typescript
// hooks/useIOSInstallPrompt.ts
import { useState, useEffect } from 'react';

interface UseIOSInstallPromptReturn {
  isIOS: boolean;
  isStandalone: boolean;
  showPrompt: boolean;
  dismissPrompt: () => void;
}

export function useIOSInstallPrompt(): UseIOSInstallPromptReturn {
  const [showPrompt, setShowPrompt] = useState(false);

  const isIOS = typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream;

  const isStandalone = typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
     (window.navigator as any).standalone === true);

  useEffect(() => {
    if (isIOS && !isStandalone) {
      // 初回訪問から3回目以降に表示
      const visitCount = parseInt(localStorage.getItem('visitCount') || '0', 10) + 1;
      localStorage.setItem('visitCount', String(visitCount));

      const dismissed = localStorage.getItem('iosPromptDismissed');
      if (visitCount >= 3 && !dismissed) {
        setShowPrompt(true);
      }
    }
  }, [isIOS, isStandalone]);

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('iosPromptDismissed', 'true');
  };

  return { isIOS, isStandalone, showPrompt, dismissPrompt };
}
```

### iOS インストール誘導コンポーネント

```tsx
// components/IOSInstallPrompt.tsx
import { FC } from 'react';
import { useIOSInstallPrompt } from '@/hooks/useIOSInstallPrompt';

export const IOSInstallPrompt: FC = () => {
  const { showPrompt, dismissPrompt, isIOS, isStandalone } = useIOSInstallPrompt();

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-black/70 text-white p-6 z-50">
      <div className="max-w-md mx-auto">
        <h3 className="text-lg font-bold mb-2">
          Swanをホーム画面に追加
        </h3>
        <p className="text-sm text-gray-300 mb-4">
          通知機能を使うには、ホーム画面への追加が必要です。
        </p>

        <div className="bg-white/10 rounded-xl p-4 mb-4">
          <ol className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span>
                下部の
                <svg className="inline-block w-5 h-5 mx-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 5l-1.42 1.42-1.59-1.59V16h-2V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .9 2 2z"/>
                </svg>
                （共有）をタップ
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span>「ホーム画面に追加」を選択</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span>右上の「追加」をタップ</span>
            </li>
          </ol>
        </div>

        <button
          onClick={dismissPrompt}
          className="w-full text-center text-sm text-gray-400 py-2"
        >
          あとで
        </button>
      </div>
    </div>
  );
};
```

### iOS 用 meta タグ補完

```html
<!-- app/layout.tsx or pages/_document.tsx -->
<head>
  <!-- 基本設定 -->
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Swan" />

  <!-- スプラッシュスクリーン（各デバイスサイズ） -->
  <!-- iPhone X / XS / 11 Pro -->
  <link
    rel="apple-touch-startup-image"
    href="/splash/apple-splash-1125-2436.jpg"
    media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
  />
  <!-- iPhone XR / 11 -->
  <link
    rel="apple-touch-startup-image"
    href="/splash/apple-splash-828-1792.jpg"
    media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
  />
  <!-- その他のデバイスも同様に追加 -->

  <!-- タッチアイコン -->
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
  <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152x152.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png" />

  <!-- セーフエリア対応 -->
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
</head>
```

### セーフエリア対応CSS

```css
/* globals.css */
:root {
  --sat: env(safe-area-inset-top);
  --sab: env(safe-area-inset-bottom);
  --sal: env(safe-area-inset-left);
  --sar: env(safe-area-inset-right);
}

/* ノッチ対応のヘッダー */
.app-header {
  padding-top: max(1rem, var(--sat));
  padding-left: max(1rem, var(--sal));
  padding-right: max(1rem, var(--sar));
}

/* ホームインジケーター対応のフッター */
.app-footer {
  padding-bottom: max(1rem, var(--sab));
}

/* 全画面モーダル */
.fullscreen-modal {
  padding: var(--sat) var(--sar) var(--sab) var(--sal);
}
```

---

## 5. オフラインファースト アーキテクチャ

### 設計原則

1. **ローカルファースト**: まずローカルに保存、後でサーバーと同期
2. **楽観的UI更新**: ユーザー操作は即座に反映、裏で同期
3. **競合解決**: サーバーとローカルの差分を適切にマージ
4. **同期状態の可視化**: ユーザーに同期状況を明示

### オフライン状態検出

```typescript
// hooks/useOnlineStatus.ts
import { useState, useEffect } from 'react';

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

### オフラインインジケーター

```tsx
// components/OfflineIndicator.tsx
import { FC } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export const OfflineIndicator: FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-center py-2 text-sm font-medium z-50">
      📴 オフラインです。データはローカルに保存されます。
    </div>
  );
};
```

### 同期キュー管理

```typescript
// lib/syncQueue.ts
import { openDB, IDBPDatabase } from 'idb';

interface SyncItem {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

const DB_NAME = 'swan-sync';
const STORE_NAME = 'sync-queue';

let dbPromise: Promise<IDBPDatabase> | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
}

export async function addToSyncQueue(item: Omit<SyncItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
  const db = await getDB();
  const syncItem: SyncItem = {
    ...item,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    retryCount: 0,
  };
  await db.put(STORE_NAME, syncItem);

  // Background Sync をトリガー（対応ブラウザのみ）
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    const registration = await navigator.serviceWorker.ready;
    await (registration as any).sync.register('sync-queue');
  }
}

export async function getSyncQueue(): Promise<SyncItem[]> {
  const db = await getDB();
  return db.getAllFromIndex(STORE_NAME, 'timestamp');
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function processSyncQueue(): Promise<void> {
  const queue = await getSyncQueue();

  for (const item of queue) {
    try {
      await syncItem(item);
      await removeFromSyncQueue(item.id);
    } catch (error) {
      // リトライ回数を増やす
      const db = await getDB();
      await db.put(STORE_NAME, { ...item, retryCount: item.retryCount + 1 });

      // 最大リトライ回数を超えたら削除
      if (item.retryCount >= 5) {
        await removeFromSyncQueue(item.id);
        console.error('Sync failed after max retries:', item);
      }
    }
  }
}

async function syncItem(item: SyncItem): Promise<void> {
  const endpoint = `/api/${item.entity}`;
  const method = {
    CREATE: 'POST',
    UPDATE: 'PUT',
    DELETE: 'DELETE',
  }[item.type];

  const response = await fetch(endpoint, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: item.type !== 'DELETE' ? JSON.stringify(item.data) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status}`);
  }
}
```

### 楽観的UI更新パターン

```typescript
// hooks/useSmokeRecord.ts
import { useState, useCallback } from 'react';
import { addToSyncQueue } from '@/lib/syncQueue';
import { saveToLocal, getFromLocal } from '@/lib/localStorage';

interface SmokeRecord {
  id: string;
  timestamp: number;
  tag?: string;
  synced: boolean;
}

export function useSmokeRecord() {
  const [records, setRecords] = useState<SmokeRecord[]>(() => getFromLocal('smokeRecords') || []);

  const addRecord = useCallback(async (tag?: string) => {
    const newRecord: SmokeRecord = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      tag,
      synced: false,
    };

    // 1. 楽観的にUIを更新
    const updatedRecords = [...records, newRecord];
    setRecords(updatedRecords);
    saveToLocal('smokeRecords', updatedRecords);

    // 2. 同期キューに追加
    await addToSyncQueue({
      type: 'CREATE',
      entity: 'smoke-records',
      data: newRecord,
    });

    // 3. オンラインなら即座に同期試行
    if (navigator.onLine) {
      try {
        await fetch('/api/smoke-records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRecord),
        });

        // 同期成功、ステータス更新
        const syncedRecords = updatedRecords.map(r =>
          r.id === newRecord.id ? { ...r, synced: true } : r
        );
        setRecords(syncedRecords);
        saveToLocal('smokeRecords', syncedRecords);
      } catch (error) {
        // 失敗してもローカルには保存済み、後で同期
        console.warn('Immediate sync failed, will retry later');
      }
    }

    return newRecord;
  }, [records]);

  return { records, addRecord };
}
```

---

## 6. Background Sync

### Service Worker での Background Sync

```javascript
// public/sw.js
import { processSyncQueue } from '../lib/syncQueue';

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-queue') {
    event.waitUntil(processSyncQueue());
  }
});

// Periodic Background Sync（対応ブラウザのみ）
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-sync') {
    event.waitUntil(performDailySync());
  }
});

async function performDailySync() {
  // 毎日のデータ同期処理
  await processSyncQueue();
  // 統計データの更新
  await fetch('/api/statistics/refresh');
}
```

### Periodic Background Sync の登録

```typescript
// lib/periodicSync.ts
export async function registerPeriodicSync(): Promise<boolean> {
  if (!('periodicSync' in ServiceWorkerRegistration.prototype)) {
    console.warn('Periodic Background Sync not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const status = await navigator.permissions.query({
      name: 'periodic-background-sync' as any,
    });

    if (status.state === 'granted') {
      await (registration as any).periodicSync.register('daily-sync', {
        minInterval: 24 * 60 * 60 * 1000, // 24時間
      });
      return true;
    }
  } catch (error) {
    console.error('Periodic sync registration failed:', error);
  }

  return false;
}
```

---

## 7. IndexedDB スキーマ設計

### idb ライブラリを使用したスキーマ定義

```typescript
// lib/db/schema.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface SwanDBSchema extends DBSchema {
  'smoke-records': {
    key: string;
    value: {
      id: string;
      timestamp: number;
      tag?: string;
      location?: { lat: number; lng: number };
      note?: string;
      synced: boolean;
      syncedAt?: number;
    };
    indexes: {
      'by-timestamp': number;
      'by-synced': number;
    };
  };
  'coping-records': {
    key: string;
    value: {
      id: string;
      timestamp: number;
      strategy: string;
      success: boolean;
      durationSeconds?: number;
      synced: boolean;
    };
    indexes: {
      'by-timestamp': number;
    };
  };
  'user-settings': {
    key: string;
    value: {
      key: string;
      value: any;
      updatedAt: number;
    };
  };
  'sync-queue': {
    key: string;
    value: {
      id: string;
      type: 'CREATE' | 'UPDATE' | 'DELETE';
      entity: string;
      data: any;
      timestamp: number;
      retryCount: number;
    };
    indexes: {
      'by-timestamp': number;
    };
  };
}

const DB_NAME = 'swan-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<SwanDBSchema> | null = null;

export async function getDB(): Promise<IDBPDatabase<SwanDBSchema>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<SwanDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // smoke-records ストア
      if (!db.objectStoreNames.contains('smoke-records')) {
        const smokeStore = db.createObjectStore('smoke-records', { keyPath: 'id' });
        smokeStore.createIndex('by-timestamp', 'timestamp');
        smokeStore.createIndex('by-synced', 'synced');
      }

      // coping-records ストア
      if (!db.objectStoreNames.contains('coping-records')) {
        const copingStore = db.createObjectStore('coping-records', { keyPath: 'id' });
        copingStore.createIndex('by-timestamp', 'timestamp');
      }

      // user-settings ストア
      if (!db.objectStoreNames.contains('user-settings')) {
        db.createObjectStore('user-settings', { keyPath: 'key' });
      }

      // sync-queue ストア
      if (!db.objectStoreNames.contains('sync-queue')) {
        const syncStore = db.createObjectStore('sync-queue', { keyPath: 'id' });
        syncStore.createIndex('by-timestamp', 'timestamp');
      }
    },
    blocked() {
      console.warn('Database upgrade blocked');
    },
    blocking() {
      // 他のタブでDBが使用中
      dbInstance?.close();
      dbInstance = null;
    },
  });

  return dbInstance;
}
```

### リポジトリパターン

```typescript
// lib/db/smokeRecordRepository.ts
import { getDB } from './schema';

export interface SmokeRecord {
  id: string;
  timestamp: number;
  tag?: string;
  location?: { lat: number; lng: number };
  note?: string;
  synced: boolean;
  syncedAt?: number;
}

export const smokeRecordRepository = {
  async create(record: Omit<SmokeRecord, 'id' | 'synced'>): Promise<SmokeRecord> {
    const db = await getDB();
    const newRecord: SmokeRecord = {
      ...record,
      id: crypto.randomUUID(),
      synced: false,
    };
    await db.put('smoke-records', newRecord);
    return newRecord;
  },

  async getById(id: string): Promise<SmokeRecord | undefined> {
    const db = await getDB();
    return db.get('smoke-records', id);
  },

  async getAll(): Promise<SmokeRecord[]> {
    const db = await getDB();
    return db.getAllFromIndex('smoke-records', 'by-timestamp');
  },

  async getByDateRange(startTime: number, endTime: number): Promise<SmokeRecord[]> {
    const db = await getDB();
    const range = IDBKeyRange.bound(startTime, endTime);
    return db.getAllFromIndex('smoke-records', 'by-timestamp', range);
  },

  async getToday(): Promise<SmokeRecord[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getByDateRange(today.getTime(), tomorrow.getTime());
  },

  async getUnsynced(): Promise<SmokeRecord[]> {
    const db = await getDB();
    const range = IDBKeyRange.only(0); // synced === false
    return db.getAllFromIndex('smoke-records', 'by-synced', range);
  },

  async update(id: string, updates: Partial<SmokeRecord>): Promise<SmokeRecord | null> {
    const db = await getDB();
    const existing = await db.get('smoke-records', id);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    await db.put('smoke-records', updated);
    return updated;
  },

  async markSynced(id: string): Promise<void> {
    await this.update(id, { synced: true, syncedAt: Date.now() });
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('smoke-records', id);
  },

  async deleteAll(): Promise<void> {
    const db = await getDB();
    await db.clear('smoke-records');
  },

  async count(): Promise<number> {
    const db = await getDB();
    return db.count('smoke-records');
  },

  async getTodayCount(): Promise<number> {
    const today = await this.getToday();
    return today.length;
  },
};
```

### 設定リポジトリ

```typescript
// lib/db/settingsRepository.ts
import { getDB } from './schema';

export const settingsRepository = {
  async get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    const db = await getDB();
    const setting = await db.get('user-settings', key);
    return (setting?.value as T) ?? defaultValue;
  },

  async set<T>(key: string, value: T): Promise<void> {
    const db = await getDB();
    await db.put('user-settings', {
      key,
      value,
      updatedAt: Date.now(),
    });
  },

  async delete(key: string): Promise<void> {
    const db = await getDB();
    await db.delete('user-settings', key);
  },

  async getAll(): Promise<Record<string, any>> {
    const db = await getDB();
    const settings = await db.getAll('user-settings');
    return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
  },
};

// 型安全な設定キー
export const SettingKeys = {
  DAILY_GOAL: 'dailyGoal',
  NOTIFICATION_ENABLED: 'notificationEnabled',
  CRAVING_TIMES: 'cravingTimes',
  THEME: 'theme',
} as const;
```

---

## チェックリスト

PWA実装時の確認項目：

### Service Worker
- [ ] Service Worker が正常に登録される
- [ ] 更新時の適切なUX（更新プロンプト）
- [ ] キャッシュ戦略が各リソースタイプに適切

### Web Push 通知
- [ ] VAPID キーが適切に設定されている
- [ ] 通知許可の段階的UX実装済み
- [ ] 通知クリック時のナビゲーション動作
- [ ] サーバーサイドの通知送信実装

### iOS 対応
- [ ] ホーム画面追加誘導UI実装済み
- [ ] apple-touch-icon 設定済み
- [ ] スプラッシュスクリーン設定済み
- [ ] セーフエリア対応CSS

### オフライン対応
- [ ] オフライン状態の検出と表示
- [ ] ローカルデータ保存（IndexedDB）
- [ ] 同期キュー実装
- [ ] 楽観的UI更新

### manifest.json
- [ ] name, short_name 設定
- [ ] icons（192x192, 512x512 以上）
- [ ] display: standalone
- [ ] start_url, scope 設定
- [ ] theme_color, background_color

---

**バージョン履歴**
- v1.0.0 (2025-11-30): Swan PWAプロジェクト用に初版作成
