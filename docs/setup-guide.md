# Swan セットアップガイド

## 現在の状況

✅ **Phase 1 基本機能の実装が完了しました！**

以下の機能が実装されています:

### 実装済み機能

1. **Firebase設定**
   - 認証（匿名認証 + Google認証）
   - Firestore設定（データベース）
   - Firebase Cloud Messaging設定（Push通知用）

2. **UIコンポーネント**
   - Button（7種類のバリアント）
   - Card（複合コンポーネント）
   - Modal（フォーカストラップ、アクセシビリティ対応）
   - Celebration（祝福アニメーション - 我慢成功時に表示）

3. **状態管理（Zustand）**
   - userStore（ユーザー認証状態）
   - recordsStore（喫煙・我慢記録）
   - settingsStore（ユーザー設定）

4. **ページ**
   - トップページ（/）- 認証状態に応じたリダイレクト
   - サインインページ（/signin）- 匿名/Googleログイン ※ディレクトリは `app/(auth)/signin/` だがURLは `/signin`
   - ダッシュボード（/dashboard）- 3つの記録ボタン、目標進捗、ランダムTips

5. **型定義**
   - UserProfile, SmokingRecord, DailySummary
   - UserSettings, NotificationSettings, GoalSettings
   - SituationTag（10種類の状況タグ）

### データフロー

```
ユーザー操作
  ↓
ダッシュボード（3つのボタン）
  ↓
状況タグ選択モーダル
  ↓
recordsStore.addRecord()
  ↓
（今後実装）
- IndexedDBに保存
- Firestoreに同期
- DailySummaryを更新
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

## まだ実装していない機能

### Phase 1 残タスク
- [ ] IndexedDB統合（オフラインデータ保存）
- [ ] Firestore CRUD操作（records, settings, summaries）
- [ ] Daily Summary自動更新ロジック
- [ ] SOS機能（3分タイマー、深呼吸モード）

### Phase 2以降
- [ ] PWAアイコン・スプラッシュスクリーン作成
- [ ] Service Workerオフライン対応
- [ ] Web Push通知機能
- [ ] Gemini AIコーチング機能
- [ ] 履歴ページ・統計ダッシュボード
- [ ] 設定ページ
- [ ] E2Eテスト（Playwright）
- [ ] パフォーマンス最適化

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

1. **IndexedDB実装** - オフラインデータ永続化
2. **Firestore CRUD** - クラウド同期機能
3. **SOS機能** - タイマー・深呼吸モード
4. **履歴ページ** - 過去の記録閲覧

詳細は `docs/development-plan.md` を参照してください。
