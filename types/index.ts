import { Timestamp } from 'firebase/firestore';

// ============================================================================
// User Types
// ============================================================================

export interface UserProfile {
  uid: string;
  isAnonymous: boolean;
  createdAt: Timestamp;
  displayName?: string;
  email?: string;
  photoURL?: string;
}

// ============================================================================
// Record Types
// ============================================================================

/**
 * Type of user action
 */
export type RecordType = 'smoked' | 'craved' | 'resisted';

/**
 * Situation tags for context tracking
 */
export type SituationTag =
  | 'after_meal'      // 食後
  | 'break_time'      // 休憩時間
  | 'stress'          // ストレス
  | 'habit'           // 習慣
  | 'social'          // 人付き合い
  | 'alcohol'         // お酒の席
  | 'work'            // 仕事中
  | 'morning'         // 朝一
  | 'before_sleep'    // 寝る前
  | 'other';          // その他

/**
 * Smoking/craving record
 * Note: timestamp can be number (IndexedDB) or Timestamp (Firestore)
 */
export interface SmokingRecord {
  id: string;
  userId: string;
  type: RecordType;
  timestamp: number; // Unix timestamp in milliseconds
  date: string; // YYYY-MM-DD format for indexing
  tags: SituationTag[];
  note?: string;
}

/**
 * Daily summary statistics
 */
export interface DailySummary {
  id: string; // Format: userId_YYYY-MM-DD
  date: string; // YYYY-MM-DD format
  userId: string;

  // Counts
  totalSmoked: number;
  totalCraved: number;
  totalResisted: number;

  // Savings
  moneySaved: number; // Amount in yen
  minutesSaved: number; // Life regained in minutes

  // Tag analysis
  mostCommonTags: SituationTag[];

  // Goal tracking
  dailyTarget: number;
  goalMet: boolean;
  resistanceRate: number; // Percentage (0-100)
}

// ============================================================================
// Settings Types
// ============================================================================

/**
 * Notification preferences
 */
export interface NotificationSettings {
  enabled: boolean;

  // Notification types
  morningBriefing: boolean;
  dangerousTimeAlerts: boolean;
  stepDownSuggestions: boolean;
  survivalCheck: boolean;

  // Privacy settings
  privacyMode: boolean; // true: 汎用メッセージ, false: 詳細メッセージ

  // Timing preferences
  quietHoursStart: string; // HH:MM format (e.g., "22:00")
  quietHoursEnd: string; // HH:MM format (e.g., "08:00")
}

/**
 * User goals and preferences
 */
export interface GoalSettings {
  // Daily cigarette target
  dailyTarget: number;

  // Step-down preferences
  stepDownEnabled: boolean; // Automatically adjust goal based on AI suggestions
  stepDownRate: number; // Reduction rate (e.g., 0.9 = reduce by 10%)
}

/**
 * App settings
 */
export interface AppSettings {
  // Display
  theme: 'light' | 'dark' | 'system';
  language: 'ja' | 'en';

  // Calculation settings
  cigarettePrice: number; // Price per pack in yen
  cigarettesPerPack: number; // Default: 20
  minutesPerCigarette: number; // Average smoking time (default: 7)
}

/**
 * Complete user settings
 */
export interface UserSettings {
  userId: string;
  notifications: NotificationSettings;
  goals: GoalSettings;
  app: AppSettings;
}

// ============================================================================
// AI / Coaching Types
// ============================================================================

/**
 * AI-generated coaching message
 */
export interface CoachingMessage {
  id: string;
  userId: string;
  type: 'morning_briefing' | 'magic_time_alert' | 'step_down' | 'encouragement' | 'alive_check';
  content: string;
  createdAt: Timestamp;
  delivered: boolean;
  deliveredAt?: Timestamp;
}

/**
 * Context data for AI prompt generation
 */
export interface AIContext {
  recentRecords: SmokingRecord[];
  todaySummary: DailySummary;
  goals: GoalSettings;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
}

// ============================================================================
// Push Notification Types
// ============================================================================

/**
 * Push notification subscription
 */
export interface PushSubscription {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };

  // Device info
  userAgent?: string;
  platform?: string;

  // Metadata
  createdAt: Timestamp;
  lastUsedAt: Timestamp;
  enabled: boolean;
}

// ============================================================================
// SOS Feature Types
// ============================================================================

/**
 * SOS session tracking
 */
export interface SOSSession {
  id: string;
  userId: string;
  type: 'timer' | 'breathing';
  startedAt: Timestamp;
  completedAt?: Timestamp;
  completed: boolean;
  duration?: number; // seconds

  // Outcome
  cravedAfter: boolean; // Did user crave after session?
  resistedAfter: boolean; // Did user resist after session?
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Date range for queries
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Pagination params
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
