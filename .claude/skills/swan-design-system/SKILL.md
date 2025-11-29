---
name: swan-design-system
description: Swanアプリ専用デザインシステム。カラーパレット、タイポグラフィ、スペーシング、コンポーネントカタログ、禁煙アプリ特有のUXパターン。UIコンポーネント作成・デザイン一貫性確保時に使用。
allowed-tools: Read, Grep, Glob, Edit, Write
---

# Swan デザインシステム

禁煙・減煙PWAアプリ「Swan」の統一されたデザイン言語とコンポーネントライブラリです。

## 目次

1. [デザイン哲学](#1-デザイン哲学)
2. [カラーシステム](#2-カラーシステム)
3. [タイポグラフィ](#3-タイポグラフィ)
4. [スペーシング・レイアウト](#4-スペーシングレイアウト)
5. [コンポーネントカタログ](#5-コンポーネントカタログ)
6. [アイコン・イラスト](#6-アイコンイラスト)
7. [モーション・アニメーション](#7-モーションアニメーション)
8. [UXパターン（禁煙アプリ特有）](#8-uxパターン禁煙アプリ特有)

---

## 1. デザイン哲学

### ブランドパーソナリティ

Swanは**優しく寄り添う、頼れるパートナー**です。

| 属性 | 説明 | デザインでの表現 |
|------|------|----------------|
| **温かみ** | ユーザーの困難に共感 | 柔らかい色調、丸みのある形状 |
| **力強さ** | 目標達成をサポート | コントラストのある色、明確なCTA |
| **シンプル** | 毎日使えるストレスフリー | 直感的なUI、最小限の要素 |
| **信頼** | データとプライバシーを守る | 安定感のあるレイアウト |
| **祝福** | 成功を一緒に喜ぶ | 明るいアクセント、アニメーション |

### デザイン原則

1. **モバイルファースト**: 外出先で片手操作を想定
2. **アクションファースト**: 最重要ボタンを即座にアクセス可能に
3. **感情に寄り添う**: 状況に応じた適切なトーン
4. **データ可視化**: 進捗が一目でわかる
5. **プライバシー重視**: 他人に見られても恥ずかしくないUI

---

## 2. カラーシステム

### プライマリパレット

```css
:root {
  /* プライマリ: 落ち着いたティール（成長・健康を象徴） */
  --color-primary-50: #f0fdfa;
  --color-primary-100: #ccfbf1;
  --color-primary-200: #99f6e4;
  --color-primary-300: #5eead4;
  --color-primary-400: #2dd4bf;
  --color-primary-500: #14b8a6;  /* メイン */
  --color-primary-600: #0d9488;
  --color-primary-700: #0f766e;
  --color-primary-800: #115e59;
  --color-primary-900: #134e4a;

  /* セカンダリ: 温かみのあるオレンジ（励まし・エネルギー） */
  --color-secondary-50: #fff7ed;
  --color-secondary-100: #ffedd5;
  --color-secondary-200: #fed7aa;
  --color-secondary-300: #fdba74;
  --color-secondary-400: #fb923c;
  --color-secondary-500: #f97316;  /* メイン */
  --color-secondary-600: #ea580c;
  --color-secondary-700: #c2410c;
  --color-secondary-800: #9a3412;
  --color-secondary-900: #7c2d12;
}
```

### セマンティックカラー

```css
:root {
  /* 成功: 我慢できた、目標達成 */
  --color-success-light: #dcfce7;
  --color-success-main: #22c55e;
  --color-success-dark: #15803d;

  /* 警告: 目標超過、魔の時間帯 */
  --color-warning-light: #fef3c7;
  --color-warning-main: #f59e0b;
  --color-warning-dark: #b45309;

  /* エラー: 通信失敗、入力エラー */
  --color-error-light: #fee2e2;
  --color-error-main: #ef4444;
  --color-error-dark: #b91c1c;

  /* ニュートラル: 吸った記録（判断しない） */
  --color-neutral-light: #f3f4f6;
  --color-neutral-main: #6b7280;
  --color-neutral-dark: #374151;
}
```

### アクションカラー

```css
:root {
  /* 吸いたいボタン: 緊急性 + 温かみ */
  --color-craving: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  --color-craving-text: #ffffff;

  /* 吸ったボタン: ニュートラル（判断しない） */
  --color-smoked: #6b7280;
  --color-smoked-text: #ffffff;

  /* 我慢できたボタン: 祝福 */
  --color-resisted: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  --color-resisted-text: #ffffff;
}
```

### ダークモード

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #0f172a;
    --color-surface: #1e293b;
    --color-surface-elevated: #334155;
    --color-text-primary: #f8fafc;
    --color-text-secondary: #94a3b8;
    --color-text-muted: #64748b;
    --color-border: #334155;
  }
}

/* ライトモード */
:root {
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-surface-elevated: #ffffff;
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted: #94a3b8;
  --color-border: #e2e8f0;
}
```

### Tailwind 設定

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        swan: {
          primary: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
            800: '#115e59',
            900: '#134e4a',
          },
          secondary: {
            // オレンジ系
          },
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
          neutral: '#6b7280',
        },
      },
    },
  },
};
```

---

## 3. タイポグラフィ

### フォントファミリー

```css
:root {
  /* 見出し: 特徴的で温かみのあるフォント */
  --font-heading: 'Noto Sans JP', 'Hiragino Sans', sans-serif;

  /* 本文: 可読性重視 */
  --font-body: 'Noto Sans JP', 'Hiragino Sans', sans-serif;

  /* 数字: タブular figures で揃える */
  --font-number: 'Noto Sans JP', 'Roboto Mono', monospace;
}
```

### フォントサイズスケール

```css
:root {
  --text-xs: 0.75rem;    /* 12px - キャプション */
  --text-sm: 0.875rem;   /* 14px - 補足テキスト */
  --text-base: 1rem;     /* 16px - 本文 */
  --text-lg: 1.125rem;   /* 18px - 強調本文 */
  --text-xl: 1.25rem;    /* 20px - 小見出し */
  --text-2xl: 1.5rem;    /* 24px - セクション見出し */
  --text-3xl: 1.875rem;  /* 30px - ページ見出し */
  --text-4xl: 2.25rem;   /* 36px - ヒーロー */
  --text-5xl: 3rem;      /* 48px - 大きな数字 */
  --text-6xl: 3.75rem;   /* 60px - カウンター */
}
```

### テキストスタイル

```tsx
// components/Typography.tsx

// 大きなカウンター数字
export const CounterText = ({ children }: { children: React.ReactNode }) => (
  <span className="text-6xl font-bold tabular-nums tracking-tight text-swan-primary-600">
    {children}
  </span>
);

// ページタイトル
export const PageTitle = ({ children }: { children: React.ReactNode }) => (
  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
    {children}
  </h1>
);

// セクションタイトル
export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
    {children}
  </h2>
);

// 本文
export const BodyText = ({ children }: { children: React.ReactNode }) => (
  <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
    {children}
  </p>
);

// キャプション
export const Caption = ({ children }: { children: React.ReactNode }) => (
  <span className="text-sm text-gray-500 dark:text-gray-400">
    {children}
  </span>
);

// 励ましメッセージ
export const EncouragementText = ({ children }: { children: React.ReactNode }) => (
  <p className="text-lg font-medium text-swan-primary-600 dark:text-swan-primary-400">
    {children}
  </p>
);
```

---

## 4. スペーシング・レイアウト

### スペーシングスケール

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
}
```

### レイアウトパターン

```tsx
// ダッシュボードレイアウト
export const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
    {/* ヘッダー */}
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
      <div className="px-4 py-3 max-w-lg mx-auto">
        {/* ヘッダーコンテンツ */}
      </div>
    </header>

    {/* メインコンテンツ */}
    <main className="px-4 py-6 max-w-lg mx-auto pb-24">
      {children}
    </main>

    {/* フローティングアクションエリア */}
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white dark:from-slate-900 dark:via-slate-900">
      <div className="max-w-lg mx-auto">
        {/* アクションボタン */}
      </div>
    </div>
  </div>
);
```

### タッチターゲットサイズ

```tsx
// 最小44x44pxを確保
const TouchTarget = ({ children, ...props }: ButtonProps) => (
  <button
    className="min-h-[44px] min-w-[44px] flex items-center justify-center"
    {...props}
  >
    {children}
  </button>
);
```

### セーフエリア対応

```css
/* iOSノッチ・ホームインジケーター対応 */
.safe-area-top {
  padding-top: max(1rem, env(safe-area-inset-top));
}

.safe-area-bottom {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}

.safe-area-x {
  padding-left: max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
}
```

---

## 5. コンポーネントカタログ

### ボタン

```tsx
// components/Button.tsx
import { FC, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // 基本スタイル
  'inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-xl min-h-[44px] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-swan-primary-500 text-white hover:bg-swan-primary-600 active:bg-swan-primary-700 focus:ring-swan-primary-500',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 focus:ring-gray-500 dark:bg-slate-700 dark:text-white',
        craving: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 active:scale-95 focus:ring-orange-500',
        smoked: 'bg-gray-500 text-white hover:bg-gray-600 active:bg-gray-700 focus:ring-gray-500',
        resisted: 'bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 active:scale-95 focus:ring-green-500',
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800',
        danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-500',
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-6 py-4 text-lg',
        xl: 'px-8 py-5 text-xl',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: FC<ButtonProps> = ({
  children,
  variant,
  size,
  fullWidth,
  onClick,
  disabled,
  ariaLabel,
  type = 'button',
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    className={buttonVariants({ variant, size, fullWidth })}
  >
    {children}
  </button>
);
```

### カード

```tsx
// components/Card.tsx
import { FC, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => (
  <div
    className={`
      bg-white dark:bg-slate-800
      rounded-2xl
      shadow-sm
      border border-gray-100 dark:border-slate-700
      ${hoverable ? 'hover:shadow-md hover:border-gray-200 dark:hover:border-slate-600 transition-all cursor-pointer' : ''}
      ${className}
    `}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
  >
    {children}
  </div>
);

export const CardHeader: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
    {children}
  </div>
);

export const CardContent: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`px-4 py-4 ${className}`}>
    {children}
  </div>
);
```

### カウンターディスプレイ

```tsx
// components/CounterDisplay.tsx
import { FC } from 'react';

interface CounterDisplayProps {
  count: number;
  label: string;
  goal?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const CounterDisplay: FC<CounterDisplayProps> = ({
  count,
  label,
  goal,
  variant = 'default',
}) => {
  const isOverGoal = goal !== undefined && count > goal;

  const variantStyles = {
    default: 'text-swan-primary-600 dark:text-swan-primary-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-red-600 dark:text-red-400',
  };

  return (
    <div className="text-center">
      <div className={`text-6xl font-bold tabular-nums ${variantStyles[variant]}`}>
        {count}
      </div>
      <div className="mt-1 text-gray-500 dark:text-gray-400">
        {label}
        {goal !== undefined && (
          <span className={isOverGoal ? 'text-red-500' : ''}>
            {' '}/ {goal}
          </span>
        )}
      </div>
    </div>
  );
};
```

### プログレスリング

```tsx
// components/ProgressRing.tsx
import { FC } from 'react';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export const ProgressRing: FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* 背景の円 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-slate-700"
        />
        {/* プログレスの円 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-swan-primary-500 transition-all duration-500 ease-out"
        />
      </svg>
      {/* 中央のコンテンツ */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};
```

### モーダル

```tsx
// components/Modal.tsx
import { FC, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export const Modal: FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // Escapeキーで閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* モーダルコンテンツ */}
      <div
        className="relative bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-auto animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* ハンドル（モバイル） */}
        <div className="sm:hidden flex justify-center pt-3">
          <div className="w-10 h-1 bg-gray-300 dark:bg-slate-600 rounded-full" />
        </div>

        {/* ヘッダー */}
        {title && (
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
            <h2 id="modal-title" className="text-xl font-semibold">
              {title}
            </h2>
          </div>
        )}

        {/* コンテンツ */}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};
```

### タグセレクター

```tsx
// components/TagSelector.tsx
import { FC } from 'react';

interface Tag {
  id: string;
  label: string;
  emoji: string;
}

const SMOKING_TAGS: Tag[] = [
  { id: 'morning', label: '起床後', emoji: '🌅' },
  { id: 'after-meal', label: '食後', emoji: '🍽️' },
  { id: 'work-stress', label: '仕事ストレス', emoji: '💼' },
  { id: 'break', label: '休憩中', emoji: '☕' },
  { id: 'drinking', label: '飲酒中', emoji: '🍺' },
  { id: 'boredom', label: '暇つぶし', emoji: '😐' },
  { id: 'social', label: '付き合い', emoji: '👥' },
  { id: 'habit', label: '習慣', emoji: '🔄' },
];

interface TagSelectorProps {
  selectedTag?: string;
  onSelect: (tagId: string) => void;
}

export const TagSelector: FC<TagSelectorProps> = ({ selectedTag, onSelect }) => (
  <div className="grid grid-cols-2 gap-3">
    {SMOKING_TAGS.map((tag) => (
      <button
        key={tag.id}
        onClick={() => onSelect(tag.id)}
        className={`
          flex items-center gap-2 p-3 rounded-xl border-2 transition-all
          ${
            selectedTag === tag.id
              ? 'border-swan-primary-500 bg-swan-primary-50 dark:bg-swan-primary-900/20'
              : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
          }
        `}
      >
        <span className="text-2xl">{tag.emoji}</span>
        <span className="text-sm font-medium">{tag.label}</span>
      </button>
    ))}
  </div>
);
```

---

## 6. アイコン・イラスト

### アイコンセット

```tsx
// components/icons/index.tsx

// 喫煙関連
export const SmokeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M2 16h15v3H2v-3zm18.5 0H22v3h-1.5v-3zM18 16h1.5v3H18v-3zm.85-8.27c.62-.61 1-1.45 1-2.38C19.85 3.5 18.35 2 16.5 2v1.5c1.02 0 1.85.83 1.85 1.85S17.52 7.2 16.5 7.2v1.5c2.24 0 4 1.83 4 4.07V15H22v-2.24c0-2.22-1.28-4.14-3.15-5.03z"/>
  </svg>
);

// 成功・達成
export const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
  </svg>
);

// 通知
export const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
  </svg>
);
```

### イラストスタイル

```tsx
// イラストはシンプルで温かみのあるスタイル
// - 線画ベース
// - 丸みのある形状
// - プライマリカラーのアクセント

// 例: 成功時のイラスト
export const SuccessIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-32 h-32">
    {/* 背景円 */}
    <circle cx="100" cy="100" r="80" fill="#dcfce7" />
    {/* チェックマーク */}
    <path
      d="M60 100l30 30 50-60"
      fill="none"
      stroke="#22c55e"
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* 星のエフェクト */}
    <circle cx="50" cy="60" r="4" fill="#fbbf24" />
    <circle cx="150" cy="50" r="3" fill="#fbbf24" />
    <circle cx="160" cy="120" r="5" fill="#fbbf24" />
  </svg>
);
```

---

## 7. モーション・アニメーション

### アニメーション原則

1. **目的を持つ**: 装飾ではなく、意味のあるフィードバック
2. **自然さ**: イージングで滑らかに
3. **控えめ**: 派手すぎず、邪魔にならない
4. **アクセシビリティ**: reduced-motionを尊重

### CSS アニメーション定義

```css
/* globals.css */

/* フェードイン */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* スライドアップ（モーダル用） */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* スケールアップ（成功アニメーション） */
@keyframes scale-up {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* パルス（注意喚起） */
@keyframes pulse-gentle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* 紙吹雪 */
@keyframes confetti {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

/* Tailwindユーティリティ */
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

.animate-scale-up {
  animation: scale-up 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.animate-pulse-gentle {
  animation: pulse-gentle 2s ease-in-out infinite;
}

/* reduced-motion 対応 */
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 祝福アニメーション

```tsx
// components/Celebration.tsx
import { FC, useEffect, useState } from 'react';

interface CelebrationProps {
  show: boolean;
  message: string;
  onComplete?: () => void;
}

export const Celebration: FC<CelebrationProps> = ({ show, message, onComplete }) => {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number }>>([]);

  useEffect(() => {
    if (show) {
      // 紙吹雪を生成
      const pieces = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
      }));
      setConfetti(pieces);

      // 3秒後に完了
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* 紙吹雪 */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 w-3 h-3 rounded-full"
          style={{
            left: `${piece.left}%`,
            backgroundColor: ['#22c55e', '#fbbf24', '#14b8a6', '#f97316'][piece.id % 4],
            animation: `confetti 2s ease-out ${piece.delay}s forwards`,
          }}
        />
      ))}

      {/* メッセージ */}
      <div className="text-center animate-scale-up">
        <div className="text-6xl mb-4">🎉</div>
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
          {message}
        </div>
      </div>
    </div>
  );
};
```

---

## 8. UXパターン（禁煙アプリ特有）

### 感情に応じたUI

```tsx
// 状況に応じたメッセージとトーン

// 吸いたい時（共感 + サポート）
const CravingUI = () => (
  <div className="text-center p-6 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
    <div className="text-4xl mb-4">💪</div>
    <h2 className="text-xl font-bold text-orange-800 dark:text-orange-200 mb-2">
      今が頑張りどころです
    </h2>
    <p className="text-orange-700 dark:text-orange-300 mb-6">
      この衝動は3分で収まります。一緒に乗り越えましょう。
    </p>
    <Button variant="craving" fullWidth>
      対処法を見る
    </Button>
  </div>
);

// 吸った時（判断せず、記録）
const SmokedUI = () => (
  <div className="text-center p-6">
    <div className="text-4xl mb-4">📝</div>
    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
      記録しました
    </h2>
    <p className="text-gray-600 dark:text-gray-400 mb-6">
      次に向けて、状況を振り返ってみましょう。
    </p>
    <TagSelector onSelect={handleTagSelect} />
  </div>
);

// 我慢できた時（祝福）
const ResistedUI = () => (
  <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl">
    <Celebration show={true} message="素晴らしい！" />
    <div className="text-4xl mb-4">🏆</div>
    <h2 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
      おめでとうございます！
    </h2>
    <p className="text-green-700 dark:text-green-300">
      この調子で続けましょう。あなたは強い！
    </p>
  </div>
);
```

### 励ましメッセージシステム

```typescript
// lib/encouragement.ts

interface EncouragementMessage {
  title: string;
  body: string;
  emoji: string;
}

// 状況に応じたメッセージ
export const ENCOURAGEMENT_MESSAGES: Record<string, EncouragementMessage[]> = {
  // 朝の挨拶
  morning: [
    { title: 'おはようございます', body: '今日も一日、応援しています', emoji: '🌅' },
    { title: '新しい一日の始まり', body: '昨日よりも強い自分になれます', emoji: '✨' },
  ],

  // 我慢成功時
  resisted: [
    { title: '素晴らしい！', body: 'あなたの意志の強さに拍手です', emoji: '👏' },
    { title: 'よく頑張りました', body: 'この調子で続けましょう', emoji: '💪' },
    { title: '勝利です！', body: '自分を誇りに思ってください', emoji: '🏆' },
  ],

  // 魔の時間帯
  craving: [
    { title: '大丈夫', body: 'この衝動は必ず過ぎ去ります', emoji: '🤗' },
    { title: '深呼吸しましょう', body: '3分待てば楽になります', emoji: '🌬️' },
  ],

  // 目標達成
  milestone: [
    { title: '目標達成！', body: 'あなたの努力が実を結びました', emoji: '🎉' },
    { title: '素晴らしい成果', body: '自分にご褒美をあげましょう', emoji: '🎁' },
  ],
};

export function getRandomMessage(type: keyof typeof ENCOURAGEMENT_MESSAGES): EncouragementMessage {
  const messages = ENCOURAGEMENT_MESSAGES[type];
  return messages[Math.floor(Math.random() * messages.length)];
}
```

### プライバシー配慮UI

```tsx
// 通知のプレビュー設定
interface NotificationPreview {
  showCount: boolean;
  showMessage: boolean;
  genericTitle: boolean;
}

const PrivacySettings = () => {
  const [preview, setPreview] = useState<NotificationPreview>({
    showCount: false,  // デフォルトは非表示
    showMessage: false,
    genericTitle: true, // "Swan"のみ表示
  });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">通知のプライバシー</h3>
      <p className="text-sm text-gray-500">
        ロック画面に表示される内容を選択できます
      </p>

      <label className="flex items-center justify-between">
        <span>詳細メッセージを表示</span>
        <Switch
          checked={preview.showMessage}
          onChange={(v) => setPreview({ ...preview, showMessage: v })}
        />
      </label>

      {/* プレビュー */}
      <div className="bg-gray-100 dark:bg-slate-800 rounded-xl p-4">
        <div className="text-sm text-gray-500 mb-2">プレビュー:</div>
        <div className="bg-white dark:bg-slate-700 rounded-lg p-3 shadow-sm">
          <div className="font-medium">
            {preview.genericTitle ? 'Swan' : '禁煙サポート'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {preview.showMessage ? '素晴らしい！我慢できましたね' : '新しい更新があります'}
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## デザインチェックリスト

### ブランド一貫性
- [ ] カラーパレットに準拠
- [ ] タイポグラフィスケールに準拠
- [ ] スペーシングスケールに準拠
- [ ] トーン&ボイスが一貫している

### アクセシビリティ
- [ ] 色のコントラスト比4.5:1以上
- [ ] タッチターゲット44px以上
- [ ] キーボード操作可能
- [ ] スクリーンリーダー対応

### モバイル最適化
- [ ] 片手操作を考慮
- [ ] 重要なアクションが thumb zone に
- [ ] セーフエリア対応
- [ ] オフライン状態の表示

### 感情デザイン
- [ ] 励ましのトーン
- [ ] 判断しない中立的な記録UI
- [ ] 成功を祝福するアニメーション
- [ ] プライバシーへの配慮

---

**バージョン履歴**
- v1.0.0 (2025-11-30): Swan PWAプロジェクト用に初版作成
