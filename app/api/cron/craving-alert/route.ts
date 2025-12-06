/**
 * Craving Alert Cron Job (C-02)
 * Sends proactive alerts before typical craving times
 *
 * Schedule: Runs hourly to check if users are approaching their typical craving times
 * Common craving times: 9:00 (post-breakfast), 12:00 (lunch), 15:00 (afternoon), 18:00 (after work), 21:00 (evening)
 */

import { NextRequest } from 'next/server';
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
  isApproachingCravingTime,
} from '@/lib/ai';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Default craving times (hours in JST)
// These are common times when cravings occur
const DEFAULT_CRAVING_HOURS = [9, 12, 15, 18, 21];

// Minutes before craving time to send alert
const ALERT_WINDOW_MINUTES = 30;

export async function GET(request: NextRequest) {
  // Verify cron authorization
  if (!verifyCronRequest(request)) {
    return unauthorizedResponse();
  }

  try {
    console.log('[Cron/CravingAlert] Starting...');

    // Check if current time is within alert window for any craving time
    const now = new Date();
    // Adjust for JST (UTC+9)
    const jstHour = (now.getUTCHours() + 9) % 24;
    const jstMinute = now.getUTCMinutes();

    // Check if we're approaching any typical craving time
    const isAlertTime = DEFAULT_CRAVING_HOURS.some((hour) => {
      const minutesUntilCraving = (hour * 60) - (jstHour * 60 + jstMinute);
      return minutesUntilCraving > 0 && minutesUntilCraving <= ALERT_WINDOW_MINUTES;
    });

    if (!isAlertTime) {
      console.log(`[Cron/CravingAlert] Not within alert window (JST: ${jstHour}:${jstMinute})`);
      return cronSuccessResponse({
        type: 'craving_alert',
        usersProcessed: 0,
        notificationsSent: 0,
        errors: 0,
      });
    }

    // Get all users with push subscriptions
    const users = await getUsersWithPushSubscriptions();
    console.log(`[Cron/CravingAlert] Processing ${users.length} users at JST ${jstHour}:${jstMinute}`);

    let notificationsSent = 0;
    let errors = 0;

    for (const user of users) {
      try {
        // Get user's statistics
        const stats = await getUserDailyStats(user.userId);

        // Skip if user has already exceeded goal (they might not want more alerts)
        if (stats.todaySmoked >= stats.dailyGoal) {
          continue;
        }

        // Build coaching context
        const context = buildCoachingContext({
          daysTracking: stats.daysTracking,
          todaySmoked: stats.todaySmoked,
          todayCraved: stats.todayCraved,
          todayResisted: stats.todayResisted,
          dailyGoal: stats.dailyGoal,
        });

        // Generate proactive craving alert
        const result = await generateCoachingMessage('craving_alert', context);

        // Send notification
        const sendResult = await sendNotificationToUser(
          user.tokens,
          'craving_alert',
          result.message,
          '/dashboard'
        );

        notificationsSent += sendResult.success;
        errors += sendResult.failed;

        console.log(
          `[Cron/CravingAlert] User ${user.userId}: ${sendResult.success} sent, ${sendResult.failed} failed`
        );
      } catch (error) {
        console.error(`[Cron/CravingAlert] Error for user ${user.userId}:`, error);
        errors++;
      }
    }

    console.log(
      `[Cron/CravingAlert] Complete. Sent: ${notificationsSent}, Errors: ${errors}`
    );

    return cronSuccessResponse({
      type: 'craving_alert',
      usersProcessed: users.length,
      notificationsSent,
      errors,
    });
  } catch (error) {
    return cronErrorResponse(error);
  }
}
