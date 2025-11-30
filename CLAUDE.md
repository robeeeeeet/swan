# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**Swan（スワン）**は、日本人ユーザーを対象とした禁煙・減煙支援のProgressive Web App（PWA）です。Gemini 2.0 Flash APIによるAIコーチングとWeb Push通知を活用し、日々の記録と先回りサポートを通じて段階的な禁煙を支援します。

**現在のステータス**: 企画フェーズ - 包括的な要件定義と設計ドキュメントが完成していますが、実装はまだ開始していません。

## 技術スタック

- **フロントエンド**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **状態管理**: Zustand
- **データベース**: Firebase Firestore
- **認証**: Firebase Auth（匿名認証＋ソーシャルログイン）
- **Push通知**: Firebase Cloud Messaging (FCM) - iOS Safari 16.4+対応
- **AI/LLM**: Gemini 2.0 Flash API
- **ホスティング**: Vercel（Cron Jobs活用）
- **PWA**: next-pwa (Workbox)

## プロジェクト構造

計画中のディレクトリ構造（`docs/development-plan.md`より）:

```
swan/
├── public/           # PWAアイコン、manifest.json、iOSスプラッシュ
├── src/
│   ├── app/          # Next.js App Router
│   │   ├── (auth)/   # 認証ルート
│   │   ├── (main)/   # メインアプリ（ダッシュボード、履歴、設定）
│   │   ├── sos/      # SOSフロー（タイマー、深呼吸）
│   │   └── api/      # APIルート、Cron Jobs
│   ├── components/   # 機能別Reactコンポーネント
│   ├── hooks/        # カスタムフック
│   ├── lib/          # サービス層（Firebase、AI、Push通知、IndexedDB）
│   ├── store/        # Zustandストア
│   ├── types/        # TypeScript型定義
│   └── constants/    # 定数（タグ、Tips、励ましメッセージ）
└── docs/             # プロジェクトドキュメント
```

## 重要ドキュメント

- `docs/requirements.md` - 完全な機能要件定義書（日本語）
- `docs/development-plan.md` - フェーズ別技術実装計画
- `docs/memo.md` - オリジナル機能仕様書
- `.claude/skills/swan-design-system/SKILL.md` - 包括的デザインシステム
- `.claude/skills/pwa-patterns/SKILL.md` - PWA実装パターン
- `.claude/skills/react-best-practices/SKILL.md` - React/Next.jsベストプラクティス

## 開発フェーズ

**Phase 1（Week 1-2）**: MVP基盤 - 基本記録機能とSOS機能
**Phase 2（Week 3-4）**: ダッシュボード強化、PWA設定、オフライン対応
**Phase 3（Week 4-6）**: Web Push通知とAIコーチング機能
**Phase 4（Week 7-8）**: テスト、パフォーマンス最適化、アクセシビリティ

## 主要機能

### A群：記録・入力機能
- **A-01**: 「吸った」ボタン - シンプルなカウンター
- **A-02**: 「吸いたい」ボタン - SOSフローをトリガー
- **A-03**: 「我慢できた」ボタン - 成功記録
- **A-04**: 状況タグ付け

### B群：ダッシュボード機能
- **B-01**: 本数進捗ヘッダー - 「今日の目標：あと〇本」
- **B-02**: ランダムTips - 励ましメッセージ
- **B-03**: 成果可視化パネル - 節約金額、取り戻した寿命

### C群：AIコーチング機能（Web Push活用）
- **C-01**: モーニング・ブリーフィング - 毎朝の通知
- **C-02**: 魔の時間帯アラート - 予測的な先回り通知
- **C-03**: ステップダウン提案 - 目標本数の自動調整
- **C-04**: 生存確認 - 入力忘れ防止の優しいリマインド

### D群：衝動対策・SOS機能
- **D-01**: 3分間タイマー - 「まずは3分だけ」
- **D-02**: 深呼吸モード - アニメーションガイド
- **D-03**: AI激励メッセージ - 状況に応じた励まし

## デザインシステム

Swanのデザインシステムの特徴:

- **プライマリカラー**: ティール（#14b8a6）- 成長と健康の象徴
- **セカンダリカラー**: オレンジ（#f97316）- 温かみと励まし
- **セマンティックカラー**:
  - 成功（緑）- 我慢成功時
  - 警告（アンバー）- 目標超過時
  - エラー（赤）- システムエラー
  - ニュートラル（グレー）- 喫煙記録時（判断しない）
- **タイポグラフィ**: Noto Sans JP、数字はタブular figures
- **スペーシング**: 4px基準単位（Tailwindデフォルト）
- **アクセシビリティ**: WCAG 2.1 Level AA準拠、最小タッチターゲット44px

### UX設計原則

1. **判断しない**: 喫煙記録時はニュートラルなUI
2. **祝福する**: 成功時はアニメーションとポジティブフィードバック
3. **プライバシー重視**: 他人に見られても問題ない通知デザイン
4. **モバイルファースト**: 片手操作、親指ゾーン最適化

## 実装時の重要な考慮事項

### PWA・iOS要件
- iOS Safari 16.4+ではWeb Push受信に「ホーム画面に追加」が必須
- iOSインストールガイド（E-02）の実装必須
- Service Workerでコア機能のオフラインキャッシュ対応
- IndexedDB同期キューでオフラインデータ永続化

### Firebase設定
必要な環境変数（作成時に`.env.example`参照）:
- Firebase設定（API key、project IDなど）
- VAPID鍵ペア（Web Push用）
- Gemini API key
- Cron secret（Vercel scheduled functions用）

### オフライン対応戦略
- **常時利用可能**: 記録ボタン、SOS機能、キャッシュ済み履歴
- **オンライン時同期**: Firestore同期、統計再計算
- **ネットワーク必須**: Push通知、AI機能

### AI統合
Gemini 2.0 Flash APIの用途:
- パーソナライズされた励ましメッセージ（D-03）
- モーニング・ブリーフィングコンテンツ（C-01）
- コーチング推奨事項（C-03）

コンテキストに含めるべき情報: ユーザーの喫煙履歴、タグ、時間パターン、現在の進捗状況

### データプライバシー
- 最小限のデータ収集
- 匿名認証のサポート
- Firestore暗号化 + HTTPS
- 通知プライバシー設定可能（汎用メッセージ vs 詳細メッセージ）

## 開発ワークフロー

実装開始時の手順:
1. Next.js 14 + TypeScriptの初期化
2. Swanデザイントークンを含むTailwind CSS設定
3. Firebaseプロジェクトの設定
4. 基本認証フローの実装
5. `docs/development-plan.md`のフェーズ別計画に従う

## Claude Code利用ガイドライン

### サブエージェントの活用

タスクを任せられる専用サブエージェントがある場合は**必ず利用すること**。

利用可能なサブエージェント:
- **component-builder** - React/TypeScriptコンポーネント作成時
- **pwa-optimizer** - PWA機能（Service Worker、通知、オフライン対応）の実装・最適化時
- **security-reviewer** - セキュリティレビュー時（読み取り専用）
- **playwright-tester** - E2Eテスト作成・実行時
- **performance-tester** - パフォーマンステスト・最適化時

### スキルの活用

タスク内容に応じた専門スキルを**必ず読み込むこと**。

#### フロントエンド改修時（必須）

以下の3つのスキルを**必ず併用**すること:

1. **frontend-design** - 独創的で高品質なUIデザイン生成
2. **swan-design-system** - Swanアプリ統一デザイン言語（カラー、コンポーネント、UXパターン）
3. **react-best-practices** - React/TypeScript/Next.jsベストプラクティス

この3スキル併用により、**デザイン品質・実装品質・Swan独自スタイルの三位一体**を実現します。

#### その他のスキル

タスクに応じて以下のスキルも活用:
- **pwa-patterns** - PWA実装時（Service Worker、Web Push、オフライン対応）
- **performance-patterns** - パフォーマンス最適化時（Core Web Vitals、バンドル最適化）
- **security-patterns** - セキュリティ実装・レビュー時（OWASP対策、認証）
- **testing-patterns** - テスト作成時（E2E、ユニット、モック戦略）

### ブラウザでの動作確認

**フロントエンドの実装が一段落したら、Playwright MCPを利用して実装を実際のブラウザで確認すること**。

確認すべき項目:
- ✅ レイアウトが正しく表示されているか
- ✅ Swan Design Systemのカラー・スタイルが適用されているか
- ✅ レスポンシブデザインが機能しているか（モバイル・タブレット・デスクトップ）
- ✅ インタラクション（クリック、ホバー、フォーカス）が正しく動作するか
- ✅ アニメーションが適切に表示されるか
- ✅ タッチターゲットが44px以上あるか
- ✅ ダークモード対応が正しく機能するか

Playwright MCPの活用方法:
```bash
1. 開発サーバーを起動（npm run dev）
2. Playwright MCPでブラウザを開く
3. 実装したページ・コンポーネントに遷移
4. スナップショット・スクリーンショットで確認
5. 問題があれば修正 → 再確認
```

### 実行例

```bash
# フロントエンドコンポーネント作成時
1. frontend-design, swan-design-system, react-best-practices スキルを読み込む
2. component-builder サブエージェントを起動
3. 実装 → レビュー → Playwright MCPでブラウザ確認 → 完成

# PWA機能実装時
1. pwa-patterns, swan-design-system スキルを読み込む
2. pwa-optimizer サブエージェントを起動
3. 実装 → テスト → Playwright MCPでブラウザ確認 → 完成

# セキュリティレビュー時
1. security-patterns スキルを読み込む
2. security-reviewer サブエージェントを起動（読み取り専用）
3. レビューレポート生成
```

## テスト戦略

- **ユニットテスト**: コアビジネスロジック（utils、計算関数）
- **統合テスト**: Firebase操作、APIルート
- **E2Eテスト**: Playwrightでクリティカルフロー（オンボーディング、記録、SOS）
- **パフォーマンス**: Core Web Vitals目標値（LCP < 2.5秒、FID < 100ms、CLS < 0.1）

## コマンド

package.json作成後、標準的なNext.jsコマンドを使用:

```bash
# 開発
npm run dev          # 開発サーバー起動
npm run build        # 本番ビルド
npm run start        # 本番サーバー起動

# テスト（設定後）
npm run test         # ユニットテスト実行
npm run test:e2e     # Playwrightテスト実行
npm run lint         # ESLintチェック
```

## 専用エージェント

`.claude/agents/`に専用エージェントを用意:
- `component-builder.md` - React/TypeScriptコンポーネント作成
- `pwa-optimizer.md` - PWA機能最適化
- `security-reviewer.md` - セキュリティレビュー（読み取り専用）
- `playwright-tester.md` - E2Eテスト作成
- `performance-tester.md` - パフォーマンステスト

## 言語とローカライゼーション

- **主要言語**: 日本語
- **UIテキスト**: 日本語必須
- **コードコメント**: 英語可
- **技術ドキュメント**: 英語可
- **ユーザー向けメッセージ**: 励まし、判断しないトーンを使用

## デザインパターン

### コンポーネント構成
- TypeScriptによる関数型コンポーネント
- 複合コンポーネントパターン（例: Card, CardHeader, CardContent）
- class-variance-authorityでTailwindユーティリティクラスのバリアント管理

### 状態管理
- **グローバル状態**: Zustandストア（user、records、settings）
- **サーバー状態**: Firebase操作をラップするReactフック
- **ローカル状態**: コンポーネント固有の状態にuseState

### APIルート
- Next.js 14 Route Handlers（app/api/*/route.ts）
- 認証検証用のミドルウェア実装
- 一貫したエラーレスポンス形式

### PWAベストプラクティス
- Service WorkerはNext-PWAで管理
- 静的アセットはcache-first、API呼び出しはnetwork-first
- IndexedDBでオフラインキュー、再接続時に同期

## 開発時の注意点

### コンポーネント作成時
- Swan Design Systemのカラーとスタイルを厳守
- タッチターゲットは最小44x44px
- iOSセーフエリアに対応（env(safe-area-inset-*)）
- ダークモード対応

### 通知実装時
- iOS Safari 16.4+の制約を理解
- ユーザーに通知許可とホーム画面追加を適切に誘導
- プライバシーを考慮した通知内容

### AI機能実装時
- Gemini APIのレート制限を考慮
- フォールバックメッセージを用意
- ユーザーコンテキストを適切にプロンプトに含める

### オフライン対応実装時
- IndexedDB操作は非同期で行う
- 同期キューの実装（create/update/deleteを管理）
- オンライン復帰時の衝突解決戦略
