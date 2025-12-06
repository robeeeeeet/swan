/**
 * Morning Briefing Cron Job (C-01)
 * Sends personalized morning encouragement messages to users
 *
 * Schedule: Daily at 7:00 AM JST (22:00 UTC previous day)
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
} from '@/lib/ai';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max for cron jobs

export async function GET(request: NextRequest) {
  // Verify cron authorization
  if (!verifyCronRequest(request)) {
    return unauthorizedResponse();
  }

  try {
    console.log('[Cron/MorningBriefing] Starting...');

    // Get all users with push subscriptions
    const users = await getUsersWithPushSubscriptions();
    console.log(`[Cron/MorningBriefing] Found ${users.length} users with subscriptions`);

    let notificationsSent = 0;
    let errors = 0;

    for (const user of users) {
      try {
        // Get user's statistics for personalized message
        const stats = await getUserDailyStats(user.userId);

        // Build coaching context
        const context = buildCoachingContext({
          daysTracking: stats.daysTracking,
          todaySmoked: stats.todaySmoked,
          todayCraved: stats.todayCraved,
          todayResisted: stats.todayResisted,
          dailyGoal: stats.dailyGoal,
        });

        // Generate personalized morning message
        const result = await generateCoachingMessage('morning_briefing', context);

        // Send notification
        const sendResult = await sendNotificationToUser(
          user.tokens,
          'morning_briefing',
          result.message,
          '/dashboard'
        );

        notificationsSent += sendResult.success;
        errors += sendResult.failed;

        console.log(
          `[Cron/MorningBriefing] User ${user.userId}: ${sendResult.success} sent, ${sendResult.failed} failed`
        );
      } catch (error) {
        console.error(`[Cron/MorningBriefing] Error for user ${user.userId}:`, error);
        errors++;
      }
    }

    console.log(
      `[Cron/MorningBriefing] Complete. Sent: ${notificationsSent}, Errors: ${errors}`
    );

    return cronSuccessResponse({
      type: 'morning_briefing',
      usersProcessed: users.length,
      notificationsSent,
      errors,
    });
  } catch (error) {
    return cronErrorResponse(error);
  }
}
