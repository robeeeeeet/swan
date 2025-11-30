/**
 * Encouragement messages for different scenarios
 * Used as fallback when AI-generated messages are not available
 */

/**
 * Messages for successful resistance
 */
export const RESISTANCE_MESSAGES = [
  'すごい！その一本を我慢できましたね 💪',
  '素晴らしい選択です。あなたは強い 🌟',
  'やった！また一歩前進です 🎉',
  '我慢できた自分を誇りに思ってください ✨',
  'その調子！あなたならできます 🔥',
  '見事です！健康への一歩を踏み出しました 🌱',
];

/**
 * Messages for neutral smoking record
 */
export const NEUTRAL_MESSAGES = [
  '記録しました 📝',
  '今日の記録を保存しました',
  '記録完了です',
];

/**
 * Morning briefing fallback messages
 */
export const MORNING_BRIEFINGS = [
  'おはようございます！今日も一緒に頑張りましょう ☀️',
  '新しい一日の始まりです。今日の目標を意識して過ごしましょう 🌅',
  'おはようございます！昨日の成功を今日も続けましょう 💪',
  '今日も素晴らしい一日になりますように 🌟',
];

/**
 * Magic time alert fallback messages
 */
export const MAGIC_TIME_ALERTS = [
  'この時間は吸いたくなりやすい時間帯です。深呼吸してみましょう',
  '魔の時間帯です。今日は我慢できるかもしれませんよ',
  'いつもこの時間は要注意。でも、今日は乗り越えられます',
];

/**
 * Step-down proposal fallback messages
 */
export const STEP_DOWN_PROPOSALS = [
  '最近の頑張りが素晴らしいですね。次の段階に進めるかもしれません',
  '順調に減らせていますね。目標を少し下げてみませんか？',
  '着実に進歩していますよ。次のステップに挑戦しましょう',
];

/**
 * Alive check fallback messages
 */
export const ALIVE_CHECK_MESSAGES = [
  '最近記録がありませんが、お元気ですか？',
  '調子はいかがですか？記録を続けると、パターンが見えてきますよ',
  'しばらく記録がありませんね。今日の様子を教えてください',
];

/**
 * Get random message from array
 */
export const getRandomMessage = (messages: string[]): string => {
  return messages[Math.floor(Math.random() * messages.length)];
};
