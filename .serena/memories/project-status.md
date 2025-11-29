# Swan PWA プロジェクト現状

## プロジェクト概要
- **プロジェクト名**: Swan（スワン）- 禁煙・減煙支援PWA
- **現在のステータス**: 初期セットアップ完了（2025-11-30）
- **開発フェーズ**: Phase 1開始準備完了

## 技術スタック（実装済み）

### フロントエンド・フレームワーク
- **Next.js**: 16.0.5 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Tailwind CSS**: 4.x (PostCSS統合)

### 主要ライブラリ
- **Zustand**: 5.0.8 (状態管理)
- **Firebase**: 12.6.0 (Firestore, Auth, FCM)
- **@ducanh2912/next-pwa**: 10.2.9 (PWA対応)
- **@next/third-parties**: 16.0.5

### ビルド・開発ツール
- **ESLint**: 9.x
- **PostCSS**: Tailwind CSS 4統合

## プロジェクト構造

### ディレクトリ構成
```
swan/
├── app/                    # Next.js App Router (src/なし)
│   ├── (auth)/            # 認証ルート（未実装）
│   ├── (main)/            # メインアプリ（未実装）
│   ├── api/               # APIルート（未実装）
│   ├── sos/               # SOSフロー（未実装）
│   ├── layout.tsx         # ルートレイアウト ✅
│   ├── globals.css        # グローバルスタイル ✅
│   └── page.tsx           # トップページ ✅
├── components/            # 空ディレクトリ
├── hooks/                 # 空ディレクトリ
├── lib/                   # サービス層
│   ├── ai/               # 空ディレクトリ
│   ├── firebase/         # 空ディレクトリ
│   ├── indexeddb/        # 空ディレクトリ
│   └── push/             # 空ディレクトリ
├── store/                 # 空ディレクトリ
├── types/                 # 空ディレクトリ
├── constants/             # 空ディレクトリ
├── public/
│   ├── icons/            # PWAアイコン（未作成）
│   └── manifest.json     # PWAマニフェスト ✅
├── docs/                  # ドキュメント ✅
├── .env.example          # 環境変数テンプレート ✅
└── package.json          # ✅
```

### 重要な設計選択
1. **src/ディレクトリなし**: Next.js 16の推奨に従い、プロジェクトルートに直接app/を配置
2. **Tailwind CSS 4**: PostCSS統合、`@theme inline`でデザイントークン管理
3. **lib/db → lib/indexeddb**: IndexedDB関連ファイルの配置先

## 実装済みファイル詳細

### app/layout.tsx
- Noto Sans JPフォント設定
- PWAメタデータ（manifest、themeColor、appleWebApp）
- viewport設定（iOS Safe Area対応）
- 言語: 日本語 (`lang="ja"`)

### app/globals.css
- Swanデザインシステム実装
  - プライマリカラー: Teal (#14b8a6)
  - セカンダリカラー: Orange (#f97316)
  - セマンティックカラー: Success, Warning, Error, Neutral
- iOS Safe Area対応（env(safe-area-inset-*)）
- アクセシビリティ設定（最小タッチターゲット44px）
- ダークモード対応

### public/manifest.json
- アプリ名: Swan - 禁煙・減煙支援
- display: standalone
- theme_color: #14b8a6
- アイコン定義（72x72～512x512）

### next.config.ts
- PWA設定（@ducanh2912/next-pwa）
- Turbopack有効化
- 開発環境ではPWA無効化

### .env.example
- Firebase設定変数
- FCM VAPID鍵
- Gemini API鍵
- Cron Secret

## 未実装項目

### Phase 1 タスク（優先度高）
1. Firebase初期化（lib/firebase/config.ts）
2. 認証フロー（匿名認証）
3. 基本UIコンポーネント（Button, Card, Modal）
4. ダッシュボードページ
5. 喫煙記録API
6. SOS機能（タイマー、深呼吸）

### PWA関連（未実装）
- PWAアイコン画像（72x72～512x512）
- iOSスプラッシュスクリーン
- Service Worker（next-pwaで自動生成予定）
- オフラインページ(/offline)

### データベース・API（未実装）
- Firestore スキーマ
- IndexedDB スキーマ
- 全APIルート（/api/*）

## ビルド・動作確認

### 成功した動作
- ✅ `npm install` - 依存関係インストール成功
- ✅ `npm run build` - 警告なしでビルド成功
- ✅ `npm run dev` - 開発サーバー起動成功（http://localhost:3000）

### 環境情報
- Node.js: 20以上推奨
- Package Manager: npm
- OS: WSL2 (Linux)

## 次のステップ

### 即座に開始可能な作業
1. Firebase プロジェクト作成・設定
2. .env.local作成（.env.exampleをコピー）
3. lib/firebase/config.ts実装
4. 基本UIコンポーネント作成
5. デザインシステムに基づくコンポーネントライブラリ構築

### ドキュメント参照
- **完全な要件**: `docs/requirements.md`
- **実装計画**: `docs/development-plan.md`
- **オリジナル仕様**: `docs/memo.md`
- **Claude Code ガイド**: `CLAUDE.md`
- **デザインシステム**: `.claude/skills/swan-design-system/SKILL.md`
