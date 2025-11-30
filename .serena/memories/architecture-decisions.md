# Swan PWA アーキテクチャ設計決定事項

## ディレクトリ構造の決定

### src/ディレクトリを使用しない理由
Next.js 16では、`src/`ディレクトリはオプションであり、プロジェクトルートに直接`app/`を配置する方法が推奨されています。Swanプロジェクトでは以下の理由でsrc/なしを採用：

1. **Next.js 16の推奨**: 公式ドキュメントでは`src/`なしがデフォルト
2. **シンプルさ**: ディレクトリ階層が1段階浅くなる
3. **モノレポ対応**: 将来的にmonorepo化する場合、ルートレベルの構造がクリア

### lib/db → lib/indexeddb への変更
- **理由**: `db`は曖昧（Database全般を指す可能性）
- **明確性**: `indexeddb`とすることで、オフライン用IndexedDBであることが明確
- **一貫性**: `lib/firebase/`と同レベルの粒度

## Tailwind CSS 4 設計

### @theme inline の活用
Tailwind CSS 4では、`@theme inline`ディレクティブでCSSカスタムプロパティとしてデザイントークンを定義できます。

```css
@theme inline {
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
  /* ... */
}
```

**利点:**
1. CSSカスタムプロパティとTailwindクラスの両方で使用可能
2. JavaScriptから`getComputedStyle()`で動的にアクセス可能
3. ダークモード対応が容易（メディアクエリでカスタムプロパティを上書き）

### iOS Safe Area対応
```css
--safe-area-inset-top: env(safe-area-inset-top);
```

iOSデバイス（特にノッチ付き）で適切にレイアウトするため、グローバルCSSでSafe Area Insetを定義。

## Next.js 16 Metadata API

### viewport と themeColor の分離
Next.js 16では、`viewport`と`themeColor`を`Metadata`から`Viewport`エクスポートに分離する必要があります。

**app/layout.tsx:**
```typescript
export const metadata: Metadata = { /* ... */ };
export const viewport: Viewport = {
  themeColor: "#14b8a6",
  /* ... */
};
```

**理由:**
- メタデータの責務分離
- 型安全性の向上
- 将来的な拡張性

## PWA設定

### @ducanh2912/next-pwa の選択理由
1. **Next.js 16対応**: 公式next-pwaよりも新しいバージョンに対応
2. **Turbopack互換**: Next.js 16のTurbopackと互換性がある
3. **Workbox統合**: Service Workerの管理が簡単

### PWA設定のポイント
```typescript
export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  fallbacks: {
    document: "/offline",
  },
})(nextConfig);
```

- **開発環境では無効化**: ホットリロードを妨げないため
- **オフラインフォールバック**: `/offline`ページを用意（Phase 2で実装予定）

## デザインシステムの実装

### カラーシステム
Swanのカラーパレットは心理的効果を考慮：

1. **Primary (Teal)**: 成長と健康のイメージ
2. **Secondary (Orange)**: 温かみと励まし
3. **Neutral (Gray)**: 判断しない記録（喫煙時）
4. **Success (Green)**: 我慢成功を祝福
5. **Warning (Amber)**: 目標超過の警告

### アクセシビリティ
```css
button, a, input, select, textarea {
  min-height: 44px;
  min-width: 44px;
}
```

- **最小タッチターゲット**: WCAG 2.1 Level AAに準拠
- **キーボードナビゲーション**: `:focus-visible`でフォーカスリング表示

### タイポグラフィ
- **フォント**: Noto Sans JP（日本語最適化）
- **数字**: Tabular figures有効（`font-feature-settings: "tnum" 1`）
  - 金額や本数の表示で桁が揃う

## Firebase 統合

### 認証戦略（✅ 実装済み - lib/firebase/auth.ts）
1. **匿名認証**: 初回アクセス時に自動で匿名ユーザー作成
2. **アップグレード**: 後からGoogle認証に切り替え可能（linkAnonymousWithGoogle）
3. **データ継続**: 匿名→認証済みへの移行時にデータを保持

### Firestore データ設計（⏳ 未実装 - スキーマ確定）
```
users/{userId}/
  ├── profile
  ├── settings
  ├── pushSubscriptions/{subscriptionId}
  ├── smokeRecords/{recordId}
  ├── copingRecords/{recordId}
  └── dailyStats/{YYYY-MM-DD}
```

### オフライン対応（⏳ 未実装 - lib/indexeddbディレクトリ準備済み）
1. **Firestore Persistence**: ローカルキャッシュ有効化
2. **IndexedDB Queue**: オフライン時の変更を保存
3. **同期処理**: オンライン復帰時に自動同期

## AI統合（Gemini 2.0 Flash）

### API呼び出し戦略
1. **サーバーサイド**: `/api/ai/*`でGemini APIを呼び出し
2. **レート制限**: エンドポイントごとに適切なレート制限
3. **フォールバック**: API失敗時は事前定義メッセージを使用

### プロンプト設計
ユーザーコンテキストに含める情報：
- 喫煙履歴（直近7日間）
- タグの頻度分布
- 目標達成状況
- 時間帯パターン

## Web Push通知

### iOS対応の要件
- iOS Safari 16.4+必須
- **ホーム画面に追加**が必須（iOSの制約）
- ユーザーガイダンスが重要（E-02: iOSインストールガイド）

### プライバシー配慮
通知内容は2段階：
1. **汎用メッセージ**: 「Swanからのお知らせ」（デフォルト）
2. **詳細メッセージ**: 設定でオプトイン時のみ

## パフォーマンス最適化

### Core Web Vitals 目標
- LCP (Largest Contentful Paint): < 2.5秒
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### 最適化戦略
1. **画像最適化**: Next.js Image コンポーネント活用
2. **フォント最適化**: `display: swap`でFOIT回避
3. **コード分割**: 動的インポートで初期バンドルサイズ削減
4. **Service Worker キャッシュ**: 静的アセットを積極的にキャッシュ

## セキュリティ考慮事項

### 環境変数管理
- **クライアント公開**: `NEXT_PUBLIC_*`プレフィックス
- **サーバー限定**: API鍵（Gemini, Cron Secret）
- **Git除外**: `.env.local`は.gitignoreに含める

### CSP (Content Security Policy)
Phase 4で実装予定：
- インラインスクリプト制限
- 外部ドメイン制限
- XSS対策

### データ保護
- **最小限の収集**: 名前やメールは任意
- **暗号化通信**: HTTPS必須
- **匿名化**: 統計データは個人特定不可能に
