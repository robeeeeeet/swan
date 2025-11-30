'use client';

import { useEffect, useState, memo, useMemo } from 'react';
import { getRandomTip, TIPS, type Tip } from '@/constants/tips';
import { Card, CardContent } from '@/components/ui/Card';

/**
 * カテゴリー別の絵文字マッピング
 */
const CATEGORY_EMOJI: Record<string, string> = {
  '感覚刺激': '💧',
  '呼吸法': '🌬️',
  '代替行動': '🎯',
  '心理・認知': '🧠',
  '運動': '🏃',
  '環境調整': '🏠',
  '食事・栄養': '🥗',
  'コミュニケーション': '💬',
  '急速休息': '😴',
};

/**
 * Random tip component
 * Shows a random encouragement tip from 30 categorized tips
 *
 * Features:
 * - Auto-refreshes tip every 5 minutes
 * - Shows category with emoji
 * - Displays action and description
 * - Smooth fade-in animation on tip change
 * - Memoized for performance
 * - Accessible with proper semantic HTML
 */
function RandomTipComponent() {
  // 初期値はTIPSの最初の要素を使用（SSR対応）
  // クライアントサイドでマウント後にランダム化
  const initialTip = useMemo(() => TIPS[0], []);
  const [tip, setTip] = useState<Tip>(initialTip);
  const [key, setKey] = useState(0); // For animation trigger
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // クライアントサイドでマウント後にランダムなTipを設定
    // SSR時は固定値、クライアントでランダム化するため意図的にeffect内でsetState
    if (!mounted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTip(getRandomTip());
      setMounted(true);
    }

    // Refresh tip every 5 minutes
    const interval = setInterval(() => {
      setTip(getRandomTip());
      setKey((prev) => prev + 1);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [mounted]);

  if (!tip) return null;

  const categoryEmoji = CATEGORY_EMOJI[tip.category] || '💡';

  return (
    <Card variant="default" padding="md">
      <CardContent>
        <div
          key={key}
          className="animate-in fade-in duration-500"
        >
          {/* カテゴリーバッジ */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-lg flex-shrink-0 transition-transform duration-300 hover:scale-110"
              aria-hidden="true"
            >
              {categoryEmoji}
            </span>
            <span className="text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded-full">
              {tip.category}
            </span>
          </div>

          {/* アクション（メイン） */}
          <p className="text-base font-semibold text-neutral-800 dark:text-neutral-100 mb-1">
            {tip.action}
          </p>

          {/* 説明 */}
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {tip.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Memoize to prevent unnecessary re-renders when parent updates
export default memo(RandomTipComponent);
