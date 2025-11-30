# Swan PWA プロジェクト現状（更新: 2025-11-30）

## プロジェクト概要
- **プロジェクト名**: Swan（スワン）- 禁煙・減煙支援PWA
- **現在のステータス**: Phase 1 データ永続化層完了 ✅
- **開発フェーズ**: Phase 1 後半（SOS機能、履歴、設定ページ実装予定）

## 最新の実装状況

### ✅ Phase 1 完了項目（2025-11-30）

#### 1. Firebase基盤
- **lib/firebase/config.ts** - Firebase初期化、環境変数検証
- **lib/firebase/auth.ts** - 認証ヘルパー関数
  - 匿名認証 (`signInAnonymous`)
  - Google認証 (`signInWithGoogle`)
  - アカウントリンク (`linkAnonymousWithGoogle`)
  - 認証状態監視 (`onAuthChange`)

#### 2. TypeScript型定義
- **types/index.ts** - 完全な型定義システム
  - `UserProfile` - ユーザープロファイル
  - `SmokingRecord` - 喫煙・我慢記録
  - `DailySummary` - 日次サマリー
  - `UserSettings` - ユーザー設定（通知、目標、アプリ設定）
  - `SituationTag` - 10種類の状況タグ
  - `RecordType` - `smoked`, `craved`, `resisted`
  - `CoachingMessage`, `PushSubscription`, `SOSSession` 他

#### 3. 定数ファイル
- **constants/tags.ts** - 状況タグ定義（10種類、絵文字付き）
- **constants/messages.ts** - 励ましメッセージ、Tipsコレクション
  - RESISTANCE_MESSAGES (6種類)
  - RANDOM_TIPS (10種類)
  - モーニング・ブリーフィング、魔の時間帯アラート用フォールバック

#### 4. Zustandストア
- **store/userStore.ts** - ユーザー認証状態管理（localStorage永続化）
- **store/recordsStore.ts** - 喫煙記録・サマリー管理
- **store/settingsStore.ts** - ユーザー設定管理（localStorage永続化）

#### 5. カスタムフック
- **hooks/useAuth.ts** - 認証フック
  - 認証状態の監視
  - 匿名/Googleログイン
  - アカウントリンク
  - サインアウト

#### 6. UIコンポーネント
- **components/ui/Button.tsx** - 7バリアント、アクセシビリティ対応
- **components/ui/Card.tsx** - Card, CardHeader, CardContent, CardFooter
- **components/ui/Modal.tsx** - Portal、フォーカストラップ、iOS Safe Area対応
- **components/ui/Celebration.tsx** - 祝福アニメーション（我慢成功時等に使用）
- **components/ui/Switch.tsx** - トグルスイッチコンポーネント（アクセシビリティ対応、44px最小タッチターゲット） ✅ NEW! (2025-11-30)

#### 7. ダッシュボード専用コンポーネント
- **components/dashboard/RecordButton.tsx** - 3種類の記録ボタン
  - `smoked` (ニュートラル・グレー)
  - `craved` (警告・アンバー)
  - `resisted` (成功・グリーン)
- **components/dashboard/GoalHeader.tsx** - 目標進捗ヘッダー
- **components/dashboard/RandomTip.tsx** - ランダムTips表示

#### 8. ページ実装
- **app/page.tsx** - ルートページ（認証状態に応じたリダイレクト）
- **app/(auth)/signin/page.tsx** - サインインページ
  - 匿名ログイン
  - Googleログイン
  - エラーハンドリング
- **app/(main)/layout.tsx** - メインレイアウト（認証ガード）
- **app/(main)/dashboard/page.tsx** - ダッシュボード
  - 3つの記録ボタン
  - 目標進捗表示
  - 状況タグ選択モーダル
  - フィードバックトースト

### 📁 プロジェクト構造（実装済み）

```
swan/
├── app/
│   ├── (auth)/
│   │   └── signin/
│   │       └── page.tsx          ✅ サインインページ
│   ├── (main)/
│   │   ├── layout.tsx            ✅ 認証ガード
│   │   └── dashboard/
│   │       └── page.tsx          ✅ ダッシュボード
│   ├── sos/                      ✅ SOS機能実装完了
│   │   ├── layout.tsx           ✅ NEW! (2025-12-01) SOS認証ガード
│   │   ├── timer/
│   │   │   └── page.tsx         ✅ 3分タイマーページ
│   │   └── breathing/
│   │       └── page.tsx         ✅ 深呼吸モードページ
│   ├── api/                      📁 (ディレクトリのみ)
│   ├── layout.tsx                ✅ ルートレイアウト
│   ├── globals.css               ✅ Swanデザインシステム
│   └── page.tsx                  ✅ リダイレクトページ
├── components/
│   ├── ui/
│   │   ├── Button.tsx           ✅
│   │   ├── Card.tsx             ✅
│   │   ├── Modal.tsx            ✅
│   │   ├── Celebration.tsx      ✅
│   │   └── Switch.tsx           ✅
│   ├── dashboard/
│   │   ├── RecordButton.tsx     ✅
│   │   ├── GoalHeader.tsx       ✅
│   │   └── RandomTip.tsx        ✅
│   ├── sos/
│   │   ├── Timer.tsx            ✅ 3分タイマーコンポーネント
│   │   ├── BreathingCircle.tsx  ✅ 深呼吸ガイドコンポーネント
│   │   └── SOSModal.tsx         ✅ SOSモーダル
│   ├── history/                 ✅ NEW! (2025-11-30)
│   │   ├── HistoryCard.tsx      ✅ 日別サマリーカード
│   │   ├── WeekStats.tsx        ✅ 週間統計カード
│   │   ├── SimpleBarChart.tsx   ✅ 本数推移チャート
│   │   └── DayDetailModal.tsx   ✅ 日別詳細モーダル
│   └── settings/                ✅ NEW! (2025-11-30)
│       ├── GoalSection.tsx      ✅ 目標設定セクション
│       ├── CostSection.tsx      ✅ コスト設定セクション
│       ├── NotificationSection.tsx ✅ 通知設定セクション
│       └── AccountSection.tsx   ✅ アカウント管理セクション
├── hooks/
│   ├── useAuth.ts               ✅
│   ├── useRecords.ts            ✅
│   └── useHistory.ts            ✅ NEW! (2025-11-30)
├── lib/
│   ├── firebase/
│   │   ├── config.ts            ✅
│   │   ├── auth.ts              ✅
│   │   └── firestore.ts         ✅ NEW!
│   ├── indexeddb/               ✅ NEW! (完全実装)
│   │   ├── db.ts                ✅
│   │   ├── records.ts           ✅
│   │   ├── summaries.ts         ✅
│   │   ├── settings.ts          ✅
│   │   ├── sync.ts              ✅
│   │   └── index.ts             ✅
│   ├── utils/                   ✅ NEW!
│   │   ├── summary.ts           ✅
│   │   └── date.ts              ✅ NEW! (2025-12-01) タイムゾーン対応日付ユーティリティ
│   ├── ai/                      📁 (ディレクトリのみ)
│   └── push/                    📁 (ディレクトリのみ)
├── store/
│   ├── userStore.ts             ✅
│   ├── recordsStore.ts          ✅
│   └── settingsStore.ts         ✅
├── types/
│   └── index.ts                 ✅
├── constants/
│   ├── tags.ts                  ✅
│   └── messages.ts              ✅
├── public/
│   └── manifest.json            ✅
├── docs/
│   ├── requirements.md          ✅
│   ├── development-plan.md      ✅
│   ├── memo.md                  ✅
│   └── setup-guide.md           ✅ NEW!
├── .env.example                 ✅
├── package.json                 ✅
└── next.config.ts               ✅
```

### 🎯 実装済み機能の詳細

#### ダッシュボード機能

1. **目標進捗ヘッダー（B-01）**
   - 「今日の目標: あと○本」表示
   - プログレスバー
   - 目標達成/超過時のフィードバック

2. **ランダムTips（B-02）**
   - 10種類のTipsからランダム表示
   - 5分ごとに自動更新

3. **記録ボタン（A-01, A-02, A-03）**
   - 「吸った」ボタン - ニュートラル（グレー）
   - 「吸いたい」ボタン - 警告（アンバー）
   - 「我慢できた」ボタン - 成功（グリーン）
   - 今日のカウント表示

4. **状況タグ選択（A-04）**
   - 10種類のタグ（食後、休憩、ストレス等）
   - 複数選択可能
   - 絵文字付きUI

5. **フィードバックメッセージ**
   - 我慢成功時: 励ましメッセージ（6種類からランダム）
   - 喫煙記録時: ニュートラルメッセージ

#### データ永続化機能（NEW! 2025-11-30）

1. **オフラインファースト設計**
   - すべてのデータ操作はまずIndexedDBに保存
   - オンライン時は自動的にFirestoreに同期
   - オフライン時は同期キューに追加され、オンライン復帰時に自動同期

2. **IndexedDB構造**
   - **records** - 喫煙記録（smoked, craved, resisted）
   - **summaries** - 日次サマリー（統計、節約額、タグ分析）
   - **settings** - ユーザー設定（通知、目標、アプリ設定）
   - **syncQueue** - オフライン同期キュー

3. **同期機能**
   - バックグラウンド自動同期（オンライン復帰時）
   - 同期キューの重複排除
   - リトライメカニズム（最大3回）
   - エラートラッキング

4. **統計計算**
   - 日次サマリー自動集計
   - 節約金額・時間計算
   - 抵抗成功率計算
   - 目標達成状況判定

#### 認証フロー

1. **トップページ（/）**
   - 認証済み → `/dashboard` にリダイレクト
   - 未認証 → `/signin` にリダイレクト

2. **サインインページ（/signin）** ※ディレクトリは `app/(auth)/signin/` だがURLは `/signin`
   - 匿名ログイン
   - Googleログイン
   - エラーハンドリング
   - ログイン後 → `/dashboard` にリダイレクト

3. **メインレイアウト認証ガード**
   - 未認証時は `/signin` にリダイレクト
   - ローディング状態表示

### ✅ Phase 1 完了項目（続き）

#### 9. データ永続化層（2025-11-30 NEW!）
- **lib/indexeddb/db.ts** - IndexedDBスキーマと初期化
  - 4つのオブジェクトストア: records, summaries, settings, syncQueue
  - インデックス設計（userId, timestamp, date, type）
  - ヘルパー関数（withStore, withCursor）
- **lib/indexeddb/records.ts** - 喫煙記録CRUD操作
  - saveRecord, getRecord, getRecordsByUser, getRecordsByDate
  - updateRecord, deleteRecord, deleteAllRecords
  - countRecords, getLatestRecord
- **lib/indexeddb/summaries.ts** - 日次サマリーCRUD操作
  - saveSummary, getSummary, getSummaryByDate
  - updateSummary, deleteSummary
  - aggregateSummaries（統計集計）
- **lib/indexeddb/settings.ts** - ユーザー設定CRUD操作
  - saveSettings, getSettings, updateSettings
  - createDefaultSettings, initializeSettings
- **lib/indexeddb/sync.ts** - オフライン同期キュー管理
  - addToSyncQueue, getPendingSyncItems
  - removeSyncItem, incrementRetry
  - deduplicateSyncQueue, hasPendingSync
- **lib/indexeddb/index.ts** - 統合データレイヤー（オフラインファースト）
  - saveRecord, updateRecord, deleteRecord（自動同期）
  - processSyncQueue, syncFromFirestore
  - setupBackgroundSync（自動バックグラウンド同期）

#### 10. Firestore統合（2025-11-30 NEW!）
- **lib/firebase/firestore.ts** - Firestore CRUD操作
  - Records: saveRecordToFirestore, getRecordsFromFirestore, updateRecordInFirestore
  - Summaries: saveSummaryToFirestore, getSummariesFromFirestore
  - Settings: saveSettingsToFirestore, getSettingsFromFirestore

#### 11. ユーティリティ関数（2025-11-30 NEW!）
- **lib/utils/summary.ts** - サマリー計算とフォーマット
  - calculateDailySummary（日次統計集計）
  - formatMoney, formatMinutes, formatLifeRegained
  - calculateResistanceRate, checkGoalProgress

#### 12. データ統合フック（2025-11-30 NEW!）
- **hooks/useRecords.ts** - 記録操作の統合フック
  - createRecord（IndexedDB + Firestore + Zustand統合）
  - updateRecord, deleteRecord
  - オフライン/オンライン状態管理
  - 同期ステータス監視

### ✅ SOS機能実装完了（2025-11-30 NEW!）

#### D群：衝動対策・SOS機能
- **app/sos/timer/page.tsx** - 3分タイマーページ ✅
  - 円形プログレスバー（SVG）
  - 分:秒表示（タブular figures）
  - 開始/一時停止/リセット機能
  - 完了時の祝福アニメーション
- **app/sos/breathing/page.tsx** - 深呼吸モードページ ✅
  - 4フェーズ呼吸ガイド（吸う4秒・止める4秒・吐く6秒・休憩2秒）
  - アニメーション付き呼吸サークル（スケール変化）
  - 5サイクル完了で終了
  - 深呼吸の効果説明
- **components/sos/Timer.tsx** - タイマーコンポーネント ✅
  - カスタマイズ可能な時間設定（デフォルト3分）
  - SVG円形プログレスバー（Teal → Orange グラデーション）
  - 完了コールバック対応
- **components/sos/BreathingCircle.tsx** - 呼吸ガイドコンポーネント ✅
  - 4フェーズ自動遷移
  - スケールアニメーション（0.6～1.5倍）
  - フェーズごとのメッセージ表示
  - プログレスバー付き
- **components/sos/SOSModal.tsx** - SOSモーダル ✅
  - ダッシュボードから「吸いたい」ボタンで表示
  - 3分タイマーまたは深呼吸モードへの誘導
  - 「記録だけする」オプション

### ✅ 履歴ページ実装完了（2025-11-30 NEW!）

#### 13. 履歴ページとコンポーネント（2025-11-30 NEW!）
- **app/(main)/history/page.tsx** - 履歴メインページ ✅
  - 期間フィルター（7日間/30日間/全期間）
  - 週間統計サマリー表示
  - 本数推移チャート（直近7日間）
  - 日別記録カード一覧
  - 詳細モーダル表示
- **app/(main)/settings/page.tsx** - 設定ページ ✅ NEW! (2025-11-30)
  - 目標設定（日次目標本数、自動ステップダウン）
  - コスト設定（タバコ価格、1箱の本数、1本あたり価格計算）
  - 通知設定（マスタースイッチ、4種類の通知、プライバシーモード、サイレント時間）
  - アカウント管理（アカウント種別表示、Googleアカウント連携、サインアウト）
  - リアルタイム保存（IndexedDB + Firestore同期）
  - 保存確認メッセージ表示
- **components/history/HistoryCard.tsx** - 日別サマリーカード ✅
  - 日付ヘッダー（和暦形式: 11月30日(日)）
  - 「今日」バッジ
  - 成功率バッジ（%表示）
  - 統計グリッド（吸った・我慢・節約）
  - タグプレビュー（最大3つ + 残数表示）
- **components/history/WeekStats.tsx** - 週間統計カード ✅
  - 期間別統計表示（7日間/30日間/全期間）
  - 喫煙本数、我慢成功回数、節約金額
  - 励ましメッセージ表示
  - グラデーション背景デザイン
- **components/history/SimpleBarChart.tsx** - 本数推移チャート ✅
  - 直近7日間の棒グラフ
  - 今日のバーをハイライト（ティールカラー）
  - 各バーに本数表示
  - 日付ラベル（曜日付き）
- **components/history/DayDetailModal.tsx** - 日別詳細モーダル ✅
  - 日別サマリー表示
  - 状況タグ分析（タグ別集計 with emoji + count）
  - 時間帯別ヒートマップ（24時間 × 濃淡表示）
  - 記録タイムライン（時刻 + type emoji + tag emoji）
  - スムーズなモーダル開閉アニメーション
- **hooks/useHistory.ts** - 履歴データ管理フック ✅
  - IndexedDBからデータ読み込み
  - 期間フィルタリング（7days/30days/all）
  - 日次サマリー自動計算
  - 週間統計集計
  - リフレッシュ機能

#### 14. サマリー計算ユーティリティ拡張（2025-11-30 NEW!）
- **lib/utils/summary.ts** - 追加関数 ✅
  - `formatDate(dateStr)` - 和暦日付フォーマット（例: 11月30日(日)）
  - `formatTime(timestampStr)` - 時刻フォーマット（例: 14:30）
  - `calculateCumulativeStats(summaries)` - 累積統計計算（成果可視化用）

#### 15. 成果可視化パネル（B-03）（2025-11-30 NEW!）
- **components/dashboard/AchievementPanel.tsx** - 成果パネルコンポーネント ✅
  - 4指標グリッド表示（2x2レイアウト）
  - 💰 節約金額 - `formatMoney()` でフォーマット
  - ⏰ 取り戻した時間 - `formatLifeRegained()` で「◯時間◯分」形式
  - 🏆 我慢成功回数 - 累積カウント
  - 📅 記録継続日数 - ユニーク日数カウント
  - 励ましメッセージ - 成功回数・節約金額に応じた動的メッセージ（7段階）
  - グラデーション背景（Teal）、ホバーエフェクト
- **hooks/useAchievements.ts** - 成果データ取得フック ✅
  - IndexedDBからサマリー取得
  - `calculateCumulativeStats()` で累積統計計算
  - ローディング状態管理

### ✅ Phase 1 + B-03 完全完了（2025-11-30）

Phase 1のすべての機能が実装完了しました：
- ✅ データ永続化層（IndexedDB + Firestore）
- ✅ SOS機能（3分タイマー・深呼吸モード）
- ✅ 履歴ページ（期間フィルター・統計・チャート・詳細モーダル）
- ✅ 設定ページ（目標設定・通知設定・コスト設定・アカウント管理）
- ✅ **成果可視化パネル（B-03）** - 節約金額、取り戻した時間、我慢成功回数、記録継続日数（2025-11-30）
  - `components/dashboard/AchievementPanel.tsx` ✅
  - `hooks/useAchievements.ts` ✅  
  - 累積統計計算（`lib/utils/summary.ts` - `calculateCumulativeStats`）✅
  - 4指標表示（💰節約金額、⏰取り戻した時間、🏆我慢成功回数、📅記録継続日数）
  - 励ましメッセージ機能（成功回数・節約金額に応じた動的メッセージ）

### ✅ Phase 1 バグ修正完了（2025-12-01 NEW!）

ブラウザ検証で発見されたバグを修正：

#### タイムゾーン修正
- **問題**: `toISOString().split('T')[0]`がUTC日付を返し、0時～8時59分（JST）に記録すると前日の日付になる
- **解決**: `lib/utils/date.ts`を新規作成、ローカルタイムゾーン対応
  - `getLocalDateString()` - YYYY-MM-DD形式（ローカル）
  - `getLocalMidnight()` - 深夜0時（ローカル）
  - `getChartDateLabel()` - チャート用日付ラベル
- **影響ファイル**: useRecords.ts, useHistory.ts, history/page.tsx, SimpleBarChart.tsx, HistoryCard.tsx

#### SOS認証ガード追加
- **問題**: `/sos/breathing`等に未認証でアクセス可能だった
- **解決**: `app/sos/layout.tsx`を新規作成、(main)と同じ認証ロジック適用

#### 設定ページ修正
- **数値入力**: ローカルステート管理で「0が残る」問題を解決
- **トグルスイッチ**: Switch.tsxのレイアウト修正（44px最小タッチターゲット）
- **通知設定**: マスタースイッチOFF時は非表示→グレーアウト表示に変更

#### SOSページ修正
- **React setStateエラー**: Timer.tsxのonComplete呼び出しをuseEffectに移動
- **ナビゲーション**: 戻るボタンでダッシュボードに遷移
- **完了時UI**: 「もう一度」「ダッシュボードに戻る」の2ボタン表示

#### モーダル修正
- **ボタン視認性**: ghost→outlineに変更（枠線追加）
- **ローディング**: 記録送信中のローディング表示追加

### 📋 Phase 2 以降のタスク

#### Phase 2: PWA設定（現在のフェーズ）
- [ ] PWAアイコン作成（72x72～512x512）
- [ ] iOSスプラッシュスクリーン  
- [ ] Service Worker設定（next-pwa）
- [ ] インストールガイド（E-02）

#### Phase 3: Web Push通知・AI機能
- [ ] Push通知許可UI
- [ ] モーニング・ブリーフィング（C-01）
- [ ] 魔の時間帯アラート（C-02）
- [ ] ステップダウン提案（C-03）
- [ ] 生存確認通知（C-04）
- [ ] Gemini AI統合
- [ ] Vercel Cron Jobs設定

#### Phase 4: テスト・最適化
- [ ] Playwrightテスト
- [ ] パフォーマンス最適化
- [ ] アクセシビリティ監査
- [ ] セキュリティレビュー

## ビルド状況

### 最新ビルド: 2025-11-30
```
✓ Compiled successfully
✓ TypeScript checks passed
✓ Static pages generated: /, /dashboard, /signin
```

**警告**: baseline-browser-mapping が古い（機能に影響なし）

## 次のステップ

### 即座に開始可能
1. **Firebase プロジェクト作成**
   - Firebase Console でプロジェクト作成
   - Authentication, Firestore, FCM 設定
   - `.env.local` ファイル作成（`docs/setup-guide.md` 参照）

2. **SOS機能実装**
   - 3分タイマーページ
   - 深呼吸ガイドページ
   - AI励ましメッセージ統合

3. **履歴ページ実装**
   - 日別記録一覧
   - 統計グラフ
   - フィルタリング機能

### 開発コマンド
```bash
npm run dev          # 開発サーバー
npm run build        # 本番ビルド
npm run start        # 本番サーバー
```

## 技術スタック（確定）

- **フロントエンド**: Next.js 16.0.5 (App Router), React 19.2.0, TypeScript 5.x
- **スタイリング**: Tailwind CSS 4.x
- **状態管理**: Zustand 5.0.8
- **バックエンド**: Firebase 12.6.0 (Auth, Firestore, FCM)
- **PWA**: @ducanh2912/next-pwa 10.2.9
- **AI**: Gemini 2.0 Flash API（未統合）

## ドキュメント

- **セットアップ**: `docs/setup-guide.md` ⭐ NEW!
- **要件定義**: `docs/requirements.md`
- **開発計画**: `docs/development-plan.md`
- **機能仕様**: `docs/memo.md`
- **Claude Code ガイド**: `CLAUDE.md`

## 重要な設計判断

1. **src/ ディレクトリなし** - Next.js 16 推奨に従いプロジェクトルートに直接 app/ 配置
2. **Tailwind CSS 4** - PostCSS統合、`@theme inline` でデザイントークン管理
3. **Zustand永続化** - userStore と settingsStore は localStorage に永続化
4. **クライアントサイド優先** - 'use client' ディレクティブで動的機能実現
5. **アクセシビリティ** - 最小タッチターゲット44px、フォーカスインジケーター、ARIA属性
