'use client';

import { useEffect, useState } from 'react';

interface CelebrationProps {
  show: boolean;
  message: string;
  onComplete?: () => void;
}

/**
 * Celebration component with confetti animation
 * Following Swan Design System
 *
 * Used when user successfully resists craving
 */
export default function Celebration({ show, message, onComplete }: CelebrationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number }>>([]);

  useEffect(() => {
    if (show) {
      // Generate confetti pieces
      const pieces = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
      }));
      setConfetti(pieces);

      // Complete after 3 seconds
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Confetti */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 w-3 h-3 rounded-full animate-confetti"
          style={{
            left: `${piece.left}%`,
            backgroundColor: ['#22c55e', '#fbbf24', '#14b8a6', '#f97316'][piece.id % 4],
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}

      {/* Message */}
      <div className="text-center animate-scale-up">
        <div className="text-6xl mb-4" role="img" aria-label="祝福">
          🎉
        </div>
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
          {message}
        </div>
      </div>
    </div>
  );
}
