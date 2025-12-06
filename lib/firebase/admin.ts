/**
 * Firebase Admin SDK initialization
 * Server-side only - used for sending push notifications
 */

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getMessaging, type Messaging } from 'firebase-admin/messaging';

// Singleton instance
let adminApp: App | null = null;
let messaging: Messaging | null = null;

/**
 * Get or initialize Firebase Admin App
 * Uses environment variables for configuration
 */
function getAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = existingApps[0];
    return adminApp;
  }

  // Validate required environment variables
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin SDK configuration. ' +
      'Please set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY environment variables.'
    );
  }

  // Initialize Firebase Admin
  adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      // Handle escaped newlines in private key
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });

  return adminApp;
}

/**
 * Get Firebase Cloud Messaging instance
 */
export function getAdminMessaging(): Messaging {
  if (messaging) {
    return messaging;
  }

  const app = getAdminApp();
  messaging = getMessaging(app);
  return messaging;
}

/**
 * Send a push notification to a single device
 */
export async function sendPushNotification(
  token: string,
  notification: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: Record<string, string>;
  }
): Promise<string> {
  const fcm = getAdminMessaging();

  const message = {
    token,
    notification: {
      title: notification.title,
      body: notification.body,
    },
    webpush: {
      notification: {
        icon: notification.icon || '/icons/icon-192x192.png',
        badge: notification.badge || '/icons/icon-72x72.png',
        // Vibration pattern for mobile
        vibrate: [100, 50, 100],
        // Auto-close after 10 seconds
        requireInteraction: false,
      },
      fcmOptions: {
        link: notification.data?.url || '/dashboard',
      },
    },
    data: notification.data,
  };

  try {
    const messageId = await fcm.send(message);
    console.log(`[FCM] Successfully sent message: ${messageId}`);
    return messageId;
  } catch (error) {
    console.error('[FCM] Error sending message:', error);
    throw error;
  }
}

/**
 * Send push notifications to multiple devices
 */
export async function sendPushNotificationToMultiple(
  tokens: string[],
  notification: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: Record<string, string>;
  }
): Promise<{ successCount: number; failureCount: number; failedTokens: string[] }> {
  const fcm = getAdminMessaging();

  const message = {
    notification: {
      title: notification.title,
      body: notification.body,
    },
    webpush: {
      notification: {
        icon: notification.icon || '/icons/icon-192x192.png',
        badge: notification.badge || '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        requireInteraction: false,
      },
      fcmOptions: {
        link: notification.data?.url || '/dashboard',
      },
    },
    data: notification.data,
  };

  try {
    const response = await fcm.sendEachForMulticast({
      tokens,
      ...message,
    });

    const failedTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        failedTokens.push(tokens[idx]);
        console.error(`[FCM] Failed to send to token ${tokens[idx]}:`, resp.error);
      }
    });

    console.log(
      `[FCM] Multicast result: ${response.successCount} success, ${response.failureCount} failure`
    );

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      failedTokens,
    };
  } catch (error) {
    console.error('[FCM] Error sending multicast message:', error);
    throw error;
  }
}

/**
 * Notification types for Swan PWA
 * Using snake_case for consistency with CoachingMessageType
 */
export type SwanNotificationType =
  | 'morning_briefing'      // C-01: モーニング・ブリーフィング
  | 'craving_alert'         // C-02: 魔の時間帯アラート
  | 'step_down'             // C-03: ステップダウン提案
  | 'survival_check'        // C-04: 生存確認
  | 'sos_encouragement'     // D-03: AI励ましメッセージ
  | 'success_celebration';  // 成功祝福通知

/**
 * Send a Swan-specific notification
 */
export async function sendSwanNotification(
  token: string,
  type: SwanNotificationType,
  content: {
    title: string;
    body: string;
    url?: string;
  }
): Promise<string> {
  return sendPushNotification(token, {
    title: content.title,
    body: content.body,
    data: {
      type,
      url: content.url || '/dashboard',
      timestamp: Date.now().toString(),
    },
  });
}
