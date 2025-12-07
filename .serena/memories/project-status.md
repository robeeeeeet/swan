# Swan PWA プロジェクト現状（更新: 2025-11-30）

## プロジェクト概要
- **プロジェクト名**: Swan（スワン）- 禁煙・減煙支援PWA
- **現在のステータス**: Phase 3 完了 ✅（2025-12-07）
- **開発フェーズ**: Phase 4（テスト・最適化準備中）
- **最新コミット**: f4dc090 - Firestore設定保存・Push通知許可の根本修正

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
  - `closeOnBackdropClick` - バックドロップクリックで閉じるか（デフォルト: true）
  - `closeOnEscape` - ESCキーで閉じるか（デフォルト: true）✅ NEW! (2025-12-07)
  - `showCloseButton` - 閉じるボタンを表示するか（デフォルト: true）
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
│   ├── offline/
│   │   └── page.tsx              ✅ オフラインフォールバックページ NEW! (2025-12-03)
│   ├── api/                      ✅ NEW! (2025-12-06) API実装
│   │   ├── coaching/
│   │   │   └── route.ts         ✅ AIコーチングAPI
│   │   └── cron/
│   │       ├── morning-briefing/
│   │       │   └── route.ts     ✅ C-01 モーニング通知
│   │       ├── craving-alert/
│   │       │   └── route.ts     ✅ C-02 魔の時間帯アラート
│   │       ├── step-down/
│   │       │   └── route.ts     ✅ C-03 ステップダウン提案
│   │       └── survival-check/
│   │           └── route.ts     ✅ C-04 生存確認
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
│   │   ├── RandomTip.tsx        ✅
│   │   └── AchievementPanel.tsx ✅ 成果可視化パネル
│   ├── sos/
│   │   ├── Timer.tsx            ✅ 3分タイマーコンポーネント
│   │   ├── BreathingCircle.tsx  ✅ 深呼吸ガイドコンポーネント
│   │   └── SOSModal.tsx         ✅ SOSモーダル（AI励まし統合）
│   ├── pwa/                     ✅ NEW! (2025-12-06)
│   │   └── PushPermissionPrompt.tsx ✅ Push通知許可UI
│   ├── install/                 ✅ NEW! (2025-12-03)
│   │   ├── InstallGuide.tsx     ✅ iOSインストールガイド
│   │   └── InstallPromptBanner.tsx ✅ インストールバナー
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
│   ├── useHistory.ts            ✅ NEW! (2025-11-30)
│   ├── useAchievements.ts       ✅ 成果統計フック
│   ├── useInstallPrompt.ts      ✅ NEW! (2025-12-03) PWAインストール検出
│   ├── useCoaching.ts           ✅ NEW! (2025-12-06) AIコーチング
│   └── usePushPermission.ts     ✅ NEW! (2025-12-06) Push通知許可
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
│   ├── ai/                      ✅ NEW! (2025-12-06) AI連携
│   │   ├── client.ts            ✅ Gemini APIクライアント
│   │   ├── prompts.ts           ✅ プロンプトテンプレート
│   │   ├── coaching.ts          ✅ コーチングサービス
│   │   └── index.ts             ✅ エクスポート
│   ├── push/                    ✅ NEW! (2025-12-06) Push通知
│   │   ├── subscription.ts      ✅ 購読管理
│   │   └── index.ts             ✅ エクスポート
│   └── cron/                    ✅ NEW! (2025-12-06) Cronユーティリティ
│       └── utils.ts             ✅ Cron共通処理
├── store/
│   ├── userStore.ts             ✅
│   ├── recordsStore.ts          ✅
│   └── settingsStore.ts         ✅
├── types/
│   └── index.ts                 ✅
├── constants/
│   ├── tags.ts                  ✅
│   ├── messages.ts              ✅
│   └── tips.ts                  ✅ NEW! (2025-12-01) 30種類カテゴリー別Tips
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
   - 後から記録機能（過去の日時を選択可能）
   - モーダルは「キャンセル」「記録する」ボタンでのみ閉じる（誤操作防止）✅ NEW! (2025-12-07)

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
  - 4フェーズ自動遷移（吸う4秒・止める4秒・吐く6秒・休憩2秒）
  - スケールアニメーション（0.6～1.5倍）
  - 現在のフェーズと残り秒数を大きく表示
  - 次のフェーズと秒数を予告表示（「次 → 息を止めて (4秒)」形式）
  - サイクル進捗表示（1/5～5/5）
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

### ✅ Phase 1 バグ修正完了（2025-12-01）

ブラウザ検証で発見されたバグを修正：

#### タイムゾーン修正 + date-fns採用
- **問題**: `toISOString().split('T')[0]`がUTC日付を返し、0時～8時59分（JST）に記録すると前日の日付になる
- **解決**: `lib/utils/date.ts`をdate-fnsベースに実装
  - `date-fns`パッケージ導入（Tree-shaking対応、軽量）
  - `format`, `startOfDay`, `subDays`, `getTime`, `parse`等を使用
  - 日本語ロケール対応（`date-fns/locale/ja`）
- **利用可能な関数**:
  - `getLocalDateString()` - YYYY-MM-DD形式（ローカル）
  - `getLocalMidnight()` - 深夜0時（startOfDay使用）
  - `parseLocalDateString()` - 文字列→Date（parse使用）
  - `formatDateJapanese()` - "12月1日(月)"形式
  - `formatTimeString()` - "14:30"形式
  - `getHourFromTimestamp()` - タイムスタンプから時間取得
- **影響ファイル**: 
  - `lib/utils/date.ts` - date-fnsベースに全面書き換え
  - `lib/utils/summary.ts` - date.tsからインポート
  - `hooks/useHistory.ts` - subDays, getTime使用
  - `app/(main)/history/page.tsx` - subDays使用
  - `components/history/DayDetailModal.tsx` - getHourFromTimestamp使用

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

### ✅ PWA基盤設定完了（2025-12-03 NEW!）

#### 17. PWA基盤設定
- **next.config.ts** - PWA設定強化 ✅
  - `@ducanh2912/next-pwa` によるService Worker自動生成
  - Workboxランタイムキャッシュ戦略（8種類）：
    - Google Fonts: CacheFirst（1年）
    - Static Font Assets: StaleWhileRevalidate（1週間）
    - Image Assets: StaleWhileRevalidate（24時間）
    - Next.js Image Optimization: StaleWhileRevalidate（24時間）
    - JS Assets: StaleWhileRevalidate（24時間）
    - CSS Assets: StaleWhileRevalidate（24時間）
    - Firestore API: NetworkFirst（5分、タイムアウト10秒）
  - オフラインフォールバック: `/offline`
  - `turbopack: {}` 設定（開発時のみTurbopack使用）

- **package.json** - ビルドスクリプト修正 ✅
  - `"build": "next build --webpack"` に変更
  - 理由: Next.js 16のTurbopackデフォルト化と`@ducanh2912/next-pwa`の非互換対応
  - 開発時はTurbopack（高速）、本番ビルド時はWebpack（PWA生成）を使い分け

- **app/offline/page.tsx** - オフラインフォールバックページ ✅ NEW!
  - `"use client"` ディレクティブ（クライアントコンポーネント）
  - オフライン状態の視覚的表示
  - オフラインでも利用可能な機能リスト
  - 再読み込みボタン

- **app/layout.tsx** - アイコンメタデータ追加 ✅
  - favicon.ico（any size）
  - icon-192x192.png, icon-512x512.png
  - apple-touch-icon.png（180x180）

- **public/manifest.json** - PWAマニフェスト強化 ✅
  - maskableアイコン分離（purpose: "maskable"）
  - 標準アイコン（purpose: "any"）8サイズ

- **public/icons/** - PWAアイコン ✅
  - icon-72x72.png, icon-96x96.png, icon-128x128.png
  - icon-144x144.png, icon-152x152.png, icon-192x192.png
  - icon-384x384.png, icon-512x512.png

- **public/** - ルートアセット ✅
  - favicon.ico（32x32）
  - apple-touch-icon.png（180x180）

#### 生成されるService Workerファイル
ビルド後に `public/` に生成：
- `sw.js` - メインService Worker
- `workbox-*.js` - Workboxランタイム
- `swe-worker-*.js` - 追加ワーカー

#### 検証結果（2025-12-03）
- ✅ Service Worker: 登録・有効化確認
- ✅ アイコン: 全サイズHTTP 200
- ✅ オフラインページ: 正常表示

### ✅ Tips システム刷新（2025-12-01 NEW!）

#### 16. 禁煙対策Tips（30種類カテゴリー別）
- **constants/tips.ts** - Tips定義ファイル ✅
  - 30種類のカテゴリー別Tips（CSVから変換）
  - 9カテゴリー: 感覚刺激、呼吸法、代替行動、心理・認知、運動、環境調整、食事・栄養、コミュニケーション、急速休息
  - 型定義: `TipCategory`, `Tip`
  - ヘルパー関数: `getRandomTip()`, `getTipsByCategory()`, `getAllCategories()`
- **components/dashboard/RandomTip.tsx** - 更新 ✅
  - カテゴリーバッジ表示（絵文字付き）
  - アクション + 説明の2段表示
  - SSR対応（初期値固定、クライアントでランダム化）
- **constants/messages.ts** - 古いRANDOM_TIPS削除 ✅

#### 将来の拡張ポイント
- **カテゴリーフィルタリング**: SOS機能で「今の状況に合ったTips」を提案
  - ストレス時 → 「心理・認知」「呼吸法」を優先
  - 食後 → 「代替行動」「感覚刺激」を優先
- **お気に入り機能**: ユーザーが有効だったTipsをブックマーク
- **学習機能**: ユーザーの状況タグとTipsの効果を関連付け、パーソナライズ

### 📋 開発フェーズ完了状況

#### Phase 2: PWA設定 ✅ 完了（2025-12-03）
- [x] PWAアイコン作成（72x72～512x512）✅ 完了
- [x] Service Worker設定（next-pwa）✅ 完了
- [x] オフラインページ（/offline）✅ 完了
- [x] インストールガイド（E-02）✅ 完了（2025-12-03）
- [ ] iOSスプラッシュスクリーン（スキップ - 後回し）

#### Phase 3: Web Push通知・AI機能 ✅ 完了（2025-12-06）

##### Push通知基盤 ✅
- [x] **lib/firebase/admin.ts** - Firebase Admin SDK初期化
  - `getAdminMessaging()` - FCMインスタンス取得
  - `sendPushNotification()` - 単一デバイス送信
  - `sendPushNotificationToMultiple()` - マルチキャスト送信
  - `sendSwanNotification()` - Swan専用通知送信
  - `SwanNotificationType` - 6種類の通知タイプ
- [x] **public/firebase-messaging-sw.js** - FCM Service Worker
  - バックグラウンドメッセージ処理
  - 通知クリック時のアプリ起動
- [x] **lib/push/subscription.ts** - プッシュ購読管理
  - `isPushNotificationSupported()` - ブラウザサポート確認
  - `isIOSRequiringInstallation()` - iOS要件確認
  - `getFCMToken()` - FCMトークン取得
  - `subscribeToPushNotifications()` - 購読フロー
  - `unsubscribeFromPushNotifications()` - 購読解除
  - `setupForegroundMessageHandler()` - フォアグラウンド通知
- [x] **hooks/usePushPermission.ts** - 通知許可フック
  - `PushPermissionState` - 7状態管理
  - `subscribe()`, `unsubscribe()`, `refresh()`
- [x] **components/pwa/PushPermissionPrompt.tsx** - 許可UI
  - 3バリアント: banner, card, inline
  - 7日間dismissメカニズム

##### Gemini AI連携 ✅
- [x] **lib/ai/client.ts** - Gemini APIクライアント
  - `@google/genai` SDK使用
  - `generateText()` - テキスト生成
  - `generateTextStream()` - ストリーミング生成
  - `COACHING_GENERATION_CONFIG` - 温度0.8、500トークン
- [x] **lib/ai/prompts.ts** - プロンプトテンプレート
  - `UserCoachingContext` - ユーザーコンテキスト型
  - `BASE_SYSTEM_PROMPT` - 基本システムプロンプト（日本語）
  - 6種類のプロンプト関数: morning, craving, step-down, survival, SOS, success
  - `FALLBACK_MESSAGES` - AI障害時のフォールバック
- [x] **lib/ai/coaching.ts** - コーチングサービス
  - `generateCoachingMessage()` - メッセージ生成
  - `getCurrentTimeOfDay()` - 時間帯判定
  - `shouldSuggestStepDown()` - ステップダウン判定
  - `getTypicalCravingHours()` - 吸いたい時間分析
  - `buildCoachingContext()` - コンテキスト構築
- [x] **app/api/coaching/route.ts** - コーチングAPI
  - POST: メッセージ生成
  - GET: API情報
- [x] **hooks/useCoaching.ts** - コーチングフック
  - `generateMessage()` - メッセージ取得
  - `useSOSCoaching()` - SOS専用フック

##### AIコーチング機能実装 ✅
- [x] **D-03: SOS AI励ましメッセージ** ✅
  - `components/sos/SOSModal.tsx` を更新
  - モーダル開くと自動でAIメッセージ取得
  - ローディングアニメーション
  - フォールバックメッセージ対応
- [x] **C-01: モーニング・ブリーフィング** ✅
  - `app/api/cron/morning-briefing/route.ts`
  - 毎朝7時JST実行
- [x] **C-02: 魔の時間帯アラート** ✅
  - `app/api/cron/craving-alert/route.ts`
  - 9:30, 12:30, 15:30, 18:30, 21:30 JST実行
- [x] **C-03: ステップダウン提案** ✅
  - `app/api/cron/step-down/route.ts`
  - 週1回（日曜20時JST）実行
- [x] **C-04: 生存確認通知** ✅
  - `app/api/cron/survival-check/route.ts`
  - 4時間おき（8, 12, 16, 20時JST）実行

##### Cron基盤 ✅
- [x] **lib/cron/utils.ts** - Cronユーティリティ
  - `verifyCronRequest()` - CRON_SECRET検証
  - `getUsersWithPushSubscriptions()` - 購読ユーザー取得
  - `getInactiveUsers()` - 未記録ユーザー検出
  - `getUserDailyStats()` - 日次統計取得
  - `sendNotificationToUser()` - 通知送信
- [x] **vercel.json** - Cron Job設定
  - **Hobbyプラン制限**: 1日1回のみ実行可能
  - 現在は morning-briefing のみ設定（毎朝7時JST）
  - 他のCron APIルート（craving-alert, step-down, survival-check）は実装済みだが自動実行なし
  - Proプランにアップグレードすれば全4つのCron有効化可能

##### 必要な環境変数（Phase 3追加分）
```.env
# Gemini API
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_GEMINI_MODEL=gemini-2.0-flash-exp

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Push Notifications
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_public_key

# Cron Jobs
CRON_SECRET=your_random_secret_string
```

#### Phase 4: テスト・最適化（次のフェーズ）
- [ ] Playwrightテスト
- [ ] パフォーマンス最適化
- [ ] アクセシビリティ監査
- [ ] セキュリティレビュー

## ビルド状況

### 最新ビルド: 2025-12-07
```
✓ Compiled successfully
✓ TypeScript checks passed
✓ Static pages generated
✓ PWA Service Worker generated (sw.js)
✓ All API routes functional
```

**Phase 3 完了**: Web Push通知、Gemini AIコーチング、Cron Jobs実装完了

## 次のステップ

### Phase 4 開始前に必要な作業
1. **環境変数の設定確認**
   - Firebase Admin SDK（`docs/firebase-push-setup.md` 参照）
   - Gemini API Key
   - CRON_SECRET（Vercel Cron用）

2. **Vercel デプロイ確認**
   - Cron Jobs の動作確認
   - 本番環境での通知テスト

### Phase 4 タスク
1. **Playwrightテスト作成**
   - 認証フロー
   - 記録機能
   - SOS機能
   - 履歴ページ

2. **パフォーマンス最適化**
   - Core Web Vitals改善
   - バンドルサイズ削減

3. **セキュリティ・アクセシビリティ**
   - セキュリティレビュー
   - WCAG AA準拠確認

### 開発コマンド
```bash
npm run dev          # 開発サーバー
npm run build        # 本番ビルド
npm run start        # 本番サーバー
```

## 技術スタック（確定）

- **フロントエンド**: Next.js 16.0.7 (App Router), React 19.2.0, TypeScript 5.x
- **スタイリング**: Tailwind CSS 4.x
- **状態管理**: Zustand 5.0.8
- **バックエンド**: Firebase 12.6.0 (Auth, Firestore, FCM)
- **PWA**: @ducanh2912/next-pwa 10.2.9
- **AI**: Gemini 2.0 Flash API（✅ 統合完了 - 2025-12-06）

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
