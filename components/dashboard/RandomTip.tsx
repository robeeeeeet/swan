'use client';

import { useEffect, useState, memo } from 'react';
import { RANDOM_TIPS, getRandomMessage } from '@/constants/messages';
import { Card, CardContent } from '@/components/ui/Card';

/**
 * Random tip component
 * Shows a random encouragement tip from constants
 *
 * Features:
 * - Auto-refreshes tip every 5 minutes
 * - Smooth fade-in animation on tip change
 * - Memoized for performance
 * - Accessible with proper semantic HTML
 */
function RandomTipComponent() {
  const [tip, setTip] = useState<string>('');
  const [key, setKey] = useState(0); // For animation trigger

  useEffect(() => {
    // Get random tip on mount
    const newTip = getRandomMessage(RANDOM_TIPS);
    setTip(newTip);
    setKey((prev) => prev + 1);

    // Refresh tip every 5 minutes
    const interval = setInterval(() => {
      const refreshedTip = getRandomMessage(RANDOM_TIPS);
      setTip(refreshedTip);
      setKey((prev) => prev + 1);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (!tip) return null;

  return (
    <Card variant="default" padding="md">
      <CardContent>
        <div className="flex items-start gap-3">
          <span
            className="text-2xl flex-shrink-0 transition-transform duration-300 hover:scale-110"
            aria-hidden="true"
          >
            💡
          </span>
          <p
            key={key}
            className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed animate-in fade-in duration-500"
          >
            {tip}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Memoize to prevent unnecessary re-renders when parent updates
export default memo(RandomTipComponent);
