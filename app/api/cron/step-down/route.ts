/**
 * Step Down Suggestion Cron Job (C-03)
 * Suggests reducing daily target for users who are consistently performing well
 *
 * Schedule: Weekly (Sunday evening at 20:00 JST / 11:00 UTC)
 */

import { NextRequest } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  verifyCronRequest,
  unauthorizedResponse,
  getUsersWithPushSubscriptions,
  getUserDailyStats,
  sendNotificationToUser,
  cronSuccessResponse,
  cronErrorResponse,
} from '@/lib/cron/utils';
import {
  generateCoachingMessage,
  buildCoachingContext,
  shouldSuggestStepDown,
} from '@/lib/ai';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Calculate weekly average for a user
 */
async function getWeeklyAverage(userId: string): Promise<number | null> {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const recordsRef = collection(db, 'users', userId, 'records');
  const weeklyQuery = query(
    recordsRef,
    where('timestamp', '>=', oneWeekAgo),
    where('type', '==', 'smoked')
  );

  const snapshot = await getDocs(weeklyQuery);

  if (snapshot.empty) {
    return null;
  }

  // Count smoked records per day
  const dailyCounts = new Map<string, number>();

  for (const doc of snapshot.docs) {
    const timestamp = doc.data().timestamp;
    const date = new Date(timestamp).toISOString().split('T')[0];
    dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
  }

  // Calculate average (only count days with records)
  const days = dailyCounts.size;
  if (days === 0) return null;

  const total = Array.from(dailyCounts.values()).reduce((sum, count) => sum + count, 0);
  return Math.round(total / days);
}

export async function GET(request: NextRequest) {
  // Verify cron authorization
  if (!verifyCronRequest(request)) {
    return unauthorizedResponse();
  }

  try {
    console.log('[Cron/StepDown] Starting weekly step-down check...');

    // Get all users with push subscriptions
    const users = await getUsersWithPushSubscriptions();
    console.log(`[Cron/StepDown] Checking ${users.length} users`);

    let notificationsSent = 0;
    let errors = 0;
    let eligible = 0;

    for (const user of users) {
      try {
        // Get user's statistics
        const stats = await getUserDailyStats(user.userId);
        const weeklyAverage = await getWeeklyAverage(user.userId);

        // Skip if not enough data
        if (weeklyAverage === null) {
          continue;
        }

        // Check if user should receive step-down suggestion
        if (!shouldSuggestStepDown(weeklyAverage, stats.dailyGoal, stats.daysTracking)) {
          continue;
        }

        eligible++;

        // Build coaching context
        const context = buildCoachingContext({
          daysTracking: stats.daysTracking,
          todaySmoked: stats.todaySmoked,
          todayCraved: stats.todayCraved,
          todayResisted: stats.todayResisted,
          dailyGoal: stats.dailyGoal,
          weeklyAverage,
        });

        // Generate step-down suggestion
        const result = await generateCoachingMessage('step_down', context);

        // Send notification
        const sendResult = await sendNotificationToUser(
          user.tokens,
          'step_down',
          result.message,
          '/settings'
        );

        notificationsSent += sendResult.success;
        errors += sendResult.failed;

        console.log(
          `[Cron/StepDown] User ${user.userId}: Weekly avg ${weeklyAverage} vs goal ${stats.dailyGoal} - Sent: ${sendResult.success}`
        );
      } catch (error) {
        console.error(`[Cron/StepDown] Error for user ${user.userId}:`, error);
        errors++;
      }
    }

    console.log(
      `[Cron/StepDown] Complete. Eligible: ${eligible}, Sent: ${notificationsSent}, Errors: ${errors}`
    );

    return cronSuccessResponse({
      type: 'step_down',
      usersProcessed: eligible,
      notificationsSent,
      errors,
    });
  } catch (error) {
    return cronErrorResponse(error);
  }
}
