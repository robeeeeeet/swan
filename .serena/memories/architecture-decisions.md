# Swan PWA アーキテクチャ設計決定事項

## ディレクトリ構造の決定

### src/ディレクトリを使用しない理由
Next.js 16では、`src/`ディレクトリはオプションであり、プロジェクトルートに直接`app/`を配置する方法が推奨されています。Swanプロジェクトでは以下の理由でsrc/なしを採用：

1. **Next.js 16の推奨**: 公式ドキュメントでは`src/`なしがデフォルト
2. **シンプルさ**: ディレクトリ階層が1段階浅くなる
3. **モノレポ対応**: 将来的にmonorepo化する場合、ルートレベルの構造がクリア

### lib/db → lib/indexeddb への変更
- **理由**: `db`は曖昧（Database全般を指す可能性）
- **明確性**: `indexeddb`とすることで、オフライン用IndexedDBであることが明確
- **一貫性**: `lib/firebase/`と同レベルの粒度

## Tailwind CSS 4 設計

### @theme inline の活用
Tailwind CSS 4では、`@theme inline`ディレクティブでCSSカスタムプロパティとしてデザイントークンを定義できます。

```css
@theme inline {
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
  /* ... */
}
```

**利点:**
1. CSSカスタムプロパティとTailwindクラスの両方で使用可能
2. JavaScriptから`getComputedStyle()`で動的にアクセス可能
3. ダークモード対応が容易（メディアクエリでカスタムプロパティを上書き）

### iOS Safe Area対応
```css
--safe-area-inset-top: env(safe-area-inset-top);
```

iOSデバイス（特にノッチ付き）で適切にレイアウトするため、グローバルCSSでSafe Area Insetを定義。

## Next.js 16 Metadata API

### viewport と themeColor の分離
Next.js 16では、`viewport`と`themeColor`を`Metadata`から`Viewport`エクスポートに分離する必要があります。

**app/layout.tsx:**
```typescript
export const metadata: Metadata = { /* ... */ };
export const viewport: Viewport = {
  themeColor: "#14b8a6",
  /* ... */
};
```

**理由:**
- メタデータの責務分離
- 型安全性の向上
- 将来的な拡張性

## PWA設定

### @ducanh2912/next-pwa の選択理由
1. **Next.js 16対応**: 公式next-pwaよりも新しいバージョンに対応
2. **Turbopack互換**: Next.js 16のTurbopackと互換性がある
3. **Workbox統合**: Service Workerの管理が簡単

### PWA設定のポイント
```typescript
export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  fallbacks: {
    document: "/offline",
  },
})(nextConfig);
```

- **開発環境では無効化**: ホットリロードを妨げないため
- **オフラインフォールバック**: `/offline`ページを用意（Phase 2で実装予定）

## デザインシステムの実装

### カラーシステム
Swanのカラーパレットは心理的効果を考慮：

1. **Primary (Teal)**: 成長と健康のイメージ
2. **Secondary (Orange)**: 温かみと励まし
3. **Neutral (Gray)**: 判断しない記録（喫煙時）
4. **Success (Green)**: 我慢成功を祝福
5. **Warning (Amber)**: 目標超過の警告

### アクセシビリティ
```css
button, a, input, select, textarea {
  min-height: 44px;
  min-width: 44px;
}
```

- **最小タッチターゲット**: WCAG 2.1 Level AAに準拠
- **キーボードナビゲーション**: `:focus-visible`でフォーカスリング表示

### タイポグラフィ
- **フォント**: Noto Sans JP（日本語最適化）
- **数字**: Tabular figures有効（`font-feature-settings: "tnum" 1`）
  - 金額や本数の表示で桁が揃う

## Firebase 統合

### 認証戦略（✅ 実装済み - lib/firebase/auth.ts）
1. **匿名認証**: 初回アクセス時に自動で匿名ユーザー作成
2. **アップグレード**: 後からGoogle認証に切り替え可能（linkAnonymousWithGoogle）
3. **データ継続**: 匿名→認証済みへの移行時にデータを保持

### Firestore データ設計（✅ 実装完了 - 2025-11-30）

#### コレクション構造
```
records/ (トップレベルコレクション)
  └── {recordId}/
      ├── id: string (ユーザーID_タイムスタンプ)
      ├── userId: string
      ├── type: "smoked" | "craved" | "resisted"
      ├── timestamp: number (Unix timestamp)
      ├── date: string (YYYY-MM-DD)
      ├── tags: SituationTag[]
      └── note?: string

summaries/ (トップレベルコレクション)
  └── {summaryId}/ (format: userId_YYYY-MM-DD)
      ├── id: string
      ├── userId: string
      ├── date: string (YYYY-MM-DD)
      ├── totalSmoked: number
      ├── totalCraved: number
      ├── totalResisted: number
      ├── moneySaved: number
      ├── minutesSaved: number
      ├── mostCommonTags: SituationTag[]
      ├── dailyTarget: number
      ├── goalMet: boolean
      └── resistanceRate: number

settings/ (トップレベルコレクション)
  └── {userId}/
      ├── userId: string
      ├── notifications: NotificationSettings
      ├── goals: GoalSettings
      └── app: AppSettings
```

#### 設計判断
1. **トップレベルコレクション採用**
   - サブコレクションではなくトップレベル
   - 理由: クエリの柔軟性、スケーラビリティ
   - userId フィールドでフィルタリング

2. **recordId の命名規則**
   - format: `${userId}_${timestamp}`
   - 利点: 一意性保証、ユーザー識別容易

3. **summaryId の命名規則**
   - format: `${userId}_${YYYY-MM-DD}`
   - 利点: 日付ベースの一意性、クエリ最適化

### オフライン対応（✅ 実装完了 - 2025-11-30）

#### IndexedDBアーキテクチャ
**lib/indexeddb/** - 完全なオフラインファースト実装

1. **データベーススキーマ（db.ts）**
   - 4つのオブジェクトストア: records, summaries, settings, syncQueue
   - インデックス設計: userId, timestamp, date, type
   - ヘルパー関数: withStore（トランザクション管理）、withCursor（カーソルクエリ）

2. **CRUD操作**
   - records.ts: 喫煙記録のCRUD、日付・ユーザー・タイプでのクエリ
   - summaries.ts: 日次サマリーのCRUD、統計集計（aggregateSummaries）
   - settings.ts: ユーザー設定のCRUD、デフォルト設定生成

3. **同期キュー（sync.ts）**
   - オフライン時の変更をキューに保存
   - リトライメカニズム（最大3回）
   - 重複排除（deduplicateSyncQueue）
   - エラートラッキング

4. **統合データレイヤー（index.ts）**
   - オフラインファースト: すべての書き込みはまずIndexedDBへ
   - 自動同期: オンライン時はFirestoreへ即座に同期
   - バックグラウンド同期: オンライン復帰時の自動処理（setupBackgroundSync）
   - 同期状態管理: hasPendingSync, processSyncQueue

#### Firestore統合（✅ 実装完了）
**lib/firebase/firestore.ts** - Firestoreとの統合

1. **Collections**
   - records: 喫煙記録
   - summaries: 日次サマリー
   - settings: ユーザー設定

2. **CRUD操作**
   - 各コレクションのsave/get/update/delete
   - タイムスタンプ変換（Firestore Timestamp ↔ number）
   - クエリ最適化（where, orderBy, limit）

#### データフロー
```
ユーザー操作
    ↓
useRecords hook (hooks/useRecords.ts)
    ↓
lib/indexeddb/index.ts (オフラインファースト)
    ├→ IndexedDB保存（即座）
    └→ Firestore同期（オンライン時）または同期キュー追加（オフライン時）
         ↓
         オンライン復帰時: setupBackgroundSync() → processSyncQueue()
```

#### 設計判断
1. **なぜIndexedDBファーストか**
   - PWAでのオフライン動作が最優先
   - IndexedDBは同期的にアクセス可能（Firestoreはネットワーク依存）
   - ユーザー体験の一貫性（オン/オフラインで同じ挙動）

2. **同期キューの重要性**
   - オフライン時の変更を失わない
   - 重複排除で無駄な同期を防ぐ
   - リトライで一時的なネットワークエラーに対応

3. **Timestamp型の統一**
   - IndexedDB: number型（Unix timestamp in milliseconds）
   - Firestore: Timestamp型
   - 変換はfirestore.tsで一元管理

## AI統合（Gemini 2.0 Flash）

### API呼び出し戦略
1. **サーバーサイド**: `/api/ai/*`でGemini APIを呼び出し
2. **レート制限**: エンドポイントごとに適切なレート制限
3. **フォールバック**: API失敗時は事前定義メッセージを使用

### プロンプト設計
ユーザーコンテキストに含める情報：
- 喫煙履歴（直近7日間）
- タグの頻度分布
- 目標達成状況
- 時間帯パターン

## Web Push通知

### iOS対応の要件
- iOS Safari 16.4+必須
- **ホーム画面に追加**が必須（iOSの制約）
- ユーザーガイダンスが重要（E-02: iOSインストールガイド）

### プライバシー配慮
通知内容は2段階：
1. **汎用メッセージ**: 「Swanからのお知らせ」（デフォルト）
2. **詳細メッセージ**: 設定でオプトイン時のみ

## パフォーマンス最適化

### Core Web Vitals 目標
- LCP (Largest Contentful Paint): < 2.5秒
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### 最適化戦略
1. **画像最適化**: Next.js Image コンポーネント活用
2. **フォント最適化**: `display: swap`でFOIT回避
3. **コード分割**: 動的インポートで初期バンドルサイズ削減
4. **Service Worker キャッシュ**: 静的アセットを積極的にキャッシュ

## タイムゾーン対応（date-fns採用: 2025-12-01）

### 問題: UTCとローカル時刻の混在
JavaScriptの`toISOString()`はUTC時刻を返すため、日本（JST = UTC+9）では問題が発生：
- 午前0時～8時59分（JST）に記録すると、UTCでは前日の日付になる
- 例: 2024年1月1日 01:00 JST → 2023年12月31日 16:00 UTC

### 解決策: date-fns採用
すべての日付操作にdate-fnsを使用：

```typescript
// lib/utils/date.ts - date-fnsベースの実装
import { format, startOfDay, parse, getDay, getDate, getHours } from 'date-fns';
import { ja } from 'date-fns/locale';

export function getLocalDateString(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}

export function getLocalMidnight(date: Date = new Date()): Date {
  return startOfDay(date);
}
```

### date-fns採用理由
1. **Tree-shaking対応**: 必要な関数のみバンドル（バンドルサイズ最小化）
2. **TypeScript完全サポート**: 型定義が完璧、IDE補完が効く
3. **ローカルタイムゾーン自動使用**: ブラウザの設定に自動で従う
4. **関数型API**: 純粋関数で副作用なし、テストしやすい
5. **日本語ロケール対応**: `ja`ロケールで曜日等の日本語表示

### 主な置き換えパターン
```typescript
// 日付の減算
// Before: date.setDate(date.getDate() - 7)
// After:  subDays(date, 7)

// 深夜0時取得
// Before: date.setHours(0, 0, 0, 0)
// After:  startOfDay(date)

// タイムスタンプ取得
// Before: date.getTime()
// After:  getTime(date)

// 日本語フォーマット
// Before: 手動で組み立て
// After:  format(date, 'M月d日(E)', { locale: ja })
```

### 影響範囲
以下のファイルを更新：
- `lib/utils/date.ts` - date-fnsベースに全面書き換え
- `lib/utils/summary.ts` - date.tsからインポート
- `hooks/useHistory.ts` - `subDays`, `getTime`使用
- `app/(main)/history/page.tsx` - `subDays`使用
- `components/history/DayDetailModal.tsx` - `getHourFromTimestamp`使用

### 設計判断
1. **date-fns採用**: PWAでバンドルサイズ重視、Tree-shakingで最適化
2. **ラッパー関数維持**: 既存APIとの互換性を保持
3. **後方互換性**: 既存のYYYY-MM-DD形式を維持

## SOS認証ガード（2025-12-01 NEW!）

### 問題: 認証なしでSOS機能にアクセス可能
`/sos/timer`や`/sos/breathing`は`(main)`ルートグループの外にあり、認証ガードが適用されていなかった。

### 解決策: app/sos/layout.tsx
`(main)/layout.tsx`と同じ認証ロジックを持つレイアウトを作成：

```typescript
// app/sos/layout.tsx
'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function SOSLayout({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return null;
  return <>{children}</>;
}
```

### 設計判断
1. **レイアウトベース**: ルートグループを変更せず、レイアウトで認証を管理
2. **コード重複許容**: (main)とsosで同じ認証ロジックを持つが、将来的に異なる要件が出る可能性を考慮
3. **ローディングUI**: 一貫したローディング体験を提供

## Tips評価システム設計（2025-12-07 NEW!）

### Wilson Score Lower Bound採用理由

#### 選択肢の検討
| アルゴリズム | メリット | デメリット |
|-------------|---------|-----------|
| **Wilson Score** ✅採用 | 少ないサンプルでも公平、Redditで実績 | 計算がやや複雑 |
| 単純平均 | 理解しやすい | サンプル1で100%になる問題 |
| ベイズ推定 | 理論的に正確 | 事前分布の選定が難しい |
| Laplace smoothing | シンプル | 評価数が増えると影響が薄まる |

#### Wilson Score の特徴
1. **保守的な評価**: 下限値を使うため、少ない評価で過大評価されにくい
2. **Redditの実績**: 大規模ランキングシステムで採用実績あり
3. **探索と活用のバランス**: 未評価Tipsに50%の初期スコアを与え、試行機会を確保

#### 重み計算式
```typescript
// Wilson Score: 0〜1
const wilsonScore = calculateWilsonScore(goodCount, badCount);

// 選択重み: 0.1〜1.0
const weight = Math.max(0.1, 0.3 + wilsonScore * 0.7);
```

**設計判断**:
- **最低10%保証**: Bad評価のTipsも再評価のチャンスがある
- **未評価は50%**: 新しいTipsは中程度の確率で表示される
- **Good 100%で最大1.0**: 高評価Tipsは確実に表示される

### 時間帯フィルタリング設計

#### 要件
- 「シャワーを浴びる」は仕事中に表示したくない
- 「パワーナップ」は朝に表示しても意味がない
- 休日はゆったり過ごせるので制限を緩和したい

#### 解決策
```typescript
interface Tip {
  timeSlots: TimeSlot[];  // 空配列 = 全時間帯OK
  dayTypes: DayType[];    // 空配列 = 全曜日OK
}
```

- 休日（土日）は時間帯制限を無視して全Tips表示
- 平日は `timeSlots` でフィルタリング
- `timeSlots: []` の場合は常に表示対象

### IndexedDBスキーマ拡張

#### DB Version 1 → 2
```typescript
// 新規オブジェクトストア
TIP_RATINGS: 'tipRatings'       // 評価データ
TIP_RATING_HISTORY: 'tipRatingHistory' // 評価履歴（分析用）
```

#### 設計判断
1. **ローカルオンリー**: 評価データはFirestoreに同期しない
   - 理由: プライバシー（どのTipsを評価したかは個人情報）
   - 理由: シンプルさ（同期ロジック不要）
2. **履歴保持**: 全評価履歴を保持（将来のパターン分析用）
3. **キー設計**: `tipId` をキーにして高速アクセス

## Tipsシステム設計（2025-12-01 NEW!）

### CSV → TypeScript変換の決定
ユーザーから提供されたCSV形式のTipsデータを、TypeScriptの型安全な配列に変換して管理。

#### 選択肢の検討
| 方法 | メリット | デメリット |
|------|---------|-----------|
| **constants/tips.ts に直接定義** ✅採用 | 型安全、コンパイル時エラー検出、Tree-shaking可能 | CSVと二重管理が必要 |
| public/data/tips.csv | 非エンジニアでも編集可能 | ランタイムfetch必要、型安全性低 |
| ビルド時変換 | 最新CSVを常に反映 | 複雑なビルドパイプライン必要 |

#### 採用理由
1. **型安全性**: `TipCategory`のunion型でカテゴリーの誤りをコンパイル時に検出
2. **パフォーマンス**: fetchなしで即座にアクセス可能
3. **拡張性**: `getTipsByCategory()`などのヘルパー関数で柔軟な検索
4. **バンドル最適化**: 使用しないカテゴリーのTipsはTree-shakingで除外可能

### カテゴリー設計
9つのカテゴリーに分類（CSVの「カテゴリー」列をそのまま採用）:

```typescript
export type TipCategory =
  | '感覚刺激'      // 水、歯磨き、氷など
  | '呼吸法'        // 深呼吸
  | '代替行動'      // ガム、ゲーム、ツボ押しなど
  | '心理・認知'    // タイマー、衝動サーフィンなど
  | '運動'          // ストレッチ、スクワット
  | '環境調整'      // 場所移動、掃除
  | '食事・栄養'    // ビタミンC、ハーブティー
  | 'コミュニケーション' // サポーターへ連絡
  | '急速休息';     // パワーナップ
```

### 将来の拡張ポイント

#### 1. カテゴリーベースの推薦システム
状況タグ（SituationTag）とTipsカテゴリーのマッピング:

```typescript
const TAG_TO_CATEGORY: Record<SituationTag, TipCategory[]> = {
  'stress': ['心理・認知', '呼吸法', '運動'],
  'after_meal': ['代替行動', '感覚刺激'],
  'break': ['運動', '環境調整'],
  'with_alcohol': ['代替行動', '心理・認知'],
  'bored': ['代替行動', '運動', 'コミュニケーション'],
  // ...
};
```

SOS機能で「吸いたい」を押した時、選択されたタグに基づいて最適なTipsを提案可能。

#### 2. お気に入り・効果記録機能
```typescript
interface TipFeedback {
  tipId: number;
  userId: string;
  wasHelpful: boolean;
  usedAt: number; // timestamp
}
```

ユーザーが「このTipsが役に立った」とマークできる機能。データを蓄積してパーソナライズ。

#### 3. AI統合（Phase 3）
Gemini APIを使って、ユーザーの状況・履歴に基づいたTips選択:

```typescript
// 将来的なAPI例
async function getAISuggestedTip(context: UserContext): Promise<Tip> {
  const prompt = `
    ユーザーの状況: ${context.tags.join(', ')}
    最近効果があったTips: ${context.recentEffectiveTips.join(', ')}
    以下のTipsから最適なものを1つ選んでください...
  `;
  // Gemini API呼び出し
}
```

#### 4. Tips効果のA/Bテスト
どのカテゴリーのTipsが最も効果的か統計分析:
- 表示後に「我慢できた」が押された率
- カテゴリー別の抵抗成功率

## Phase 3 アーキテクチャ決定（2025-12-06、2025-12-07バグ修正完了）

### Gemini AI 統合設計

#### クライアント構成（lib/ai/client.ts）
1. **@google/genai SDK採用**
   - 公式SDK使用でAPI変更に追従しやすい
   - TypeScript型定義完備
   - ストリーミング対応

2. **生成設定**
   ```typescript
   COACHING_GENERATION_CONFIG = {
     temperature: 0.8,    // 創造性を高めつつ一貫性を保持
     maxOutputTokens: 500, // 簡潔なメッセージに制限
     topP: 0.95,          // 多様性確保
   }
   ```

3. **エラーハンドリング戦略**
   - API障害時はフォールバックメッセージを使用
   - 6種類のメッセージタイプ別にフォールバック用意
   - ユーザー体験を途切れさせない設計

### プロンプト設計（lib/ai/prompts.ts）

#### 設計原則
1. **日本語ネイティブ**: 全プロンプトを日本語で記述
2. **コンテキスト活用**: ユーザーの実績データを含める
3. **トーン統一**: 励まし・判断しない・ポジティブ

#### メッセージタイプ
| タイプ | 用途 | トリガー |
|--------|------|----------|
| morning_briefing | 朝の励まし | Cron 7:00 JST |
| craving_alert | 先回りアラート | Cron 5回/日 |
| step_down | 目標下げ提案 | Cron 日曜20:00 |
| survival_check | 生存確認 | Cron 4回/日 |
| sos_encouragement | SOS励まし | SOSモーダル表示時 |
| success_celebration | 成功祝福 | 我慢成功時 |

### Push通知アーキテクチャ（lib/push/）

#### Firebase Admin SDK vs クライアントSDK
- **Admin SDK**: サーバーサイドでの通知送信（Cron/API）
- **クライアントSDK**: トークン取得・フォアグラウンド通知

#### 購読フロー
```
ユーザーアクション
  ↓
usePushPermission.subscribe()
  ↓
Notification.requestPermission()
  ↓
getToken() (FCM)
  ↓
Firestore保存（users/{userId}/pushSubscriptions/）
  ↓
Cron Jobsがトークンを使って通知送信
```

#### iOS対応
- PWAとしてホーム画面追加が必須
- `isIOSRequiringInstallation()` で検出
- インストールガイドへの誘導

### Cron Jobs設計（vercel.json）- 最終更新: 2025-12-07

#### ⚠️ Vercel Hobbyプラン制限
**重要**: Vercel Hobbyプランでは Cron Jobs が**1日1回のみ**実行可能。
そのため、以下の設計を採用：

1. **優先ジョブの選定**: morning-briefing を最優先（毎日の習慣形成に最重要）
2. **他機能の代替**: C-02〜C-04のAPIは実装済みのため、将来Proプラン移行で即座に有効化可能
3. **手動トリガー対応**: 開発・テスト時はcurlで手動実行可能

#### 現在のスケジュール（Hobbyプラン）
| ジョブ | UTC | JST | 状態 |
|--------|-----|-----|------|
| morning-briefing | 22:00 | 07:00 | ✅ 自動実行 |

#### Proプラン移行時のスケジュール
| ジョブ | UTC | JST | 理由 |
|--------|-----|-----|------|
| morning-briefing | 22:00 | 07:00 | 起床後の通知 |
| craving-alert | 0:30,3:30... | 9:30,12:30... | 魔の時間帯の10分前 |
| survival-check | 23:00,3:00... | 8:00,12:00... | 4時間おきの確認 |
| step-down | 11:00 日曜 | 20:00 日曜 | 週末の振り返り |

#### セキュリティ
- `CRON_SECRET` ヘッダー検証
- Vercel Cronからのリクエストのみ許可
- 不正アクセス防止

### iOSインストールガイド設計（E-02）

#### 検出ロジック（hooks/useInstallPrompt.ts）
```typescript
// iOS判定
/(iPhone|iPad|iPod)/.test(navigator.userAgent)

// インストール済み判定
window.matchMedia('(display-mode: standalone)').matches

// 表示条件
shouldShowGuide = isIOS && !isInstalled && !dismissed
```

#### UXフロー
1. ダッシュボードにバナー表示
2. クリックでインストールガイドページへ
3. 4ステップの視覚的ガイド
4. 7日間dismiss機能（localStorage）

## セキュリティ考慮事項

### 環境変数管理
- **クライアント公開**: `NEXT_PUBLIC_*`プレフィックス
- **サーバー限定**: API鍵（Gemini, Cron Secret）
- **Git除外**: `.env.local`は.gitignoreに含める

### CSP (Content Security Policy)
Phase 4で実装予定：
- インラインスクリプト制限
- 外部ドメイン制限
- XSS対策

### データ保護
- **最小限の収集**: 名前やメールは任意
- **暗号化通信**: HTTPS必須
- **匿名化**: 統計データは個人特定不可能に
