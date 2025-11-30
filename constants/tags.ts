import { SituationTag } from '@/types';

/**
 * Situation tag definitions with Japanese labels
 */
export const SITUATION_TAGS: Record<SituationTag, { label: string; emoji: string }> = {
  after_meal: {
    label: '食後',
    emoji: '🍽️',
  },
  break_time: {
    label: '休憩時間',
    emoji: '☕',
  },
  stress: {
    label: 'ストレス',
    emoji: '😰',
  },
  habit: {
    label: '習慣',
    emoji: '🔄',
  },
  social: {
    label: '人付き合い',
    emoji: '👥',
  },
  alcohol: {
    label: 'お酒の席',
    emoji: '🍺',
  },
  work: {
    label: '仕事中',
    emoji: '💼',
  },
  morning: {
    label: '朝一',
    emoji: '🌅',
  },
  before_sleep: {
    label: '寝る前',
    emoji: '🌙',
  },
  other: {
    label: 'その他',
    emoji: '📝',
  },
};

/**
 * Get all situation tags as array
 */
export const getAllTags = (): SituationTag[] => {
  return Object.keys(SITUATION_TAGS) as SituationTag[];
};

/**
 * Get tag label
 */
export const getTagLabel = (tag: SituationTag): string => {
  return SITUATION_TAGS[tag]?.label || tag;
};

/**
 * Get tag emoji
 */
export const getTagEmoji = (tag: SituationTag): string => {
  return SITUATION_TAGS[tag]?.emoji || '📝';
};
