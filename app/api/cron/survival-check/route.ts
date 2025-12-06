/**
 * Survival Check Cron Job (C-04)
 * Sends gentle reminders to users who haven't logged for a while
 *
 * Schedule: Every 4 hours during waking hours (8:00, 12:00, 16:00, 20:00 JST)
 */

import { NextRequest } from 'next/server';
import {
  verifyCronRequest,
  unauthorizedResponse,
  getInactiveUsers,
  getUserDailyStats,
  sendNotificationToUser,
  cronSuccessResponse,
  cronErrorResponse,
} from '@/lib/cron/utils';
import {
  generateCoachingMessage,
  buildCoachingContext,
} from '@/lib/ai';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Hours of inactivity before sending a reminder
const INACTIVITY_THRESHOLD_HOURS = 6;

export async function GET(request: NextRequest) {
  // Verify cron authorization
  if (!verifyCronRequest(request)) {
    return unauthorizedResponse();
  }

  try {
    console.log('[Cron/SurvivalCheck] Starting...');

    // Get users who haven't logged recently
    const inactiveUsers = await getInactiveUsers(INACTIVITY_THRESHOLD_HOURS);
    console.log(
      `[Cron/SurvivalCheck] Found ${inactiveUsers.length} inactive users`
    );

    let notificationsSent = 0;
    let errors = 0;

    for (const user of inactiveUsers) {
      try {
        // Get user's statistics for context
        const stats = await getUserDailyStats(user.userId);

        // Build coaching context
        const context = buildCoachingContext({
          daysTracking: stats.daysTracking,
          todaySmoked: stats.todaySmoked,
          todayCraved: stats.todayCraved,
          todayResisted: stats.todayResisted,
          dailyGoal: stats.dailyGoal,
        });

        // Generate gentle reminder message
        const result = await generateCoachingMessage('survival_check', context);

        // Send notification
        const sendResult = await sendNotificationToUser(
          user.tokens,
          'survival_check',
          result.message,
          '/dashboard'
        );

        notificationsSent += sendResult.success;
        errors += sendResult.failed;

        console.log(
          `[Cron/SurvivalCheck] User ${user.userId}: ${sendResult.success} sent, ${sendResult.failed} failed`
        );
      } catch (error) {
        console.error(`[Cron/SurvivalCheck] Error for user ${user.userId}:`, error);
        errors++;
      }
    }

    console.log(
      `[Cron/SurvivalCheck] Complete. Sent: ${notificationsSent}, Errors: ${errors}`
    );

    return cronSuccessResponse({
      type: 'survival_check',
      usersProcessed: inactiveUsers.length,
      notificationsSent,
      errors,
    });
  } catch (error) {
    return cronErrorResponse(error);
  }
}
