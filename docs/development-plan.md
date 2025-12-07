# Swan PWA 禁煙・減煙アプリ 開発計画書

## 1. プロジェクト概要

| 項目 | 内容 |
|------|------|
| プロジェクト名 | Swan（スワン） |
| 開発開始日 | 2025-11-30 |
| 開発方式 | MVP（最小実行可能製品）ファースト |

---

## 2. 技術スタック

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| フロントエンド | Next.js (App Router) | 16.0.7 |
| UI Framework | React | 19.2.0 |
| 言語 | TypeScript | 5.x |
| スタイリング | Tailwind CSS | 4.x |
| 状態管理 | Zustand | 5.0.8 |
| データベース | Firebase Firestore | 12.6.0 |
| 認証 | Firebase Auth（匿名認証対応） | 12.6.0 |
| Push通知 | Firebase Cloud Messaging (FCM) | 12.6.0 |
| AI/LLM | Gemini 2.0 Flash API | - |
| ホスティング | Vercel（Cron Jobs活用） | - |
| PWA | @ducanh2912/next-pwa (Workbox) | 10.2.9 |

---

## 3. ディレクトリ構造

```
swan/
├── public/
│   ├── icons/              # PWAアイコン（各サイズ）
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-144x144.png
│   │   ├── icon-152x152.png
│   │   ├── icon-192x192.png
│   │   ├── icon-384x384.png
│   │   ├── icon-512x512.png
│   │   └── apple-touch-icon.png
│   ├── splash/             # iOSスプラッシュスクリーン
│   └── manifest.json       # PWAマニフェスト
├── app/                    # Next.js App Router (no src/ directory)
│   ├── (auth)/             # 認証関連ルート
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── onboarding/
│   │       └── page.tsx
│   ├── (main)/             # メインアプリルート
│   │   ├── page.tsx        # ダッシュボード（ホーム）
│   │   ├── history/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── sos/                # SOSフロー（フルスクリーン）
│   │   ├── page.tsx        # 戦略選択
│   │   ├── timer/
│   │   │   └── page.tsx
│   │   ├── breathing/
│   │   │   └── page.tsx
│   │   └── result/
│   │       └── page.tsx
│   ├── offline/
│   │   └── page.tsx        # オフラインフォールバック
│   ├── api/                # API Routes
│   │   ├── smoke-records/
│   │   │   └── route.ts
│   │   ├── coping-records/
│   │   │   └── route.ts
│   │   ├── statistics/
│   │   │   └── route.ts
│   │   ├── push/
│   │   │   ├── subscribe/
│   │   │   │   └── route.ts
│   │   │   └── send/
│   │   │       └── route.ts
│   │   ├── ai/
│   │   │   ├── encouragement/
│   │   │   │   └── route.ts
│   │   │   └── coaching/
│   │   │       └── route.ts
│   │   └── cron/
│   │       ├── morning-briefing/
│   │       │   └── route.ts
│   │       └── craving-alert/
│   │           └── route.ts
│   ├── layout.tsx          # ルートレイアウト
│   ├── globals.css         # グローバルスタイル
│   └── providers.tsx       # Context Providers
├── components/             # Reactコンポーネント
│   ├── ui/                 # 基本UIコンポーネント
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── ProgressRing.tsx
│   │   ├── Toast.tsx
│   │   └── index.ts
│   ├── dashboard/          # ダッシュボード関連
│   │   ├── GoalHeader.tsx
│   │   ├── ActionButtons.tsx
│   │   ├── AchievementPanel.tsx
│   │   ├── RandomTips.tsx
│   │   └── CounterDisplay.tsx
│   ├── sos/                # SOS関連
│   │   ├── TimerScreen.tsx
│   │   ├── BreathingAnimation.tsx
│   │   ├── EncouragementMessage.tsx
│   │   └── StrategySelector.tsx
│   ├── records/            # 記録関連
│   │   ├── TagSelector.tsx
│   │   ├── RecordConfirmation.tsx
│   │   └── HistoryList.tsx
│   ├── settings/           # 設定関連
│   │   ├── NotificationSettings.tsx
│   │   ├── GoalSettings.tsx
│   │   └── ProfileSettings.tsx
│   ├── pwa/                # PWA関連
│   │   ├── IOSInstallPrompt.tsx
│   │   ├── UpdatePrompt.tsx
│   │   ├── OfflineIndicator.tsx
│   │   └── PushPermissionPrompt.tsx
│   ├── animations/         # アニメーション
│   │   ├── Celebration.tsx
│   │   └── Confetti.tsx
│   └── layout/             # レイアウト
│       ├── Header.tsx
│       ├── BottomNav.tsx
│       └── SafeArea.tsx
├── hooks/                  # カスタムフック
│   ├── useRecords.ts       ✅ 実装済み（IndexedDB+Firestore統合）
│   ├── useCopingRecord.ts
│   ├── useGoal.ts
│   ├── useStatistics.ts
│   ├── usePushPermission.ts
│   ├── useIOSInstallPrompt.ts
│   ├── useOnlineStatus.ts
│   └── useServiceWorker.ts
├── lib/                    # ユーティリティ・サービス
│   ├── firebase/
│   │   ├── config.ts       ✅ 実装済み
│   │   ├── auth.ts         ✅ 実装済み
│   │   └── firestore.ts    ✅ 実装済み（CRUD操作フル実装）
│   ├── indexeddb/          # IndexedDB（オフライン用）✅ 実装済み
│   │   ├── db.ts           ✅ スキーマ定義・DB初期化
│   │   ├── records.ts      ✅ 喫煙記録CRUD
│   │   ├── summaries.ts    ✅ サマリーCRUD
│   │   ├── settings.ts     ✅ 設定CRUD
│   │   ├── sync.ts         ✅ 同期キュー管理
│   │   └── index.ts        ✅ 統合データレイヤー（offline-first）
│   ├── push/
│   │   ├── config.ts
│   │   └── client.ts
│   ├── ai/
│   │   ├── gemini.ts
│   │   └── prompts.ts
│   └── utils/
│       ├── date.ts         ✅ 実装済み（date-fns使用、タイムゾーン対応）
│       └── summary.ts      ✅ 実装済み（統計計算・フォーマット）
├── store/                  # Zustand ストア
│   ├── useUserStore.ts
│   ├── useRecordStore.ts
│   └── useSettingsStore.ts
├── types/                  # TypeScript型定義
│   ├── smoke-record.ts
│   ├── coping-record.ts
│   ├── user.ts
│   ├── notification.ts
│   └── api.ts
├── constants/              # 定数
│   ├── tags.ts
│   ├── tips.ts
│   └── encouragement.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.local              # 環境変数（ローカル）
├── .env.example            # 環境変数サンプル
├── next.config.js          # Next.js設定
├── tailwind.config.js      # Tailwind設定
├── tsconfig.json           # TypeScript設定
├── package.json
├── vercel.json             # Vercel設定（Cron等）
└── firebase.json           # Firebase設定
```

---

## 4. データベース設計

### 4.1 Firestore コレクション構造

```
firestore/
├── users/{userId}/
│   ├── profile             # ユーザープロフィール
│   ├── settings            # ユーザー設定
│   ├── pushSubscriptions/  # Push購読情報
│   │   └── {subscriptionId}
│   ├── smokeRecords/       # 喫煙記録
│   │   └── {recordId}
│   ├── copingRecords/      # 対処記録
│   │   └── {recordId}
│   └── dailyStats/         # 日別統計
│       └── {YYYY-MM-DD}
```

### 4.2 スキーマ定義

```typescript
// users/{userId}/profile
interface UserProfile {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  displayName?: string;
  cigarettePricePerPack: number;    // 1箱あたりの価格（円）
  cigarettesPerPack: number;         // 1箱あたりの本数
  dailyAverage?: number;             // 禁煙前の1日平均本数
  quitStartDate?: Timestamp;         // 減煙開始日
  timezone: string;                  // タイムゾーン
}

// users/{userId}/settings
interface UserSettings {
  id: string;
  updatedAt: Timestamp;
  dailyGoal: number;                 // 1日の目標本数
  goalAutoAdjust: boolean;           // 自動調整有効
  notificationEnabled: boolean;
  morningBriefingTime: string;       // HH:MM形式
  morningBriefingEnabled: boolean;
  cravingAlertEnabled: boolean;
  cravingAlertMinutesBefore: number;
  reminderEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

// users/{userId}/smokeRecords/{recordId}
interface SmokeRecord {
  id: string;
  createdAt: Timestamp;
  timestamp: Timestamp;
  type: 'smoked' | 'resisted';
  tag?: string;
  note?: string;
  cravingRecordId?: string;
  localId: string;                   // オフライン対応用
}

// users/{userId}/copingRecords/{recordId}
interface CopingRecord {
  id: string;
  createdAt: Timestamp;
  timestamp: Timestamp;
  strategy: 'timer' | 'breathing' | 'tips' | 'other';
  durationSeconds: number;
  success: boolean;
  smokeRecordId?: string;
  localId: string;
}

// users/{userId}/dailyStats/{date}
interface DailyStats {
  date: string;                      // YYYY-MM-DD
  smokedCount: number;
  resistedCount: number;
  cravingCount: number;
  goal: number;
  goalAchieved: boolean;
  moneySaved: number;
  tags: Record<string, number>;
  updatedAt: Timestamp;
}
```

### 4.3 IndexedDB スキーマ（オフライン用）✅ 実装完了（2025-11-30）

**実装済みスキーマ:**

```typescript
// Database: SwanDB (version 1)
// Location: lib/indexeddb/db.ts

export const STORES = {
  RECORDS: 'records',      // 喫煙記録（SmokingRecord型）
  SUMMARIES: 'summaries',  // 日別サマリー（DailySummary型）
  SETTINGS: 'settings',    // ユーザー設定（UserSettings型）
  SYNC_QUEUE: 'syncQueue', // オフライン同期キュー（SyncQueueItem型）
} as const;

// records オブジェクトストア
interface SmokingRecord {
  id: string;              // キー: userId_timestamp
  userId: string;
  type: 'smoked' | 'craved' | 'resisted';
  timestamp: number;       // Unixタイムスタンプ（ミリ秒）
  date: string;            // YYYY-MM-DD形式
  tags: SituationTag[];    // 状況タグ配列
}
// Indexes: userId, timestamp, date, type

// summaries オブジェクトストア
interface DailySummary {
  id: string;              // キー: userId_YYYY-MM-DD
  userId: string;
  date: string;
  totalSmoked: number;
  totalCraved: number;
  totalResisted: number;
  moneySaved: number;
  minutesSaved: number;
  mostCommonTags: SituationTag[];
  dailyTarget: number;
  goalMet: boolean;
  resistanceRate: number;
}
// Indexes: userId, date

// settings オブジェクトストア
interface UserSettings {
  userId: string;          // キー
  notifications: NotificationSettings;
  goals: GoalSettings;
  app: AppSettings;
}
// Indexes: なし（userIdがキー）

// syncQueue オブジェクトストア
interface SyncQueueItem {
  id: string;              // キー: storeName_operation_documentId_timestamp
  storeName: string;       // 対象ストア名
  operation: 'create' | 'update' | 'delete';
  documentId: string;      // Firestore document ID
  data?: any;              // 同期するデータ（deleteは不要）
  timestamp: number;       // キュー追加時刻
  retries: number;         // リトライ回数（最大3回）
  lastError?: string;      // 最後のエラーメッセージ
}
// Indexes: timestamp, storeName
```

**実装済み機能:**
- ✅ オフライン優先アーキテクチャ（IndexedDB → Firestore）
- ✅ 自動同期キュー（オンライン復帰時に処理）
- ✅ 重複排除機能（同一文書の複数操作を最新のみに集約）
- ✅ リトライ機構（最大3回、失敗時はエラー記録）
- ✅ バックグラウンド同期（window.onlineイベントで自動実行）

---

## 5. API設計

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| POST | /api/smoke-records | 喫煙/我慢記録を作成 | 必須 |
| GET | /api/smoke-records | 記録一覧を取得 | 必須 |
| GET | /api/smoke-records/today | 今日の記録を取得 | 必須 |
| DELETE | /api/smoke-records/{id} | 記録を削除 | 必須 |
| POST | /api/coping-records | 対処記録を作成 | 必須 |
| GET | /api/statistics | 統計データを取得 | 必須 |
| GET | /api/statistics/daily | 日別統計を取得 | 必須 |
| POST | /api/push/subscribe | Push通知を購読 | 必須 |
| DELETE | /api/push/unsubscribe | Push通知を解除 | 必須 |
| POST | /api/ai/encouragement | AI励ましメッセージ生成 | 必須 |
| POST | /api/ai/coaching | AIコーチング | 必須 |
| POST | /api/cron/morning-briefing | 朝のブリーフィング（Cron） | Cron |
| POST | /api/cron/craving-alert | 魔の時間帯アラート（Cron） | Cron |

---

## 6. 開発フェーズ

### Phase 1: MVP基盤（Week 1-2）

**目標:** 基本的な記録機能と即座に価値を提供するSOS機能

#### Week 1: 環境構築 + 基本UI

| タスク | 成果物 |
|--------|--------|
| Next.js + Tailwind + TypeScript初期化 | 動作するNext.jsアプリ |
| Firebase プロジェクト作成・設定 | Firebase接続完了 |
| 認証実装（匿名 + Google） | ログイン/ログアウト機能 |
| Swan Design System実装 | Tailwind設定完了 |
| 基本UIコンポーネント（Button, Card, Modal） | コンポーネントライブラリ |
| ダッシュボードページ実装（A-01, A-02, B-01） | ホーム画面 |

#### Week 2: 記録機能 + データ永続化層 ✅ 完了（2025-11-30）

| タスク | 成果物 | 状態 |
|--------|--------|------|
| IndexedDB スキーマ設計・実装 | `lib/indexeddb/db.ts` | ✅ 完了 |
| IndexedDB CRUD操作実装 | `lib/indexeddb/{records,summaries,settings}.ts` | ✅ 完了 |
| オフライン同期キュー実装 | `lib/indexeddb/sync.ts` | ✅ 完了 |
| Firestore CRUD操作実装 | `lib/firebase/firestore.ts` | ✅ 完了 |
| 統合データレイヤー実装 | `lib/indexeddb/index.ts` (offline-first) | ✅ 完了 |
| サマリー計算ユーティリティ | `lib/utils/summary.ts` | ✅ 完了 |
| useRecords フック実装 | `hooks/useRecords.ts` | ✅ 完了 |
| ダッシュボード統合・動作確認 | `app/(main)/dashboard/page.tsx` | ✅ 完了 |
| 「吸った」ボタン機能実装（A-01） | カウンター機能 | ✅ 完了 |
| タグ選択UI実装（A-04） | タグセレクター | ✅ 完了 |
| 「我慢できた」ボタン機能実装（A-03） | 成功記録機能 | ✅ 完了 |

#### Week 3: SOS機能 ✅ 完了（2025-11-30）

| タスク | 成果物 | 状態 |
|--------|--------|------|
| SOS画面実装（D-01: 3分タイマー） | タイマー画面 | ✅ 完了 |
| 深呼吸アニメーション実装（D-02） | 呼吸ガイド画面 | ✅ 完了 |
| 祝福アニメーション実装 | Celebration コンポーネント | ✅ 完了 |
| SOSモーダル統合 | SOSModal コンポーネント | ✅ 完了 |

#### Week 4: 履歴ページ実装 ✅ 完了（2025-11-30）

| タスク | 成果物 | 状態 |
|--------|--------|------|
| useHistory フック実装 | `hooks/useHistory.ts` | ✅ 完了 |
| 日別サマリーカード実装 | `components/history/HistoryCard.tsx` | ✅ 完了 |
| 週間統計カード実装 | `components/history/WeekStats.tsx` | ✅ 完了 |
| 本数推移チャート実装 | `components/history/SimpleBarChart.tsx` | ✅ 完了 |
| 日別詳細モーダル実装 | `components/history/DayDetailModal.tsx` | ✅ 完了 |
| 履歴メインページ実装 | `app/(main)/history/page.tsx` | ✅ 完了 |
| サマリー計算関数拡張 | `formatDate()`, `formatTime()` 追加 | ✅ 完了 |

**Phase 1 完了機能（2025-11-30 完全完了）:**
- ✅ ユーザー認証（匿名認証）
- ✅ 喫煙記録（「吸った」ボタン + タグ）
- ✅ 我慢成功記録（「我慢できた」ボタン + タグ）
- ✅ 今日のカウント表示
- ✅ オフライン対応（IndexedDB + 自動同期）
- ✅ **SOS機能**
  - 3分タイマー（D-01）
  - 深呼吸ガイド（D-02）
  - SOSモーダル統合
  - 祝福アニメーション
- ✅ **履歴ページ**
  - 期間フィルター（7日間/30日間/全期間）
  - 週間統計サマリー
  - 本数推移チャート（直近7日間）
  - 日別記録カード（タグプレビュー付き）
  - 詳細モーダル（タグ分析・ヒートマップ・タイムライン）
- ✅ **設定ページ（2025-11-30）**
  - 目標設定（日次目標本数、自動ステップダウン）
  - コスト設定（タバコ価格、1本あたり計算）
  - 通知設定（マスタースイッチ、4種類の通知、プライバシーモード）
  - アカウント管理（Google連携、サインアウト）
- ✅ **成果可視化パネル（B-03）（2025-11-30）**
  - 節約金額表示
  - 取り戻した時間（寿命）表示
  - 我慢成功回数
  - 記録継続日数
  - 状況に応じた励ましメッセージ
- ✅ データ永続化層（Firestore統合）

**Phase 1 バグ修正（2025-12-01 完了）:**
- ✅ **タイムゾーン修正 + date-fns採用**: `lib/utils/date.ts`をdate-fnsベースに実装
  - `format`, `startOfDay`, `subDays`, `getTime`, `parse`等を使用
  - ローカルタイムゾーン自動使用（ブラウザ設定に従う）
  - Tree-shaking対応で軽量バンドル
- ✅ **SOS認証ガード**: `app/sos/layout.tsx` 新規作成（未認証アクセス防止）
- ✅ **設定ページ修正**: 数値入力のローカルステート管理、Switch レイアウト修正
- ✅ **SOSページ修正**: React setState エラー解消、ナビゲーション改善
- ✅ **モーダル修正**: ボタン視認性改善（outline バリアント使用）

---

### Phase 2: PWA設定（Week 5-6）

**目標:** PWA基盤整備とインストール対応

| タスク | 成果物 | 状態 |
|--------|--------|------|
| ~~成果可視化パネル実装（B-03）~~ | ✅ Phase 1で完了（2025-11-30） | ✅ 完了 |
| ~~統計API実装~~ | ✅ useAchievements フック実装済み | ✅ 完了 |
| ~~ランダムTips実装（B-02）~~ | ✅ Phase 1で完了 | ✅ 完了 |
| ~~設定画面基本実装~~ | ✅ Phase 1で完了 | ✅ 完了 |
| PWA基本設定（manifest.json, next-pwa） | PWAインストール可能 | ✅ 完了（2025-12-03） |
| オフラインページ（/offline） | オフラインフォールバック | ✅ 完了（2025-12-03） |
| iOS インストール誘導UI実装（E-02） | インストールガイド | ✅ 完了（2025-12-03） |
| ~~オフライン対応（IndexedDB同期）~~ | ✅ Phase 1で完了 | ✅ 完了 |
| ~~カレンダー/履歴表示実装（E-03）~~ | ✅ Phase 1で完了 | ✅ 完了 |

**Phase 2 完了時の機能:**
- Phase 1 の全機能（認証、記録、SOS、履歴、設定、成果可視化、データ永続化）
- PWAインストール（iOS含む）
- iOSインストールガイド

---

### Phase 3: Web Push通知 + AIコーチング ✅ 完了（2025-12-06）

**目標:** Push通知とAI機能による能動的サポート

| タスク | 成果物 | 状態 |
|--------|--------|------|
| Push通知基盤構築（FCM, VAPID） | `lib/firebase/admin.ts`, `lib/push/subscription.ts` | ✅ 完了 |
| 通知許可誘導UI実装（E-01） | `components/pwa/PushPermissionPrompt.tsx` | ✅ 完了 |
| Gemini API連携基盤 | `lib/ai/client.ts` | ✅ 完了 |
| AI励ましメッセージ実装（D-03強化） | `components/sos/SOSModal.tsx` 更新 | ✅ 完了 |
| モーニング・ブリーフィング実装（C-01） | `app/api/cron/morning-briefing/route.ts` | ✅ 完了 |
| Vercel Cron設定 | `vercel.json` | ✅ 完了 |
| 魔の時間帯予測ロジック実装 | `lib/ai/coaching.ts` - getTypicalCravingHours | ✅ 完了 |
| 魔の時間帯アラート実装（C-02） | `app/api/cron/craving-alert/route.ts` | ✅ 完了 |
| 生存確認通知実装（C-04） | `app/api/cron/survival-check/route.ts` | ✅ 完了 |
| ステップダウン提案実装（C-03） | `app/api/cron/step-down/route.ts` | ✅ 完了 |

**Phase 3 実装詳細（2025-12-06）:**

##### Push通知基盤
- **lib/firebase/admin.ts** - Firebase Admin SDK初期化
  - `getAdminMessaging()` - FCMインスタンス取得
  - `sendPushNotification()` - 単一デバイス送信
  - `sendSwanNotification()` - Swan専用通知送信
- **public/firebase-messaging-sw.js** - FCM Service Worker
- **lib/push/subscription.ts** - プッシュ購読管理
  - `isPushNotificationSupported()` - ブラウザサポート確認
  - `getFCMToken()` - FCMトークン取得
  - `subscribeToPushNotifications()` - 購読フロー
- **hooks/usePushPermission.ts** - 通知許可フック（7状態管理）
- **components/pwa/PushPermissionPrompt.tsx** - 許可UI（3バリアント）

##### Gemini AI連携
- **lib/ai/client.ts** - `@google/genai` SDK使用
- **lib/ai/prompts.ts** - 6種類のプロンプト + フォールバック
- **lib/ai/coaching.ts** - コーチングサービス
- **app/api/coaching/route.ts** - コーチングAPI
- **hooks/useCoaching.ts** - コーチングフック

##### Cron Jobs（⚠️ Hobbyプラン制限対応）
- **vercel.json** - 1つのスケジュール設定（Hobbyプラン制限：1日1回のみ）
  - morning-briefing のみ自動実行
  - 他3つ（craving-alert, step-down, survival-check）はAPI実装済み・手動トリガー可能
- **lib/cron/utils.ts** - Cronユーティリティ

**Phase 3 完了時の機能:**
- ✅ Phase 2 の全機能
- ✅ Web Push通知（iOS Safari含む）
- ✅ モーニング・ブリーフィング（C-01）- Cron自動実行
- ✅ 魔の時間帯アラート（C-02）- API実装済み（Hobbyプラン制限で手動のみ）
- ✅ AI励ましメッセージ（D-03）
- ✅ 入力忘れリマインド（C-04）- API実装済み（Hobbyプラン制限で手動のみ）
- ✅ 目標自動調整提案（C-03）- API実装済み（Hobbyプラン制限で手動のみ）

**注**: Vercel Hobbyプランでは Cron が1日1回のみのため、C-01のみ自動実行。Proプランで全機能有効化可能。

---

### Phase 4: 品質向上 + 追加機能（Week 7-8）

**目標:** テスト、パフォーマンス最適化、追加機能

| タスク | 成果物 |
|--------|--------|
| ユニットテスト追加 | テストスイート |
| E2Eテスト（主要フロー） | Playwrightテスト |
| パフォーマンス最適化（LCP, CLS改善） | 最適化完了 |
| アクセシビリティ監査・修正 | WCAG AA準拠 |
| エラーハンドリング強化 | エラー境界、Sentry |
| プライバシー設定強化 | 通知プレビュー設定 |
| ドキュメント整備 | README、API仕様書 |

---

## 7. 環境変数

```bash
# .env.example

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PRIVATE_KEY=

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# Gemini AI
GEMINI_API_KEY=

# Vercel Cron
CRON_SECRET=
```

---

## 8. 開始前チェックリスト

- [ ] Node.js 18+ インストール済み
- [ ] Firebase プロジェクト作成済み
- [ ] Vercel アカウント準備済み
- [ ] Gemini API キー取得済み
- [ ] VAPID キーペア生成済み
- [ ] 環境変数ファイル（.env.local）準備
- [ ] Git リポジトリ初期化
- [ ] PWAアイコン準備（各サイズ）

---

## 9. 実装時の重要ファイル

| ファイル | 用途 |
|---------|------|
| `.claude/skills/swan-design-system/SKILL.md` | デザインシステム定義 |
| `.claude/skills/pwa-patterns/SKILL.md` | PWA実装パターン |
| `docs/memo.md` | 元の機能仕様書 |
| `docs/requirements.md` | 要件定義書 |

---

## 10. 実装進捗レポート

### 2025-11-30: データ永続化層完了 ✅

**実装内容:**
1. **IndexedDB スキーマ実装** (`lib/indexeddb/db.ts`)
   - SwanDB データベース（バージョン1）
   - 4つのオブジェクトストア（records, summaries, settings, syncQueue）
   - 適切なインデックス設定

2. **IndexedDB CRUD操作**
   - `lib/indexeddb/records.ts` - 喫煙記録の保存・取得・更新・削除
   - `lib/indexeddb/summaries.ts` - 日別サマリーの管理・集計
   - `lib/indexeddb/settings.ts` - ユーザー設定の永続化

3. **オフライン同期機構** (`lib/indexeddb/sync.ts`)
   - 同期キューの管理（追加・取得・削除）
   - リトライ機構（最大3回）
   - 重複排除機能（同一文書の複数操作を最新に集約）

4. **Firestore統合** (`lib/firebase/firestore.ts`)
   - 3つのコレクション（records, summaries, settings）
   - 完全なCRUD操作実装
   - Timestamp変換処理

5. **統合データレイヤー** (`lib/indexeddb/index.ts`)
   - Offline-firstアーキテクチャ
   - 自動同期（オンライン時）
   - バックグラウンド同期（reconnection時）

6. **統計計算ユーティリティ** (`lib/utils/summary.ts`)
   - 日別サマリー計算
   - 金額・時間フォーマット
   - 抵抗率計算
   - 目標進捗チェック

7. **React統合フック** (`hooks/useRecords.ts`)
   - IndexedDB + Firestore + Zustand統合
   - createRecord, updateRecord, deleteRecord API
   - 同期状態管理

8. **ダッシュボード統合** (`app/(main)/dashboard/page.tsx`)
   - useRecordsフックの統合
   - オフライン/同期状態表示
   - エラーハンドリング

**ブラウザテスト結果:**
- ✅ 記録作成が正常に動作
- ✅ IndexedDBへの保存確認
- ✅ Firestoreへの同期確認
- ✅ タグ選択機能動作
- ✅ UI更新が即座に反映

### 2025-11-30: 設定ページ実装完了 ✅

**実装内容:**
1. **Switch UIコンポーネント** (`components/ui/Switch.tsx`)
   - アクセシビリティ対応（role="switch", aria-checked）
   - キーボード操作対応（Space/Enter）
   - 44px最小タッチターゲット
   - ダークモード対応

2. **設定セクションコンポーネント**
   - `components/settings/GoalSection.tsx` - 目標設定
     - 日次目標本数入力
     - 自動ステップダウンON/OFF
   - `components/settings/CostSection.tsx` - コスト設定
     - タバコ価格（1箱あたり）
     - 1箱の本数
     - 1本あたり価格の自動計算表示
   - `components/settings/NotificationSection.tsx` - 通知設定
     - マスタースイッチ（通知全体のON/OFF）
     - 4種類の通知（モーニング・ブリーフィング、魔の時間帯アラート、ステップダウン提案、生存確認）
     - プライバシーモード（汎用メッセージ使用）
     - サイレント時間設定（開始・終了時刻）
   - `components/settings/AccountSection.tsx` - アカウント管理
     - アカウント種別表示（匿名/Google）
     - Googleアカウント連携（匿名ユーザーの場合）
     - サインアウト（確認モーダル付き）
     - データ喪失警告（匿名ユーザー向け）

3. **設定メインページ** (`app/(main)/settings/page.tsx`)
   - 4つのセクションを統合
   - IndexedDBからの設定読み込み
   - リアルタイム保存（IndexedDB + Firestore同期）
   - 保存確認メッセージ表示（「保存しました ✓」）
   - 保存エラーハンドリング

**ブラウザテスト結果:**
- ✅ すべての設定セクションが正しく表示
- ✅ スイッチコンポーネントの動作確認
- ✅ 保存機能の動作確認（「保存しました ✓」メッセージ表示）
- ✅ ダークモード対応確認
- ✅ レスポンシブデザイン確認

**Phase 1 完全完了:**
- ✅ データ永続化層（IndexedDB + Firestore）
- ✅ SOS機能（3分タイマー・深呼吸モード）
- ✅ 履歴ページ（期間フィルター・統計・チャート・詳細モーダル）
- ✅ 設定ページ（目標・コスト・通知・アカウント管理）

**次のフェーズ: Phase 2 残タスク**
- iOSインストール誘導UI（E-02）

---

### 2025-12-03: PWA基盤設定完了 ✅

**実装内容:**
1. **PWAアイコン設定**
   - 8サイズのPWAアイコン（72px〜512px）
   - apple-touch-icon.png（180x180）
   - favicon.ico（32x32）
   - maskableアイコン設定

2. **Service Worker設定** (`next.config.ts`)
   - `@ducanh2912/next-pwa` 10.2.9による自動生成
   - Workboxランタイムキャッシュ戦略（8種類）
   - オフラインフォールバック: `/offline`
   - 問題解決: Next.js 16のTurbopackデフォルト化対応
     - `package.json`: `"build": "next build --webpack"` に変更
     - 開発時はTurbopack（高速）、本番ビルドはWebpack（PWA生成）

3. **オフラインページ** (`app/offline/page.tsx`)
   - オフライン状態の視覚的表示
   - オフラインでも利用可能な機能リスト
   - 再読み込みボタン

4. **メタデータ更新** (`app/layout.tsx`)
   - icons設定（favicon、PWAアイコン、apple-touch-icon）
   - manifest.json参照

**ブラウザテスト結果:**
- ✅ Service Worker: 登録・有効化確認（scope: /）
- ✅ PWAアイコン: 全サイズHTTP 200
- ✅ オフラインページ: 正常表示

**生成されるファイル:**
- `public/sw.js` - メインService Worker
- `public/workbox-*.js` - Workboxランタイム
- `public/swe-worker-*.js` - 追加ワーカー

---

## 11. 改訂履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.5.0 | 2025-12-07 | Phase 3完了（Web Push通知、Gemini AI連携、Cron Jobs、AIコーチング機能） |
| 1.4.0 | 2025-12-03 | Phase 2 PWA設定完了（Service Worker、オフラインページ、アイコン設定） |
| 1.3.0 | 2025-12-01 | date-fns採用（タイムゾーン対応強化）、Phase 1バグ修正完了 |
| 1.2.0 | 2025-11-30 | Phase 1完全完了（設定ページ実装）、実装進捗レポート更新 |
| 1.1.0 | 2025-11-30 | データ永続化層実装完了、実装進捗レポート追加 |
| 1.0.0 | 2025-11-30 | 初版作成 |
