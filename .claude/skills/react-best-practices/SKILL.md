---
name: react-best-practices
description: Reactコンポーネントをベストプラクティスに従って作成・レビュー。Next.js、TypeScript、hooks、PWA最適化、モバイルパフォーマンスを考慮。新規コンポーネント作成、リファクタリング、コードレビュー時に使用。
allowed-tools: Read, Grep, Glob, Edit
---

# React ベストプラクティス（Swan PWA プロジェクト用）

このスキルは、禁煙・減煙PWAアプリ「Swan」のReactコンポーネント開発において、品質・パフォーマンス・保守性を確保するためのガイドラインです。

## 実行手順

新規コンポーネント作成やレビュー時、以下の順序でチェックします：

### 1. TypeScript & 型安全性
- すべてのpropsに型定義（interfaceまたはtype）を付ける
- `any` の使用を避け、適切な型を指定
- イベントハンドラーの型を明示（例: `React.MouseEvent<HTMLButtonElement>`）
- オプショナルpropsには `?` を使用し、デフォルト値を設定

### 2. コンポーネント設計
- **関数コンポーネント**を使用（クラスコンポーネント禁止）
- **Single Responsibility**: 1コンポーネント = 1責務
- 50行以上のコンポーネントは分割を検討
- propsは5つ以下が理想（多い場合はオブジェクトにまとめる）

### 3. React Hooks の適切な使用
- **useState**: 初期値は関数形式で遅延評価が可能
- **useEffect**: 依存配列を必ず指定（linterの警告を無視しない）
- **useMemo/useCallback**: 重い計算・子コンポーネントへの関数渡しで使用
- **カスタムフック**: ロジックの再利用にはカスタムフックを作成

### 4. PWA & モバイル最適化
- **タッチ操作**: ボタンは最低44px × 44px（iOS/Android推奨サイズ）
- **遅延ロード**: 初期表示に不要なコンポーネントは `React.lazy()` + `Suspense`
- **画像最適化**: Next.jsの `<Image>` コンポーネントを使用
- **オフライン対応**: ネットワークエラーハンドリングを実装

### 5. アクセシビリティ（a11y）
- **セマンティックHTML**: `<button>`、`<nav>`、`<main>` など適切なタグ使用
- **ARIA属性**: 必要に応じて `aria-label`、`role` を追加
- **キーボード操作**: すべてのインタラクティブ要素がTab/Enterで操作可能
- **フォーカス管理**: モーダルやドロワーで適切にフォーカス制御

### 6. パフォーマンス
- **不要な再レンダリング防止**: `React.memo()` でメモ化
- **状態の最小化**: グローバル状態は本当に必要な時だけ
- **遅延読み込み**: ルートベースのコード分割（Next.jsの自動分割を活用）
- **仮想化**: 長いリスト表示には react-window などを検討

### 7. エラーハンドリング
- **Error Boundary**: 重要なセクションを Error Boundary で囲む
- **非同期エラー**: try-catch または .catch() で適切に処理
- **ユーザーフィードバック**: エラー時は明確なメッセージを表示

## コード例

### ✅ 良い例: 型安全で再利用可能なボタン

```tsx
// components/Button.tsx
import { FC, ReactNode } from 'react';

interface ButtonProps {
  onClick: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  fullWidth?: boolean;
  ariaLabel?: string;
}

export const Button: FC<ButtonProps> = ({
  onClick,
  children,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  ariaLabel,
}) => {
  const baseStyles = 'min-h-[44px] min-w-[44px] rounded-lg font-semibold transition-colors';
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  };
  const widthStyle = fullWidth ? 'w-full' : '';
  const disabledStyle = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyle} ${disabledStyle}`}
    >
      {children}
    </button>
  );
};
```

### ✅ 良い例: カスタムフックでロジック分離

```tsx
// hooks/useSmokeCounter.ts
import { useState, useCallback } from 'react';

interface UseSmokeCounterReturn {
  count: number;
  increment: () => void;
  reset: () => void;
  isOverLimit: boolean;
}

export const useSmokeCounter = (dailyLimit: number): UseSmokeCounterReturn => {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  const reset = useCallback(() => {
    setCount(0);
  }, []);

  const isOverLimit = count >= dailyLimit;

  return { count, increment, reset, isOverLimit };
};

// components/SmokeCounter.tsx
import { FC } from 'react';
import { useSmokeCounter } from '@/hooks/useSmokeCounter';
import { Button } from '@/components/Button';

interface SmokeCounterProps {
  dailyLimit: number;
}

export const SmokeCounter: FC<SmokeCounterProps> = ({ dailyLimit }) => {
  const { count, increment, isOverLimit } = useSmokeCounter(dailyLimit);

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">今日の喫煙本数</h2>
      <p className="text-6xl font-bold mb-6">{count}</p>
      <Button
        onClick={increment}
        variant={isOverLimit ? 'danger' : 'primary'}
        fullWidth
        ariaLabel="喫煙を記録"
      >
        吸った
      </Button>
      {isOverLimit && (
        <p className="mt-4 text-red-600 font-semibold">
          ⚠️ 今日の目標本数を超えています
        </p>
      )}
    </div>
  );
};
```

### ✅ 良い例: Next.js の遅延ロード

```tsx
// app/dashboard/page.tsx
import { FC, Suspense } from 'react';
import dynamic from 'next/dynamic';

// 初期表示に不要な重いコンポーネントは動的インポート
const HistoryChart = dynamic(() => import('@/components/HistoryChart'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded" />,
  ssr: false, // クライアントサイドのみで実行（ブラウザAPIを使う場合）
});

const DashboardPage: FC = () => {
  return (
    <main className="p-4">
      <h1 className="text-3xl font-bold mb-6">ダッシュボード</h1>

      {/* 重要な情報は即座に表示 */}
      <SmokeCounter dailyLimit={10} />

      {/* グラフは遅延ロード */}
      <Suspense fallback={<div>読み込み中...</div>}>
        <HistoryChart />
      </Suspense>
    </main>
  );
};

export default DashboardPage;
```

### ❌ 悪い例: 型定義なし、再レンダリング過多

```tsx
// 型定義がない
export const Button = (props) => {
  return <button onClick={props.onClick}>{props.children}</button>;
};

// 毎回新しい関数を生成（子コンポーネントが不要に再レンダリング）
const ParentComponent = () => {
  const [count, setCount] = useState(0);

  return (
    <ChildComponent
      onSave={() => {  // ❌ 毎回新しい関数が生成される
        console.log(count);
      }}
    />
  );
};

// useEffectの依存配列が不適切
useEffect(() => {
  fetchData();
}, []); // ❌ fetchDataが依存配列にないとlinter警告

// any型の乱用
const handleClick = (event: any) => {  // ❌ any禁止
  event.preventDefault();
};
```

## プロジェクト固有のルール

### Swan PWA アプリ特有の注意点

1. **通知関連コンポーネント**
   - Push通知の許可状態を常にチェック
   - 許可がない場合は適切なUIで誘導
   - Service Workerの登録状態を確認

2. **オフライン対応**
   - ネットワークエラー時のフォールバックUI
   - IndexedDBへのローカル保存を活用
   - 同期待ちデータの表示（アイコンなど）

3. **モバイルファースト**
   - すべてのコンポーネントはモバイル画面で設計
   - タッチ操作を優先（hoverは補助的に）
   - スワイプジェスチャーの活用（削除、詳細表示など）

4. **パフォーマンス優先**
   - 初期ロード時間を最小化（Core Web Vitals重視）
   - 画像は必ずNext.js Image最適化
   - 不要なJavaScriptは遅延ロード

## チェックリスト

コンポーネント作成/レビュー時、以下を確認：

- [ ] TypeScriptの型定義が完全か
- [ ] propsの数は適切か（多すぎないか）
- [ ] useEffectの依存配列は正しいか
- [ ] 不要な再レンダリングは防止されているか
- [ ] エラーハンドリングは適切か
- [ ] アクセシビリティ（a11y）は確保されているか
- [ ] モバイルでのタッチサイズは適切か（44px以上）
- [ ] パフォーマンス最適化（メモ化、遅延ロード）は必要か
- [ ] オフライン動作時のエラーハンドリングはあるか

## 参考リソース

- [React公式ドキュメント](https://react.dev/)
- [Next.js公式ドキュメント](https://nextjs.org/docs)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/)
- [Web.dev PWAガイド](https://web.dev/progressive-web-apps/)
- [WCAG 2.1 アクセシビリティガイドライン](https://www.w3.org/WAI/WCAG21/quickref/)

---

**バージョン履歴**
- v1.0.0 (2025-11-30): Swan PWAプロジェクト用に初版作成
