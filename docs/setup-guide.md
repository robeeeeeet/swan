# Swan セットアップガイド

## 現在の状況

✅ **Phase 1～3 完全完了！**（2025-12-07更新）

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

#### Phase 2: PWA設定（完了）

7. **PWA基盤**
   - PWAアイコン（72px〜512px、8サイズ）
   - apple-touch-icon.png（180x180）
   - favicon.ico（32x32）
   - manifest.json（maskableアイコン対応）
   - Service Worker（Workboxキャッシュ戦略）
   - オフラインフォールバックページ

8. **iOSインストールガイド（E-02）**
   - useInstallPrompt.ts（PWAインストール状態検出）
   - InstallGuide.tsx（4ステップ視覚ガイド）
   - InstallPromptBanner.tsx（ダッシュボードバナー）

#### Phase 3: Web Push通知・AI機能（完了）

9. **Push通知基盤**
   - Firebase Admin SDK（lib/firebase/admin.ts）
   - FCM Service Worker（firebase-messaging-sw.js）
   - 購読管理（lib/push/subscription.ts）
   - 通知許可UI（PushPermissionPrompt.tsx）
   - usePushPermission.ts フック

10. **Gemini AI連携**
    - AIクライアント（lib/ai/client.ts）
    - プロンプトテンプレート（lib/ai/prompts.ts）
    - コーチングサービス（lib/ai/coaching.ts）
    - コーチングAPI（app/api/coaching/route.ts）
    - useCoaching.ts フック

11. **AIコーチング機能**
    - D-03: SOS AI励ましメッセージ
    - C-01: モーニング・ブリーフィング（毎朝7時JST）- ✅ Cron自動実行
    - C-02: 魔の時間帯アラート - 📦 API実装済み（Hobbyプラン制限）
    - C-03: ステップダウン提案 - 📦 API実装済み（Hobbyプラン制限）
    - C-04: 生存確認通知 - 📦 API実装済み（Hobbyプラン制限）

12. **Cron基盤**
    - vercel.json（Hobbyプラン制限により1つのみ設定）
    - lib/cron/utils.ts（共通ユーティリティ）
    - ⚠️ **注意**: Vercel Hobbyプランは1日1回のCronのみ対応

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

**セキュリティルールのデプロイ**:

プロジェクトルートに `firestore.rules` ファイルが用意されています。以下の手順でデプロイしてください:

1. Firebase Console > Firestore Database > Rules タブを開く
2. `firestore.rules` ファイルの内容をコピー
3. Firebase Console のエディタに貼り付け
4. 「公開」をクリック

このルールにより、各ユーザーは自分のデータのみ読み書き可能になります（セキュアな設定）。

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

### 7. Firebase接続テスト（推奨）

環境変数とFirebase設定が正しいか確認するテストスクリプトを実行:

```bash
npm run test:firebase
```

このコマンドで以下がテストされます:
- ✅ 環境変数の存在確認
- ✅ Firebase初期化
- ✅ 匿名認証
- ✅ Firestoreへの読み書き

**成功例**:
```
✅ すべてのテストが成功しました！
```

**エラーが出た場合**:
- `PERMISSION_DENIED` → Firestoreセキュリティルールをデプロイしてください（上記の手順3参照）
- `Missing configuration` → `.env.local` の値を確認してください

### 8. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

### 9. 動作確認

1. トップページ（/）にアクセス → サインインページにリダイレクト
2. 「匿名で始める」をクリック → 認証成功 → ダッシュボードにリダイレクト
3. ダッシュボードで3つのボタンをテスト:
   - 「吸った」→ 状況タグ選択 → 記録
   - 「吸いたい」→ 状況タグ選択 → 記録（将来はSOSフロー）
   - 「我慢できた」→ 状況タグ選択 → 記録 → 励ましメッセージ表示

## 残りのタスク

### Phase 4: テスト・最適化（次のフェーズ）
- [ ] E2Eテスト（Playwright）
- [ ] パフォーマンス最適化
- [ ] アクセシビリティ監査
- [ ] セキュリティレビュー

### オプションタスク
- [ ] iOSスプラッシュスクリーン（後回し）

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

Phase 3が完了し、すべての主要機能が実装されました。次のステップは：

1. **Phase 4: テスト・最適化**
   - Playwrightによる E2Eテスト
   - パフォーマンス最適化（Core Web Vitals改善）
   - アクセシビリティ監査（WCAG AA準拠確認）
   - セキュリティレビュー

2. **本番デプロイ準備**
   - 環境変数の設定確認（Gemini API、Firebase Admin SDK、CRON_SECRET）
   - Vercel Cron Jobsの動作確認
   - 本番環境での通知テスト

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

# Firebase接続テスト
npm run test:firebase
```

**注意**: 本番ビルドでは `--webpack` フラグが必要です（`@ducanh2912/next-pwa` がTurbopack非互換のため）。

## 作成されたファイル

このセットアップで以下のファイルが追加されています:

### セキュリティ関連
- **firestore.rules** - Firestoreセキュリティルール（Firebase Consoleにデプロイ必要）

### テスト関連
- **scripts/test-firebase.ts** - Firebase接続テストスクリプト
  - 環境変数の検証
  - Firebase初期化テスト
  - Authentication機能テスト
  - Firestore読み書きテスト
