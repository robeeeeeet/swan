# Swan PWA 開発クイックリファレンス

## コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# Lintチェック
npm run lint

# テスト（設定後）
npm run test
npm run test:e2e
```

## 主要ファイルパス

### 設定ファイル
- `next.config.ts` - Next.js + PWA設定
- `tailwind.config.ts` - Tailwind CSS設定（未作成、globals.cssで代用）
- `tsconfig.json` - TypeScript設定
- `.env.local` - 環境変数（.env.exampleからコピー）

### アプリケーション
- `app/layout.tsx` - ルートレイアウト
- `app/globals.css` - グローバルスタイル + デザインシステム
- `app/page.tsx` - トップページ
- `public/manifest.json` - PWAマニフェスト

### ドキュメント
- `CLAUDE.md` - Claude Code用ガイド
- `docs/requirements.md` - 機能要件定義書
- `docs/development-plan.md` - フェーズ別実装計画
- `docs/memo.md` - オリジナル仕様メモ

## Swanデザインシステム

### カラーパレット
```typescript
// CSS Custom Properties (globals.css)
--primary: #14b8a6        // Teal-500
--primary-dark: #0d9488   // Teal-600
--primary-light: #5eead4  // Teal-300

--secondary: #f97316      // Orange-500
--secondary-dark: #ea580c // Orange-600
--secondary-light: #fb923c // Orange-400

--success: #22c55e        // Green-500
--warning: #f59e0b        // Amber-500
--error: #ef4444          // Red-500
--neutral: #6b7280        // Gray-500
```

### Tailwindクラス（使用可能）
```tsx
// Primary
className="bg-primary text-white"
className="bg-primary-dark hover:bg-primary-light"

// Secondary
className="bg-secondary text-white"

// Semantic
className="bg-success text-white"
className="bg-warning text-white"
className="bg-error text-white"
className="bg-neutral text-white"
```

### タイポグラフィ
- **Font Family**: Noto Sans JP
- **Font Weights**: 400 (Regular), 500 (Medium), 700 (Bold)
- **数字**: Tabular figures（桁揃え）

### スペーシング
Tailwind CSS デフォルト（4px基準）:
- `space-1` = 4px
- `space-2` = 8px
- `space-4` = 16px
- `space-8` = 32px

### アクセシビリティ
- **最小タッチターゲット**: 44x44px
- **フォーカスリング**: 2px solid primary
- **コントラスト比**: WCAG AA準拠

## よくあるパターン

### 新しいページの作成
```bash
# 例: 設定ページ
mkdir -p app/\(main\)/settings
touch app/\(main\)/settings/page.tsx
```

```tsx
// app/(main)/settings/page.tsx
export default function SettingsPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">設定</h1>
    </div>
  );
}
```

### 新しいAPIルートの作成
```bash
# 例: 統計API
mkdir -p app/api/statistics
touch app/api/statistics/route.ts
```

```typescript
// app/api/statistics/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Statistics API' });
}
```

### Zustandストアの作成
```typescript
// store/useUserStore.ts
import { create } from 'zustand';

interface UserState {
  userId: string | null;
  setUserId: (id: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  setUserId: (id) => set({ userId: id }),
}));
```

### カスタムフックの作成
```typescript
// hooks/useOnlineStatus.ts
import { useEffect, useState } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

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

## Firebase初期化パターン

### lib/firebase/config.ts
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);
```

## トラブルシューティング

### ビルドエラー: "Turbopack with webpack config"
**原因**: PWA設定がTurbopackと互換性がない
**解決**: `next.config.ts`に`turbopack: {}`を追加

### 警告: "themeColor/viewport should be in viewport export"
**原因**: Next.js 16では`Viewport`型に分離が必要
**解決**: `app/layout.tsx`で`export const viewport: Viewport = {...}`を追加

### PWAが動作しない（開発環境）
**原因**: `disable: process.env.NODE_ENV === "development"`で無効化されている
**解決**: 正常な動作。本番ビルド（`npm run build && npm start`）で確認

### Safe Area Insetが効かない
**原因**: iOSデバイスまたはシミュレーターでないと適用されない
**解決**: Chrome DevToolsのデバイスモードまたは実機で確認

## デバッグTips

### Service Worker確認
```
Chrome DevTools > Application > Service Workers
```

### PWAマニフェスト確認
```
Chrome DevTools > Application > Manifest
```

### オフライン動作テスト
```
Chrome DevTools > Network > Offline チェック
```

### ビルド詳細ログ
```bash
npm run build 2>&1 | tee build.log
```

## Phase 1 実装チェックリスト

### Week 1 ✅ 完了
- [x] Firebase プロジェクト設定（lib/firebase/config.ts）
- [x] .env.example作成（.env.localはユーザーが設定）
- [x] Firebase Auth初期化（lib/firebase/auth.ts）
- [x] 匿名認証・Googleログイン実装
- [x] Button, Card, Modalコンポーネント
- [x] Celebrationコンポーネント（祝福アニメーション）
- [x] ダッシュボードページ基本UI
- [x] Zustandストア（user, records, settings）
- [x] TypeScript型定義
- [x] 定数ファイル（tags, messages）

### Week 2（進行中）
- [ ] 喫煙記録API（POST /api/smoke-records）
- [x] 「吸った」ボタン機能（UI実装済み）
- [x] タグセレクター（UI実装済み）
- [x] 「我慢できた」ボタン機能（UI実装済み）
- [ ] 3分タイマー（SOS）
- [ ] 深呼吸アニメーション
- [x] 祝福アニメーション（Celebration.tsx）
- [ ] IndexedDB統合
- [ ] Firestore CRUD操作

## 参考リンク

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Tailwind CSS 4 Documentation](https://tailwindcss.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [@ducanh2912/next-pwa](https://github.com/DuCanhGH/next-pwa)
