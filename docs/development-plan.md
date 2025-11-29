# Swan PWA 禁煙・減煙アプリ 開発計画書

## 1. プロジェクト概要

| 項目 | 内容 |
|------|------|
| プロジェクト名 | Swan（スワン） |
| 開発開始日 | 2025-11-30 |
| 開発方式 | MVP（最小実行可能製品）ファースト |

---

## 2. 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フロントエンド | Next.js 14+ (App Router), TypeScript |
| スタイリング | Tailwind CSS |
| 状態管理 | Zustand |
| データベース | Firebase Firestore |
| 認証 | Firebase Auth（匿名認証対応） |
| Push通知 | Firebase Cloud Messaging (FCM) |
| AI/LLM | Gemini 2.0 Flash API |
| ホスティング | Vercel（Cron Jobs活用） |
| PWA | next-pwa (Workbox) |

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
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # 認証関連ルート
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── onboarding/
│   │   │       └── page.tsx
│   │   ├── (main)/         # メインアプリルート
│   │   │   ├── page.tsx    # ダッシュボード（ホーム）
│   │   │   ├── history/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── sos/            # SOSフロー（フルスクリーン）
│   │   │   ├── page.tsx    # 戦略選択
│   │   │   ├── timer/
│   │   │   │   └── page.tsx
│   │   │   ├── breathing/
│   │   │   │   └── page.tsx
│   │   │   └── result/
│   │   │       └── page.tsx
│   │   ├── api/            # API Routes
│   │   │   ├── smoke-records/
│   │   │   │   └── route.ts
│   │   │   ├── coping-records/
│   │   │   │   └── route.ts
│   │   │   ├── statistics/
│   │   │   │   └── route.ts
│   │   │   ├── push/
│   │   │   │   ├── subscribe/
│   │   │   │   │   └── route.ts
│   │   │   │   └── send/
│   │   │   │       └── route.ts
│   │   │   ├── ai/
│   │   │   │   ├── encouragement/
│   │   │   │   │   └── route.ts
│   │   │   │   └── coaching/
│   │   │   │       └── route.ts
│   │   │   └── cron/
│   │   │       ├── morning-briefing/
│   │   │       │   └── route.ts
│   │   │       └── craving-alert/
│   │   │           └── route.ts
│   │   ├── layout.tsx      # ルートレイアウト
│   │   ├── globals.css     # グローバルスタイル
│   │   └── providers.tsx   # Context Providers
│   ├── components/
│   │   ├── ui/             # 基本UIコンポーネント
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── ProgressRing.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── index.ts
│   │   ├── dashboard/      # ダッシュボード関連
│   │   │   ├── GoalHeader.tsx
│   │   │   ├── ActionButtons.tsx
│   │   │   ├── AchievementPanel.tsx
│   │   │   ├── RandomTips.tsx
│   │   │   └── CounterDisplay.tsx
│   │   ├── sos/            # SOS関連
│   │   │   ├── TimerScreen.tsx
│   │   │   ├── BreathingAnimation.tsx
│   │   │   ├── EncouragementMessage.tsx
│   │   │   └── StrategySelector.tsx
│   │   ├── records/        # 記録関連
│   │   │   ├── TagSelector.tsx
│   │   │   ├── RecordConfirmation.tsx
│   │   │   └── HistoryList.tsx
│   │   ├── settings/       # 設定関連
│   │   │   ├── NotificationSettings.tsx
│   │   │   ├── GoalSettings.tsx
│   │   │   └── ProfileSettings.tsx
│   │   ├── pwa/            # PWA関連
│   │   │   ├── IOSInstallPrompt.tsx
│   │   │   ├── UpdatePrompt.tsx
│   │   │   ├── OfflineIndicator.tsx
│   │   │   └── PushPermissionPrompt.tsx
│   │   ├── animations/     # アニメーション
│   │   │   ├── Celebration.tsx
│   │   │   └── Confetti.tsx
│   │   └── layout/         # レイアウト
│   │       ├── Header.tsx
│   │       ├── BottomNav.tsx
│   │       └── SafeArea.tsx
│   ├── hooks/              # カスタムフック
│   │   ├── useSmokeRecord.ts
│   │   ├── useCopingRecord.ts
│   │   ├── useGoal.ts
│   │   ├── useStatistics.ts
│   │   ├── usePushPermission.ts
│   │   ├── useIOSInstallPrompt.ts
│   │   ├── useOnlineStatus.ts
│   │   └── useServiceWorker.ts
│   ├── lib/                # ユーティリティ・サービス
│   │   ├── firebase/
│   │   │   ├── config.ts
│   │   │   ├── auth.ts
│   │   │   └── firestore.ts
│   │   ├── db/             # IndexedDB（オフライン用）
│   │   │   ├── schema.ts
│   │   │   ├── smokeRecordRepository.ts
│   │   │   └── syncQueue.ts
│   │   ├── push/
│   │   │   ├── config.ts
│   │   │   └── client.ts
│   │   ├── ai/
│   │   │   ├── gemini.ts
│   │   │   └── prompts.ts
│   │   └── utils/
│   │       ├── date.ts
│   │       ├── format.ts
│   │       └── calculation.ts
│   ├── store/              # Zustand ストア
│   │   ├── useUserStore.ts
│   │   ├── useRecordStore.ts
│   │   └── useSettingsStore.ts
│   ├── types/              # TypeScript型定義
│   │   ├── smoke-record.ts
│   │   ├── coping-record.ts
│   │   ├── user.ts
│   │   ├── notification.ts
│   │   └── api.ts
│   └── constants/          # 定数
│       ├── tags.ts
│       ├── tips.ts
│       └── encouragement.ts
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

### 4.3 IndexedDB スキーマ（オフライン用）

```typescript
interface SwanDBSchema {
  'smoke-records': {
    key: string;
    value: {
      id: string;
      timestamp: number;
      type: 'smoked' | 'resisted';
      tag?: string;
      synced: boolean;
    };
    indexes: {
      'by-timestamp': number;
      'by-synced': boolean;
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
    };
  };
}
```

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

#### Week 2: 記録機能 + SOS機能

| タスク | 成果物 |
|--------|--------|
| 喫煙記録API実装 | 記録API |
| 「吸った」ボタン機能実装（A-01） | カウンター機能 |
| タグ選択UI実装（A-04） | タグセレクター |
| 「我慢できた」ボタン機能実装（A-03） | 成功記録機能 |
| SOS画面実装（D-01: 3分タイマー） | タイマー画面 |
| 深呼吸アニメーション実装（D-02） | 呼吸ガイド画面 |
| 祝福アニメーション実装 | Celebration コンポーネント |

**Phase 1 完了時の機能:**
- ユーザー認証
- 喫煙記録（「吸った」ボタン + タグ）
- SOS機能（3分タイマー、深呼吸）
- 我慢成功記録（祝福アニメーション付き）
- 今日のカウント表示

---

### Phase 2: ダッシュボード強化 + 設定（Week 3-4前半）

**目標:** 成果可視化とPWA基盤整備

| タスク | 成果物 |
|--------|--------|
| 成果可視化パネル実装（B-03） | 成果パネル |
| 統計API実装 | 統計エンドポイント |
| ランダムTips実装（B-02） | Tips表示機能 |
| 設定画面基本実装 | 設定ページ |
| PWA基本設定（manifest.json, next-pwa） | PWAインストール可能 |
| iOS インストール誘導UI実装（E-02） | インストールガイド |
| オフライン対応（IndexedDB同期） | オフライン機能 |
| カレンダー/履歴表示実装（E-03） | 履歴ページ |

**Phase 2 完了時の機能:**
- Phase 1 の全機能
- 成果可視化（節約金額、取り戻した寿命）
- ランダムTips
- 設定画面
- PWAインストール（iOS含む）
- オフライン基本対応
- 履歴閲覧

---

### Phase 3: Web Push通知 + AIコーチング（Week 4後半-6）

**目標:** Push通知とAI機能による能動的サポート

| タスク | 成果物 |
|--------|--------|
| Push通知基盤構築（FCM, VAPID） | Push購読機能 |
| 通知許可誘導UI実装（E-01） | 許可フロー |
| Gemini API連携基盤 | AI接続 |
| AI励ましメッセージ実装（D-03強化） | AI励まし機能 |
| モーニング・ブリーフィング実装（C-01） | 朝通知機能 |
| Vercel Cron設定 | 定期実行設定 |
| 魔の時間帯予測ロジック実装 | 予測アルゴリズム |
| 魔の時間帯アラート実装（C-02） | 先回り通知機能 |
| 生存確認通知実装（C-04） | リマインド通知 |
| ステップダウン提案実装（C-03） | 目標調整機能 |

**Phase 3 完了時の機能:**
- Phase 2 の全機能
- Web Push通知（iOS Safari含む）
- モーニング・ブリーフィング
- 魔の時間帯アラート
- AI励ましメッセージ
- 入力忘れリマインド
- 目標自動調整提案

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

## 10. 改訂履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-30 | 初版作成 |
