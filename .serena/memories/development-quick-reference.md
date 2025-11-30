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

## データ永続化パターン（NEW! 2025-11-30）

### IndexedDB + Firestore統合使用例

#### 記録の作成（オフラインファースト）
```typescript
import { useRecords } from '@/hooks/useRecords';

function RecordButton() {
  const { createRecord, isLoading } = useRecords();

  const handleClick = async () => {
    // 自動的にIndexedDB保存 + Firestore同期
    await createRecord('resisted', ['stress', 'habit']);
  };

  return <button onClick={handleClick}>我慢できた</button>;
}
```

#### IndexedDB直接操作（低レベルAPI）
```typescript
import { saveRecord, getRecordsByDate } from '@/lib/indexeddb';

// レコード保存
const record: SmokingRecord = {
  id: `${userId}_${Date.now()}`,
  userId: 'user123',
  type: 'smoked',
  timestamp: Date.now(),
  date: '2025-11-30',
  tags: ['after_meal'],
};
await saveRecord(record);

// 日付でクエリ
const todayRecords = await getRecordsByDate('user123', '2025-11-30');
```

#### サマリー計算
```typescript
import { calculateDailySummary, formatMoney } from '@/lib/utils/summary';

const summary = calculateDailySummary(
  userId,
  '2025-11-30',
  records,
  600,  // タバコ価格（円）
  20,   // 本数/パック
  7,    // 平均喫煙時間（分）
  20    // 1日の目標本数
);

console.log(formatMoney(summary.moneySaved)); // "¥210"
```

#### 同期状態の監視
```typescript
import { hasPendingSync, processSyncQueue } from '@/lib/indexeddb';

// 未同期データの確認
const isPending = await hasPendingSync();

// 手動同期トリガー
const result = await processSyncQueue();
console.log(`${result.successful}/${result.total} 同期完了`);
```

#### 履歴データの取得（NEW! 2025-11-30）
```typescript
import { useHistory } from '@/hooks/useHistory';

function HistoryPage() {
  const {
    records,          // 期間内の全記録
    summaries,        // 日次サマリー配列
    weekStats,        // 週間統計
    isLoading,        // ローディング状態
    selectedPeriod,   // 選択中の期間（'7days' | '30days' | 'all'）
    setSelectedPeriod,// 期間変更関数
    refreshHistory,   // 手動リフレッシュ
  } = useHistory();

  return (
    <div>
      <button onClick={() => setSelectedPeriod('30days')}>
        30日間表示
      </button>
      {summaries.map(summary => (
        <div key={summary.date}>{summary.totalSmoked}本</div>
      ))}
    </div>
  );
}
```

#### 成果可視化パネル（B-03）の使用（NEW! 2025-11-30）
```typescript
import { useAchievements } from '@/hooks/useAchievements';
import { AchievementPanel } from '@/components/dashboard/AchievementPanel';

function DashboardPage() {
  const { stats: achievementStats, isLoading: achievementsLoading } = useAchievements();

  return (
    <div>
      {!achievementsLoading && achievementStats.daysTracking > 0 && (
        <AchievementPanel
          totalMoneySaved={achievementStats.totalMoneySaved}
          totalMinutesSaved={achievementStats.totalMinutesSaved}
          totalResisted={achievementStats.totalResisted}
          daysTracking={achievementStats.daysTracking}
        />
      )}
    </div>
  );
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

### Week 2 ✅ 完了（2025-11-30）
- [x] 「吸った」ボタン機能（完全実装）
- [x] タグセレクター（完全実装）
- [x] 「我慢できた」ボタン機能（完全実装）
- [x] 祝福アニメーション（Celebration.tsx）
- [x] IndexedDB統合（完全実装）
  - db.ts, records.ts, summaries.ts, settings.ts, sync.ts, index.ts
- [x] Firestore CRUD操作（完全実装）
  - lib/firebase/firestore.ts
- [x] オフライン同期ロジック（完全実装）
  - 同期キュー、バックグラウンド同期、リトライ機能
- [x] データ統合フック（hooks/useRecords.ts）
- [x] サマリー計算ユーティリティ（lib/utils/summary.ts）

### Week 3-4 ✅ SOS機能完了（2025-11-30）
- [x] 3分タイマー（SOS）
- [x] 深呼吸アニメーション
- [x] SOSモーダル統合（ダッシュボード連携）

### Week 4-5 ✅ 履歴ページ完了（2025-11-30）
- [x] 履歴ページ（日別記録一覧） ✅
  - 期間フィルター（7日間/30日間/全期間）
  - 週間統計サマリー
  - 本数推移チャート
  - 日別カード一覧
  - 詳細モーダル（タグ分析、ヒートマップ、タイムライン）

### Week 5 ✅ 設定ページ完了（2025-11-30）
- [x] Switch UIコンポーネント ✅
- [x] 設定ページ（目標設定、通知設定、コスト設定、アカウント管理） ✅
  - GoalSection.tsx（目標設定）
  - CostSection.tsx（コスト設定）
  - NotificationSection.tsx（通知設定）
  - AccountSection.tsx（アカウント管理）
  - リアルタイム保存機能
  - 保存確認メッセージ

### Phase 2 開始 ✅ 成果可視化パネル完了（2025-11-30）
- [x] 成果可視化パネル（B-03） ✅
  - AchievementPanel.tsx（4指標表示: 節約金額、取り戻した時間、我慢成功回数、記録継続日数）
  - useAchievements.ts（累積統計フック）
  - calculateCumulativeStats（累積統計計算関数）
  - 励ましメッセージ機能

**Phase 1 & B-03 完全完了！** 🎉

次のステップ: Phase 2（PWA設定、iOSインストールガイド）

## タイムゾーン対応日付ユーティリティ（date-fns使用）

### date-fns採用理由
- **Tree-shaking対応**: 使用する関数のみバンドル（軽量）
- **TypeScript完全サポート**: 型安全な日付操作
- **ローカルタイムゾーン自動使用**: ブラウザの設定に従う

### 問題: UTC vs ローカル時刻
```typescript
// ❌ 間違い: UTCで日付を取得（0時～8:59 JSTで前日になる）
const date = new Date().toISOString().split('T')[0];

// ✅ 正解: date-fnsでローカル時刻を使用
import { getLocalDateString } from '@/lib/utils/date';
const date = getLocalDateString(); // "2025-12-01"
```

### 利用可能な関数（lib/utils/date.ts）
```typescript
import {
  getLocalDateString,     // YYYY-MM-DD形式（ローカル）
  getLocalMidnight,       // 深夜0時のDateオブジェクト（startOfDay使用）
  parseLocalDateString,   // "2025-12-01" → Date（parse使用）
  getJapaneseDayLabel,    // Date → "月", "火", etc.
  getChartDateLabel,      // Date → "1(月)"
  formatDateJapanese,     // Date → "12月1日(月)"
  formatTimeString,       // timestamp → "14:30"
  getHourFromTimestamp,   // timestamp → 14 (hour)
} from '@/lib/utils/date';
```

### date-fns直接利用
```typescript
import { subDays, format, startOfDay, getTime } from 'date-fns';
import { ja } from 'date-fns/locale';

// 7日前のデータを取得
const today = startOfDay(new Date());
const startDate = subDays(today, 7);
const startTimestamp = getTime(startDate);

// 日本語フォーマット
format(new Date(), 'M月d日(E)', { locale: ja }); // "12月1日(日)"
```

## 参考リンク

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Tailwind CSS 4 Documentation](https://tailwindcss.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [@ducanh2912/next-pwa](https://github.com/DuCanhGH/next-pwa)
