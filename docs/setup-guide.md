# Swan セットアップガイド

## 現在の状況

✅ **Phase 1 完全完了 + Phase 2 PWA設定 部分完了！**（2025-12-03更新）

以下の機能が実装されています:

### 実装済み機能

#### Phase 1: MVP基盤（完了）

1. **Firebase設定**
   - 認証（匿名認証 + Google認証）
   - Firestore設定（データベース）
   - Firebase Cloud Messaging設定（Push通知用）

2. **UIコンポーネント**
   - Button（7種類のバリアント）
   - Card（複合コンポーネント）
   - Modal（フォーカストラップ、アクセシビリティ対応）
   - Celebration（祝福アニメーション）
   - Switch（トグルスイッチ、アクセシビリティ対応）

3. **状態管理（Zustand）**
   - userStore（ユーザー認証状態）
   - recordsStore（喫煙・我慢記録）
   - settingsStore（ユーザー設定）

4. **ページ**
   - トップページ（/）- 認証状態に応じたリダイレクト
   - サインインページ（/signin）- 匿名/Googleログイン
   - ダッシュボード（/dashboard）- 記録ボタン、目標進捗、Tips、成果可視化パネル
   - SOS機能（/sos/timer, /sos/breathing）- 3分タイマー、深呼吸モード
   - 履歴ページ（/history）- 期間フィルター、統計、チャート、詳細モーダル
   - 設定ページ（/settings）- 目標・コスト・通知・アカウント管理
   - オフラインページ（/offline）- オフラインフォールバック

5. **データ永続化**
   - IndexedDB統合（オフラインファースト）
   - Firestore同期（自動バックグラウンド同期）
   - 同期キュー（オフライン時の変更を保持）

6. **型定義**
   - UserProfile, SmokingRecord, DailySummary
   - UserSettings, NotificationSettings, GoalSettings
   - SituationTag（10種類の状況タグ）

#### Phase 2: PWA設定（部分完了）

7. **PWA基盤**
   - PWAアイコン（72px〜512px、8サイズ）
   - apple-touch-icon.png（180x180）
   - favicon.ico（32x32）
   - manifest.json（maskableアイコン対応）
   - Service Worker（Workboxキャッシュ戦略）
   - オフラインフォールバックページ

### データフロー

```
ユーザー操作
  ↓
ダッシュボード（3つのボタン）
  ↓
状況タグ選択モーダル
  ↓
useRecords hook
  ↓
IndexedDB保存（即座）
  ↓
Firestore同期（オンライン時）または同期キュー（オフライン時）
  ↓
DailySummary自動更新
```

## 次のステップ: Firebase プロジェクトの設定

アプリを動作させるには、Firebaseプロジェクトを作成し、環境変数を設定する必要があります。

### 1. Firebase プロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名: `swan-pwa`（任意）
4. Google Analyticsは任意（推奨: 有効化）

### 2. Firebase Authentication の設定

1. Firebase Console > Authentication > Get Started
2. Sign-in method タブを開く
3. 「匿名」を有効化
4. 「Google」を有効化（サポートメール設定が必要）

### 3. Cloud Firestore の設定

1. Firebase Console > Firestore Database > Create database
2. ロケーション: `asia-northeast1` (東京) を選択
3. セキュリティルール: まず「テストモードで開始」を選択（後で本番用に変更）

### 4. Firebase Cloud Messaging の設定（Web Push用）

1. Firebase Console > Project Settings > Cloud Messaging
2. Web Push certificates タブを開く
3. 「Generate key pair」をクリック → VAPID鍵が生成される
4. この鍵をコピーして環境変数に設定

### 5. Web アプリの登録

1. Firebase Console > Project Settings > General
2. 「アプリを追加」→ Web アプリ「</>」を選択
3. アプリのニックネーム: `Swan PWA`
4. 「このアプリのFirebase Hostingも設定します」はチェックしない
5. 「アプリを登録」をクリック
6. Firebase SDK configuration が表示される → この値を使用

### 6. 環境変数ファイルの作成

プロジェクトルートに `.env.local` ファイルを作成:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Cloud Messaging (FCM)
NEXT_PUBLIC_FCM_VAPID_KEY=your-vapid-key

# Gemini AI API (まだ使用していない)
GEMINI_API_KEY=your-gemini-api-key

# Cron Secret (Vercel Cron Jobs用 - まだ使用していない)
CRON_SECRET=your-random-secret
```

**重要**: `.env.local` ファイルは `.gitignore` に含まれているため、Gitにコミットされません。

### 7. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

### 8. 動作確認

1. トップページ（/）にアクセス → サインインページにリダイレクト
2. 「匿名で始める」をクリック → 認証成功 → ダッシュボードにリダイレクト
3. ダッシュボードで3つのボタンをテスト:
   - 「吸った」→ 状況タグ選択 → 記録
   - 「吸いたい」→ 状況タグ選択 → 記録（将来はSOSフロー）
   - 「我慢できた」→ 状況タグ選択 → 記録 → 励ましメッセージ表示

## 残りのタスク

### Phase 2 残タスク
- [ ] iOSインストール誘導UI（E-02）
- [ ] iOSスプラッシュスクリーン

### Phase 3: Web Push通知 + AI
- [ ] Web Push通知機能（FCM）
- [ ] Gemini AIコーチング機能
- [ ] モーニング・ブリーフィング（C-01）
- [ ] 魔の時間帯アラート（C-02）
- [ ] ステップダウン提案（C-03）
- [ ] 生存確認通知（C-04）
- [ ] Vercel Cron Jobs設定

### Phase 4: テスト・最適化
- [ ] E2Eテスト（Playwright）
- [ ] パフォーマンス最適化
- [ ] アクセシビリティ監査
- [ ] セキュリティレビュー

## トラブルシューティング

### Firebase初期化エラー

エラー: `Missing required Firebase configuration`

→ `.env.local` ファイルが正しく作成されているか確認

### ビルドエラー

```bash
npm run build
```

でエラーが出る場合、TypeScript型エラーを確認

### 開発サーバーが起動しない

```bash
rm -rf .next node_modules
npm install
npm run dev
```

## 次の開発ステップ

1. **iOSインストール誘導UI（E-02）** - ホーム画面追加ガイド
2. **Web Push通知設定** - FCM統合
3. **Gemini AI統合** - AIコーチング機能

詳細は `docs/development-plan.md` を参照してください。

## ビルドコマンド

```bash
# 開発サーバー（Turbopack使用、高速）
npm run dev

# 本番ビルド（Webpack使用、PWA生成）
npm run build

# 本番サーバー
npm run start

# Lint
npm run lint

# テスト
npm run test
npm run test:e2e
```

**注意**: 本番ビルドでは `--webpack` フラグが必要です（`@ducanh2912/next-pwa` がTurbopack非互換のため）。
