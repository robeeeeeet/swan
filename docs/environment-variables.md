# Swan - 環境変数チェックリスト

このドキュメントでは、Swanアプリケーションで必要な環境変数を説明します。

## 環境変数ファイル

プロジェクトルートに `.env.local` ファイルを作成し、以下の変数を設定してください。

`.env.example` ファイルをテンプレートとして使用できます:

```bash
cp .env.example .env.local
```

## 必須環境変数

### 🔥 Firebase Configuration

Firebase Console でプロジェクトを作成後、以下の値を取得できます。

| 変数名 | 説明 | 取得方法 |
|--------|------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key | Firebase Console > Project Settings > General > Your apps |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | 認証ドメイン | 上記と同じ（例: `your-project.firebaseapp.com`） |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | プロジェクトID | 上記と同じ |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ストレージバケット | 上記と同じ（例: `your-project.appspot.com`） |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | メッセージング送信者ID | 上記と同じ |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | アプリID | 上記と同じ |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Google Analytics測定ID（オプション） | Google Analyticsを有効化した場合のみ |

**取得手順**:
1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクトを選択
3. 左上の⚙️（設定）アイコン > **Project Settings**
4. **General** タブ > **Your apps** セクション
5. Webアプリ（`</>`アイコン）の **Config** を表示

---

### 🔔 Firebase Cloud Messaging (Web Push)

Web Push通知に必要なVAPID鍵です。

| 変数名 | 説明 | 取得方法 |
|--------|------|----------|
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | VAPID公開鍵 | Firebase Console > Project Settings > Cloud Messaging > Web Push certificates |

**取得手順**:
1. Firebase Console > Project Settings > **Cloud Messaging** タブ
2. **Web Push certificates** セクション
3. 鍵が未生成の場合: **Generate key pair** ボタンをクリック
4. 生成された公開鍵をコピー

---

### 🤖 Gemini API (AIコーチング機能)

Google Gemini 2.0 Flash APIの認証キーです（Phase 3で使用）。

| 変数名 | 説明 | 取得方法 |
|--------|------|----------|
| `GEMINI_API_KEY` | Gemini APIキー（サーバーサイド専用） | Google AI Studio |
| `NEXT_PUBLIC_GEMINI_MODEL` | 使用するGeminiモデル | 固定値: `gemini-2.0-flash` |

**取得手順**:
1. [Google AI Studio](https://aistudio.google.com/apikey) にアクセス
2. **Get API Key** をクリック
3. 生成されたキーをコピー

**注意**: `GEMINI_API_KEY` は `NEXT_PUBLIC_` プレフィックスがありません。これはサーバーサイド専用のキーです（クライアントに露出しない）。

---

### ⏱️ Vercel Cron Jobs (スケジュール実行)

Vercel Cron Jobsの認証用シークレットです（Phase 3で使用）。

| 変数名 | 説明 | 設定方法 |
|--------|------|----------|
| `CRON_SECRET` | Cron Job認証用ランダム文字列 | 任意の強力なランダム文字列を生成 |

**生成方法**:

```bash
# Linuxまたは macOS
openssl rand -base64 32

# または Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

生成された文字列を `.env.local` に設定してください。

---

## オプション環境変数

### 🌍 環境設定

| 変数名 | 説明 | デフォルト値 |
|--------|------|--------------|
| `NODE_ENV` | Node.js環境 | `development` |
| `NEXT_PUBLIC_APP_URL` | アプリケーションURL | `http://localhost:3000` |

---

## 環境変数の検証

環境変数が正しく設定されているか確認するには、テストスクリプトを実行してください:

```bash
npm run test:firebase
```

このスクリプトは以下を検証します:
- ✅ 必須環境変数の存在
- ✅ Firebase初期化
- ✅ Authentication機能
- ✅ Firestore読み書き

---

## セキュリティ上の注意

### ✅ 公開しても安全な変数（`NEXT_PUBLIC_` プレフィックス）

以下の変数はクライアント側（ブラウザ）で使用されるため、ビルド時にバンドルに含まれます:

- `NEXT_PUBLIC_FIREBASE_*`
- `NEXT_PUBLIC_GEMINI_MODEL`
- `NEXT_PUBLIC_APP_URL`

これらはGitにコミット**しない**でください（`.gitignore`で除外済み）が、公開されても直接的なセキュリティリスクはありません（Firebaseセキュリティルールで保護されています）。

### 🔒 公開してはいけない変数（サーバーサイド専用）

以下の変数はサーバーサイド専用です。**絶対に公開しないでください**:

- `GEMINI_API_KEY`
- `CRON_SECRET`

これらはVercelの環境変数設定で管理し、`.env.local` はGitにコミットしないでください。

---

## Vercelへのデプロイ時の設定

Vercelにデプロイする場合、環境変数はVercel Dashboardで設定します:

1. Vercel Dashboard > プロジェクトを選択
2. **Settings** > **Environment Variables**
3. 上記の変数を追加（Productionにチェック）
4. デプロイを再実行

**注意**: 環境変数を追加・変更した場合は、デプロイを再実行する必要があります。

---

## トラブルシューティング

### ❌ `Missing required Firebase configuration`

→ `.env.local` ファイルが存在し、すべての `NEXT_PUBLIC_FIREBASE_*` 変数が設定されているか確認してください。

### ❌ `PERMISSION_DENIED: Missing or insufficient permissions`

→ Firestoreセキュリティルールが正しくデプロイされているか確認してください（`firestore.rules` をFirebase Consoleにコピー）。

### ❌ `API key not valid. Please pass a valid API key.`

→ Firebase API Keyまたは Gemini API Keyが正しいか確認してください。

---

## 参考リンク

- [Firebase Console](https://console.firebase.google.com/)
- [Google AI Studio (Gemini API)](https://aistudio.google.com/apikey)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
