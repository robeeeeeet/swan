# Swan PWA プロジェクト現状（更新: 2025-11-30）

## プロジェクト概要
- **プロジェクト名**: Swan（スワン）- 禁煙・減煙支援PWA
- **現在のステータス**: Phase 1 基本機能実装完了
- **開発フェーズ**: Phase 2に移行準備中

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
│   ├── sos/                      📁 (ディレクトリのみ - Phase 1後半で実装予定)
│   ├── api/                      📁 (ディレクトリのみ)
│   ├── layout.tsx                ✅ ルートレイアウト
│   ├── globals.css               ✅ Swanデザインシステム
│   └── page.tsx                  ✅ リダイレクトページ
├── components/
│   ├── ui/
│   │   ├── Button.tsx           ✅
│   │   ├── Card.tsx             ✅
│   │   ├── Modal.tsx            ✅
│   └── Celebration.tsx      ✅
└── dashboard/
│       ├── RecordButton.tsx     ✅
│       ├── GoalHeader.tsx       ✅
│       └── RandomTip.tsx        ✅
├── hooks/
│   └── useAuth.ts               ✅
├── lib/
│   ├── firebase/
│   │   ├── config.ts            ✅
│   │   └── auth.ts              ✅
│   ├── ai/                      📁 (ディレクトリのみ)
│   ├── indexeddb/               📁 (ディレクトリのみ)
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

#### 認証フロー

1. **トップページ（/）**
   - 認証済み → `/dashboard` にリダイレクト
   - 未認証 → `/auth/signin` にリダイレクト

2. **サインインページ（/auth/signin）**
   - 匿名ログイン
   - Googleログイン
   - エラーハンドリング
   - ログイン後 → `/dashboard` にリダイレクト

3. **メインレイアウト認証ガード**
   - 未認証時は `/auth/signin` にリダイレクト
   - ローディング状態表示

### 🚧 未実装機能（Phase 1 残タスク）

#### 高優先度
1. **IndexedDB統合**
   - `lib/indexeddb/db.ts` - データベーススキーマ
   - `lib/indexeddb/records.ts` - レコード操作
   - `lib/indexeddb/sync.ts` - 同期キュー管理

2. **Firestore CRUD操作**
   - `lib/firebase/firestore.ts` - records, settings, summaries CRUD
   - オフライン同期ロジック

3. **Daily Summary更新**
   - 記録追加時にサマリー自動更新
   - 日付変更時の処理

4. **SOS機能（D群）**
   - `app/sos/timer/page.tsx` - 3分タイマー
   - `app/sos/breathing/page.tsx` - 深呼吸モード
   - `components/sos/Timer.tsx`, `BreathingCircle.tsx`

#### 中優先度
5. **履歴ページ**
   - `app/(main)/history/page.tsx`
   - 日別記録一覧
   - 統計グラフ

6. **設定ページ**
   - `app/(main)/settings/page.tsx`
   - 目標設定
   - 通知設定
   - アカウント管理

### 📋 Phase 2 以降のタスク

#### Phase 2: ダッシュボード強化・PWA設定
- [ ] PWAアイコン作成（72x72～512x512）
- [ ] iOSスプラッシュスクリーン
- [ ] Service Worker設定（next-pwa）
- [ ] オフライン対応強化
- [ ] 成果可視化パネル（B-03）
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

2. **IndexedDB実装**
   - スキーマ設計
   - CRUD操作
   - 同期キュー

3. **Firestore CRUD実装**
   - records コレクション
   - settings コレクション
   - summaries コレクション

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
