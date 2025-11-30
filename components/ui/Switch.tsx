'use client';

import { FC } from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
}

/**
 * Switch (トグルスイッチ) コンポーネント
 *
 * アクセシビリティ対応:
 * - キーボード操作（Space/Enterで切り替え）
 * - ARIA属性（role="switch"、aria-checked）
 * - 最小タッチターゲット44px
 */
export const Switch: FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  'aria-label': ariaLabel,
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
        ${checked ? 'bg-teal-500' : 'bg-gray-300 dark:bg-slate-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        min-h-[44px] min-w-[44px] flex items-center justify-center
      `}
    >
      {/* スイッチのトグル部分（視覚的な表現） */}
      <span className="sr-only">{ariaLabel}</span>
      <span
        className={`
          inline-block h-5 w-5 transform rounded-full bg-white shadow-sm
          transition-transform duration-200 ease-in-out
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
        style={{
          // 実際のスイッチ本体は小さいが、タッチターゲットは44pxを確保
          position: 'relative',
          top: '-9px',
        }}
      />
    </button>
  );
};
