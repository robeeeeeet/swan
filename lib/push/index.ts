/**
 * Push Notification Module
 * Re-exports all push notification related functionality
 */

// Client-side subscription management
export {
  isPushNotificationSupported,
  isRunningAsInstalledPWA,
  isIOSRequiringInstallation,
  getNotificationPermission,
  requestNotificationPermission,
  getFCMToken,
  saveFCMTokenToFirestore,
  removeFCMTokenFromFirestore,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  setupForegroundMessageHandler,
  hasActivePushSubscription,
} from './subscription';
