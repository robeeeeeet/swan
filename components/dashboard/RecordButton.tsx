'use client';

import { memo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { RecordType } from '@/types';

/**
 * Record button variants using class-variance-authority
 * Following Swan Design System UX principles
 */
const recordButtonVariants = cva(
  // Base styles - large touch target, smooth animations
  'relative flex flex-col items-center justify-center min-h-[120px] w-full px-6 py-6 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-offset-2 shadow-lg active:scale-95 hover:shadow-xl',
  {
    variants: {
      recordType: {
        // Neutral: Non-judgmental gray for smoked records
        smoked: 'bg-neutral-500 hover:bg-neutral-600 active:bg-neutral-700 text-white focus:ring-neutral-500/50',

        // SOS: Gradient orange for craving (warmth & urgency)
        craved: 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white focus:ring-orange-500/50 hover:shadow-orange-200/50',

        // Success: Gradient green for resistance (celebration)
        resisted: 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white focus:ring-green-500/50 hover:shadow-green-200/50',
      },
    },
  }
);

export interface RecordButtonProps extends VariantProps<typeof recordButtonVariants> {
  type: RecordType;
  count: number;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * Record button component for dashboard
 * Three types: smoked (neutral), craved (triggers SOS), resisted (success)
 *
 * Features:
 * - Type-safe variants using CVA
 * - 120px minimum height for easy touch
 * - Visual feedback with scale and shadow
 * - Count badge for tracking
 * - Emoji icons for quick recognition
 * - ARIA labels for accessibility
 * - Memoized for performance
 *
 * UX Principles:
 * - Neutral gray for smoking (non-judgmental)
 * - Warm orange for craving (SOS trigger)
 * - Celebratory green for resistance (success)
 */
function RecordButtonComponent({
  type,
  count,
  onClick,
  disabled = false,
}: RecordButtonProps) {
  const configs = {
    smoked: {
      label: '吸った',
      emoji: '🚬',
      description: '喫煙を記録',
    },
    craved: {
      label: '吸いたい',
      emoji: '😫',
      description: 'SOS機能を開く',
    },
    resisted: {
      label: '我慢できた',
      emoji: '💪',
      description: '成功を記録',
    },
  };

  const config = configs[type];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={recordButtonVariants({ recordType: type })}
      aria-label={`${config.description} (今日: ${count}回)`}
    >
      {/* Emoji with hover animation */}
      <span
        className="text-5xl mb-2 transition-transform duration-200 group-hover:scale-110"
        aria-hidden="true"
      >
        {config.emoji}
      </span>

      {/* Label */}
      <span className="text-xl font-bold mb-1">{config.label}</span>

      {/* Count badge with animation */}
      {count > 0 && (
        <span className="absolute top-3 right-3 flex items-center justify-center min-w-[32px] h-8 px-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold tabular-nums animate-in zoom-in-50 fade-in duration-200">
          {count}
        </span>
      )}

      {/* Description */}
      <span className="text-sm opacity-90">{config.description}</span>

      {/* Touch ripple effect indicator (visual only) */}
      <span className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-10 bg-white transition-opacity duration-200 pointer-events-none" />
    </button>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(RecordButtonComponent);
