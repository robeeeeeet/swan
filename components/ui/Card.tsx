import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Card variants using class-variance-authority for type-safe styling
 * Following Swan Design System with subtle animations
 */
const cardVariants = cva(
  // Base styles - smooth transitions for interactions
  'bg-white dark:bg-neutral-800 rounded-2xl transition-all duration-200',
  {
    variants: {
      variant: {
        // Default: Subtle border, clean appearance
        default: 'border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600',

        // Elevated: Soft shadow, floating effect
        elevated: 'shadow-lg shadow-neutral-200/50 dark:shadow-neutral-900/50 hover:shadow-xl hover:shadow-neutral-200/60 dark:hover:shadow-neutral-900/60',

        // Interactive: Indicates clickable cards
        interactive: 'border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:border-teal-300 hover:shadow-md hover:shadow-teal-100/50 dark:hover:border-teal-700 dark:hover:shadow-teal-900/30 active:scale-[0.99]',

        // Ghost: Minimal styling for nested cards
        ghost: 'bg-transparent border-0',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

/**
 * Card component following Swan Design System
 *
 * Features:
 * - Type-safe variants using class-variance-authority
 * - Smooth hover transitions
 * - Dark mode support
 * - Responsive padding options
 * - Interactive variant for clickable cards
 *
 * Usage:
 * <Card variant="elevated" padding="md">
 *   <CardHeader title="Title" subtitle="Subtitle" />
 *   <CardContent>...</CardContent>
 *   <CardFooter>...</CardFooter>
 * </Card>
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant,
      padding,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cardVariants({ variant, padding, className })}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// ============================================================================
// Card Header
// ============================================================================

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

/**
 * CardHeader component
 *
 * Features:
 * - Optional title and subtitle
 * - Action slot for buttons or icons
 * - Semantic heading hierarchy
 */
const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={`mb-4 ${className}`} {...props}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {action && (
            <div className="flex-shrink-0">
              {action}
            </div>
          )}
        </div>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// ============================================================================
// Card Content
// ============================================================================

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * CardContent component
 *
 * Simple wrapper for card body content with consistent spacing
 */
const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

// ============================================================================
// Card Footer
// ============================================================================

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

/**
 * CardFooter component
 *
 * Features:
 * - Optional top border
 * - Consistent spacing
 * - Typically used for actions or metadata
 */
const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ bordered = true, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`mt-4 pt-4 ${bordered ? 'border-t border-neutral-200 dark:border-neutral-700' : ''} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Export all components
export { Card, CardHeader, CardContent, CardFooter };
export { cardVariants };
export default Card;
