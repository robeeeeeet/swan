# Swan - 禁煙・減煙支援PWA

AIコーチングと先回りサポートで、あなたの禁煙・減煙を支援するProgressive Web Appです。

## 🦢 プロジェクト概要

SwanはGemini 2.0 Flash APIを活用したAIコーチングとWeb Push通知により、日々の記録と先回りサポートを通じて段階的な禁煙を支援します。

**現在のステータス**: 初期セットアップ完了 - 実装フェーズに移行可能

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 16.0.5 (App Router), React 19, TypeScript
- **スタイリング**: Tailwind CSS 4
- **状態管理**: Zustand
- **データベース**: Firebase Firestore
- **認証**: Firebase Auth
- **Push通知**: Firebase Cloud Messaging (FCM)
- **AI/LLM**: Gemini 2.0 Flash API
- **PWA**: @ducanh2912/next-pwa (Workbox)
- **ホスティング**: Vercel

## 📁 プロジェクト構造

```
swan/
├── app/              # Next.js App Router
│   ├── (auth)/       # 認証関連ルート
│   ├── (main)/       # メインアプリケーション
│   ├── api/          # APIルート
│   └── sos/          # SOS機能
├── components/       # Reactコンポーネント
├── hooks/            # カスタムフック
├── lib/              # サービス層
│   ├── ai/           # AI/LLM統合
│   ├── firebase/     # Firebase設定
│   ├── indexeddb/    # オフラインストレージ
│   └── push/         # Push通知
├── store/            # Zustandストア
├── types/            # TypeScript型定義
├── constants/        # 定数定義
├── public/           # 静的アセット
│   ├── icons/        # PWAアイコン
│   └── manifest.json # PWAマニフェスト
└── docs/             # プロジェクトドキュメント
```

## 🚀 セットアップ

### 前提条件

- Node.js 20以上
- npm

### インストール

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.localに必要な値を設定してください
```

### 環境変数

以下の環境変数を`.env.local`に設定する必要があります：

- Firebase設定（API key、プロジェクトID等）
- Firebase Cloud Messaging VAPID鍵
- Gemini API鍵
- Cron Secret（Vercel scheduled functions用）

詳細は`.env.example`を参照してください。

## 💻 開発

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# Lint実行
npm run lint

# テスト実行（設定後）
npm run test
npm run test:e2e
```

開発サーバーは [http://localhost:3000](http://localhost:3000) で起動します。

## 🎨 デザインシステム

Swanは独自のデザインシステムを採用しています：

### カラーパレット

- **Primary (Teal)**: `#14b8a6` - 成長と健康の象徴
- **Secondary (Orange)**: `#f97316` - 温かみと励まし
- **Success (Green)**: `#22c55e` - 我慢成功時
- **Warning (Amber)**: `#f59e0b` - 目標超過時
- **Neutral (Gray)**: `#6b7280` - 喫煙記録（判断しない）

### UX原則

1. **判断しない**: 喫煙記録時はニュートラルなUI
2. **祝福する**: 成功時はアニメーションとポジティブフィードバック
3. **プライバシー重視**: 他人に見られても問題ない通知デザイン
4. **モバイルファースト**: 片手操作、親指ゾーン最適化

## 📱 主要機能（予定）

### A群：記録・入力機能
- **A-01**: 「吸った」ボタン
- **A-02**: 「吸いたい」ボタン（SOSフロー）
- **A-03**: 「我慢できた」ボタン
- **A-04**: 状況タグ付け

### B群：ダッシュボード
- **B-01**: 本数進捗ヘッダー
- **B-02**: ランダムTips
- **B-03**: 成果可視化パネル

### C群：AIコーチング（Web Push）
- **C-01**: モーニング・ブリーフィング
- **C-02**: 魔の時間帯アラート
- **C-03**: ステップダウン提案
- **C-04**: 生存確認

### D群：衝動対策・SOS機能
- **D-01**: 3分間タイマー
- **D-02**: 深呼吸モード
- **D-03**: AI激励メッセージ

## 📚 ドキュメント

- `docs/requirements.md` - 完全な機能要件定義書
- `docs/development-plan.md` - フェーズ別実装計画
- `docs/memo.md` - オリジナル機能仕様
- `CLAUDE.md` - Claude Code用プロジェクトガイド

## 🔐 セキュリティとプライバシー

- 最小限のデータ収集
- 匿名認証のサポート
- Firestore暗号化 + HTTPS通信
- プライバシーに配慮した通知設計

## 📄 ライセンス

Private - All Rights Reserved

## 🤝 開発フェーズ

**Phase 1（Week 1-2）**: MVP基盤 - 基本記録機能とSOS機能
**Phase 2（Week 3-4）**: ダッシュボード強化、PWA設定、オフライン対応
**Phase 3（Week 4-6）**: Web Push通知とAIコーチング機能
**Phase 4（Week 7-8）**: テスト、パフォーマンス最適化、アクセシビリティ

---

Made with ❤️ for supporting your smoke-free journey
