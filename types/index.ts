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
 */
export interface SmokingRecord {
  id: string;
  userId: string;
  type: RecordType;
  timestamp: Timestamp;
  tags: SituationTag[];
  note?: string;

  // Metadata
  createdAt: Timestamp;
  syncedToCloud: boolean;
}

/**
 * Daily summary statistics
 */
export interface DailySummary {
  date: string; // YYYY-MM-DD format
  userId: string;

  // Counts
  smokedCount: number;
  cravedCount: number;
  resistedCount: number;

  // Goal tracking
  dailyGoal: number;
  achieved: boolean;

  // Tag analysis
  topTags: SituationTag[];

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
  magicTimeAlert: boolean;
  stepDownProposal: boolean;
  aliveCheck: boolean;

  // Privacy settings
  detailedMessages: boolean; // true: 詳細メッセージ, false: 汎用メッセージ

  // Timing preferences
  morningBriefingTime: string; // HH:MM format (e.g., "07:00")
  quietHoursStart?: string; // HH:MM format
  quietHoursEnd?: string; // HH:MM format
}

/**
 * User goals and preferences
 */
export interface GoalSettings {
  // Daily cigarette goals
  dailyGoal: number;
  weeklyGoal?: number;

  // Step-down preferences
  autoAdjustGoal: boolean; // Automatically adjust goal based on AI suggestions
  minimumGoal: number; // Don't suggest goals below this number

  // Starting baseline
  initialDailyCount: number;
  baselineSetAt: Timestamp;
}

/**
 * App settings
 */
export interface AppSettings {
  // Onboarding
  onboardingCompleted: boolean;
  installGuideShown: boolean;

  // Features
  sosTimerDuration: number; // seconds (default: 180)
  breathingCycles: number; // number of breathing cycles (default: 3)

  // Display
  theme: 'light' | 'dark' | 'system';

  // Privacy
  localDataOnly: boolean; // true: IndexedDB only, false: sync with Firestore
}

/**
 * Complete user settings
 */
export interface UserSettings {
  userId: string;
  notifications: NotificationSettings;
  goals: GoalSettings;
  app: AppSettings;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
