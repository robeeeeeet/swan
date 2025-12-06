# Firebase Cloud Messaging (FCM) セットアップガイド

このガイドでは、Swan PWAでWeb Push通知を有効にするために必要なFirebase Cloud Messaging（FCM）の設定手順を説明します。

---

## 📋 前提条件

- Firebase プロジェクトが作成済みであること
- Firebase Console へのアクセス権があること
- Node.js 18+ がインストール済みであること

---

## 1️⃣ Firebase Cloud Messaging (FCM) を有効化

### 手順

1. **Firebase Console** にアクセス
   - https://console.firebase.google.com/

2. プロジェクト（Swan）を選択

3. 左サイドバーから **「実行」**（または「エンゲージ」）→ **「Messaging」** をクリック

4. 「Get started」または「使ってみる」ボタンをクリック

5. FCM が有効化されます（数秒で完了）

---

## 2️⃣ VAPID キーペアの生成

Web Push通知には **VAPID（Voluntary Application Server Identification）キー** が必要です。

### 手順

1. Firebase Console で **「プロジェクトの設定」**（歯車アイコン）をクリック

2. **「Cloud Messaging」** タブを選択

3. 下にスクロールして **「Web プッシュ証明書」** セクションを探す

4. **「ウェブプッシュ証明書」** の **「鍵ペアを生成」** ボタンをクリック

5. 生成された **公開鍵（VAPID Public Key）** をコピー
   - 形式: `BK...`（83文字程度のBase64文字列）

6. この公開鍵を `.env.local` ファイルに保存（後述）

### 注意事項

- **公開鍵のみ**が表示されます（秘密鍵は Firebase 側で自動管理）
- このプロジェクトでは、Firebase Admin SDK を使用するため、秘密鍵を手動で管理する必要はありません

---

## 3️⃣ Firebase Admin SDK の設定（サーバーサイド用）

Push通知の送信には **Firebase Admin SDK** が必要です。

### 手順

1. Firebase Console で **「プロジェクトの設定」** → **「サービス アカウント」** タブを選択

2. **「新しい秘密鍵の生成」** ボタンをクリック

3. JSON ファイルがダウンロードされます
   - ファイル名例: `swan-xxxxx-firebase-adminsdk-xxxxx.json`

4. このファイルを**安全な場所**に保存（絶対にGitにコミットしない！）

5. JSON ファイルの内容から以下の値を `.env.local` に設定：
   - `FIREBASE_ADMIN_PROJECT_ID`: `project_id` の値
   - `FIREBASE_ADMIN_CLIENT_EMAIL`: `client_email` の値
   - `FIREBASE_ADMIN_PRIVATE_KEY`: `private_key` の値（**改行含む**）

### 秘密鍵の扱い方

**重要**: `private_key` には改行（`\n`）が含まれています。環境変数に設定する際は、**ダブルクォートで囲む**必要があります。

```bash
# ❌ 間違い（改行が解釈されない）
FIREBASE_ADMIN_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n

# ✅ 正しい（ダブルクォートで囲む）
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

---

## 4️⃣ 環境変数の設定

### `.env.local` ファイルの作成

プロジェクトルートに `.env.local` ファイルを作成し、以下の内容を設定します。

```bash
# ===========================
# Firebase クライアント設定
# ===========================
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...（Firebase設定から取得）
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=swan-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=swan-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=swan-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxx

# ===========================
# Firebase Admin SDK（サーバーサイド）
# ===========================
FIREBASE_ADMIN_PROJECT_ID=swan-xxxxx
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@swan-xxxxx.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"

# ===========================
# Web Push 通知（VAPID）
# ===========================
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BK...（手順2で生成した公開鍵）

# ===========================
# Gemini AI
# ===========================
GEMINI_API_KEY=AIza...（Google AI Studio で取得）

# ===========================
# Vercel Cron Jobs（セキュリティ用）
# ===========================
CRON_SECRET=your-random-secret-string-here
```

### 環境変数の説明

| 変数名 | 用途 | 取得元 |
|--------|------|--------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push購読時の公開鍵 | Firebase Console（手順2） |
| `FIREBASE_ADMIN_PROJECT_ID` | Admin SDK のプロジェクトID | サービスアカウント JSON |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Admin SDK のクライアントメール | サービスアカウント JSON |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Admin SDK の秘密鍵 | サービスアカウント JSON |

---

## 5️⃣ Gemini API キーの取得（AI機能用）

### 手順

1. **Google AI Studio** にアクセス
   - https://aistudio.google.com/

2. 右上の **「Get API key」** をクリック

3. **「Create API key」** → **「Create API key in new project」** を選択
   - または既存のGoogle Cloud プロジェクトを選択

4. 生成された API キーをコピー

5. `.env.local` の `GEMINI_API_KEY` に設定

---

## 6️⃣ Cron Secret の生成（Vercel Cron Jobs用）

Vercel Cron Jobs を外部から不正に実行されないようにするため、秘密鍵を設定します。

### 手順

1. ランダムな文字列を生成（以下のいずれかの方法）

**方法1: Node.js（推奨）**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**方法2: OpenSSL**
```bash
openssl rand -hex 32
```

**方法3: オンラインツール**
- https://www.uuidgenerator.net/

2. 生成された文字列を `.env.local` の `CRON_SECRET` に設定

---

## 7️⃣ Vercel 環境変数の設定

Vercel にデプロイする際は、上記の環境変数を Vercel ダッシュボードにも設定する必要があります。

### 手順

1. Vercel ダッシュボードでプロジェクトを選択

2. **「Settings」** → **「Environment Variables」** をクリック

3. `.env.local` の内容を**すべて**追加
   - `NEXT_PUBLIC_*` で始まる変数
   - `FIREBASE_ADMIN_*` で始まる変数
   - `GEMINI_API_KEY`
   - `CRON_SECRET`

4. 環境を選択（Production, Preview, Development）

5. **「Save」** をクリック

---

## 8️⃣ 動作確認

### ローカル環境での確認

```bash
# 開発サーバー起動
npm run dev

# ブラウザで http://localhost:3000 を開く

# DevTools のコンソールで環境変数を確認
console.log('VAPID Key:', process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
```

### 確認項目

- [ ] VAPID公開鍵が正しく読み込まれているか
- [ ] Firebase 初期化時にエラーが出ていないか
- [ ] Service Worker が登録されているか（DevTools → Application → Service Workers）

---

## 🔒 セキュリティのベストプラクティス

### ✅ やるべきこと

- `.env.local` を `.gitignore` に追加（デフォルトで含まれています）
- Firebase Admin SDK の秘密鍵は**絶対に**公開しない
- Vercel の環境変数は「Production」と「Preview」で分ける

### ❌ やってはいけないこと

- 秘密鍵をソースコードにハードコーディング
- `.env.local` をGitにコミット
- 公開リポジトリに環境変数を含める

---

## 🚨 トラブルシューティング

### 問題1: VAPID公開鍵が読み込まれない

**原因**: 環境変数が正しく設定されていない

**解決策**:
1. `.env.local` のファイル名が正しいか確認（`.env.local.txt` になっていないか）
2. `NEXT_PUBLIC_` プレフィックスが付いているか確認
3. 開発サーバーを再起動（環境変数の変更後は必須）

### 問題2: Firebase Admin SDK の認証エラー

**原因**: 秘密鍵の改行が正しく解釈されていない

**解決策**:
```bash
# private_key をダブルクォートで囲む
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

### 問題3: Push通知が届かない（iOS）

**原因**: iOS Safari では「ホーム画面に追加」が必須

**解決策**:
1. Safari で https://your-app.vercel.app を開く
2. 共有ボタン → 「ホーム画面に追加」
3. ホーム画面のアイコンからアプリを起動
4. 通知許可をリクエスト

---

## 📚 参考リンク

- [Firebase Cloud Messaging 公式ドキュメント](https://firebase.google.com/docs/cloud-messaging)
- [Web Push 通知の概要](https://web.dev/push-notifications-overview/)
- [VAPID とは？](https://blog.mozilla.org/services/2016/08/23/sending-vapid-identified-webpush-notifications-via-mozillas-push-service/)
- [Gemini API ドキュメント](https://ai.google.dev/docs)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

---

## ✅ セットアップ完了チェックリスト

- [ ] FCM が Firebase Console で有効化されている
- [ ] VAPID 公開鍵が生成されている
- [ ] Firebase Admin SDK の JSON ファイルをダウンロードした
- [ ] `.env.local` ファイルを作成し、すべての環境変数を設定した
- [ ] Gemini API キーを取得した
- [ ] Cron Secret を生成した
- [ ] ローカル環境で動作確認した
- [ ] Vercel にデプロイする場合、環境変数を設定した

---

これでFirebase Cloud Messaging のセットアップは完了です！
次のステップは、Push通知基盤の実装（Service Worker登録、購読管理）に進みます。
