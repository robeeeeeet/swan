import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Button variants using class-variance-authority for type-safe styling
 * Following Swan Design System color palette and UX principles
 */
const buttonVariants = cva(
  // Base styles - common to all buttons
  'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
  {
    variants: {
      variant: {
        // Primary: Teal - main actions, growth & health
        primary: 'bg-teal-500 text-white hover:bg-teal-600 active:bg-teal-700 focus:ring-teal-500/50 shadow-sm hover:shadow-md dark:bg-teal-600 dark:hover:bg-teal-700',

        // Secondary: Orange - secondary actions, warmth & encouragement
        secondary: 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 focus:ring-orange-500/50 shadow-sm hover:shadow-md dark:bg-orange-600 dark:hover:bg-orange-700',

        // Success: Green - positive feedback (resisted cravings)
        success: 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700 focus:ring-green-500/50 shadow-sm hover:shadow-md dark:bg-green-600 dark:hover:bg-green-700',

        // Warning: Amber - caution/goal exceeded
        warning: 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 focus:ring-amber-500/50 shadow-sm hover:shadow-md dark:bg-amber-600 dark:hover:bg-amber-700',

        // Error: Red - errors, destructive actions
        error: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-500/50 shadow-sm hover:shadow-md dark:bg-red-600 dark:hover:bg-red-700',

        // Neutral: Gray - non-judgmental (smoked record)
        neutral: 'bg-neutral-500 text-white hover:bg-neutral-600 active:bg-neutral-700 focus:ring-neutral-500/50 shadow-sm hover:shadow-md dark:bg-neutral-600 dark:hover:bg-neutral-700',

        // Ghost: Transparent - subtle actions
        ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 focus:ring-neutral-400/50 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:active:bg-neutral-700',

        // Outline: Bordered style for secondary CTAs
        outline: 'border-2 border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 focus:ring-neutral-400/50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800',
      },
      size: {
        sm: 'px-4 py-2.5 text-sm min-h-[44px]',
        md: 'px-6 py-3 text-base min-h-[44px]',
        lg: 'px-8 py-4 text-lg min-h-[52px]',
        xl: 'px-10 py-5 text-xl min-h-[60px]',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  asChild?: boolean;
}

/**
 * Button component following Swan Design System
 *
 * Features:
 * - Type-safe variants using class-variance-authority
 * - Minimum 44x44px touch target for accessibility
 * - Loading state with spinner
 * - Focus ring for keyboard navigation
 * - Active state feedback (scale down)
 * - Dark mode support
 *
 * Variants:
 * - primary: Teal - main actions
 * - secondary: Orange - secondary actions
 * - success: Green - positive feedback (resisted)
 * - warning: Amber - caution/goal exceeded
 * - error: Red - errors, destructive actions
 * - neutral: Gray - non-judgmental (smoked)
 * - ghost: Transparent - subtle actions
 * - outline: Bordered - secondary CTAs
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant,
      size,
      fullWidth,
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={buttonVariants({ variant, size, fullWidth, className })}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
export { buttonVariants };
