/**
 * Cron Job Utilities
 * Common utilities for scheduled notification jobs
 */

import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { sendSwanNotification, type SwanNotificationType } from '@/lib/firebase/admin';

/**
 * Verify that the request is from a legitimate cron job
 */
export function verifyCronRequest(request: NextRequest): boolean {
  // Get the authorization header
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return false;
  }

  // Check against CRON_SECRET
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    console.warn('[Cron] CRON_SECRET not configured');
    return false;
  }

  // Support both "Bearer <token>" and direct token
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  return token === expectedSecret;
}

/**
 * Create an unauthorized response for invalid cron requests
 */
export function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}

/**
 * Get all users with active push subscriptions
 */
export async function getUsersWithPushSubscriptions(): Promise<
  Array<{
    userId: string;
    tokens: string[];
  }>
> {
  const usersRef = collection(db, 'users');
  const usersSnapshot = await getDocs(usersRef);

  const results: Array<{ userId: string; tokens: string[] }> = [];

  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    const tokensRef = collection(db, 'users', userId, 'pushTokens');
    const tokensSnapshot = await getDocs(tokensRef);

    const tokens = tokensSnapshot.docs.map((doc) => doc.data().token as string);

    if (tokens.length > 0) {
      results.push({ userId, tokens });
    }
  }

  return results;
}

/**
 * Get users who haven't logged today
 */
export async function getInactiveUsers(
  hoursThreshold: number = 6
): Promise<Array<{ userId: string; tokens: string[] }>> {
  const users = await getUsersWithPushSubscriptions();
  const thresholdTime = Date.now() - hoursThreshold * 60 * 60 * 1000;

  const inactiveUsers: Array<{ userId: string; tokens: string[] }> = [];

  for (const user of users) {
    // Check if user has any records in the last X hours
    const recordsRef = collection(db, 'users', user.userId, 'records');
    const recentRecordsQuery = query(
      recordsRef,
      where('timestamp', '>=', thresholdTime)
    );
    const recentSnapshot = await getDocs(recentRecordsQuery);

    if (recentSnapshot.empty) {
      inactiveUsers.push(user);
    }
  }

  return inactiveUsers;
}

/**
 * Get user's daily statistics for coaching context
 */
export async function getUserDailyStats(userId: string): Promise<{
  todaySmoked: number;
  todayCraved: number;
  todayResisted: number;
  daysTracking: number;
  dailyGoal: number;
}> {
  // Get today's start timestamp (JST)
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  // Get today's records
  const recordsRef = collection(db, 'users', userId, 'records');
  const todayQuery = query(
    recordsRef,
    where('timestamp', '>=', todayStart)
  );
  const todaySnapshot = await getDocs(todayQuery);

  let todaySmoked = 0;
  let todayCraved = 0;
  let todayResisted = 0;

  for (const doc of todaySnapshot.docs) {
    const data = doc.data();
    switch (data.type) {
      case 'smoked':
        todaySmoked++;
        break;
      case 'craved':
        todayCraved++;
        break;
      case 'resisted':
        todayResisted++;
        break;
    }
  }

  // Get user settings for daily goal
  const { getDoc, doc: docRef } = await import('firebase/firestore');
  const settingsDoc = await getDoc(docRef(db, 'users', userId, 'settings', 'current'));
  const dailyGoal = settingsDoc.exists() ? settingsDoc.data()?.goals?.dailyTarget ?? 20 : 20;

  // Calculate days tracking (simplified - count distinct days with records)
  const allRecordsSnapshot = await getDocs(recordsRef);
  const uniqueDays = new Set<string>();
  for (const doc of allRecordsSnapshot.docs) {
    const timestamp = doc.data().timestamp;
    const date = new Date(timestamp).toISOString().split('T')[0];
    uniqueDays.add(date);
  }
  const daysTracking = uniqueDays.size || 1;

  return {
    todaySmoked,
    todayCraved,
    todayResisted,
    daysTracking,
    dailyGoal,
  };
}

/**
 * Send notification to a user
 */
export async function sendNotificationToUser(
  tokens: string[],
  type: SwanNotificationType,
  message: string,
  url?: string
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const token of tokens) {
    try {
      await sendSwanNotification(token, type, {
        title: getNotificationTitle(type),
        body: message,
        url,
      });
      success++;
    } catch (error) {
      console.error(`[Cron] Failed to send notification to token:`, error);
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Get notification title based on type
 */
function getNotificationTitle(type: SwanNotificationType): string {
  switch (type) {
    case 'morning_briefing':
      return 'おはようございます';
    case 'craving_alert':
      return 'ちょっと休憩';
    case 'step_down':
      return '目標達成おめでとう';
    case 'survival_check':
      return '元気ですか？';
    case 'sos_encouragement':
      return '応援しています';
    case 'success_celebration':
      return 'やったね！';
    default:
      return 'Swan';
  }
}

/**
 * Create a successful cron response
 */
export function cronSuccessResponse(data: {
  type: string;
  usersProcessed: number;
  notificationsSent: number;
  errors: number;
}): NextResponse {
  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    ...data,
  });
}

/**
 * Create an error cron response
 */
export function cronErrorResponse(error: unknown): NextResponse {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error('[Cron] Error:', error);

  return NextResponse.json(
    {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}
