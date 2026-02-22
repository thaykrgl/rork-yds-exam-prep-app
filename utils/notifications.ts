import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions and return the granted status
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Schedule a daily study reminder notification
 */
export async function scheduleDailyReminder(hour: number, minute: number): Promise<string | null> {
  const granted = await requestNotificationPermissions();
  if (!granted) return null;

  // Cancel existing daily reminders first
  await cancelDailyReminder();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '📚 YDS Çalışma Zamanı!',
      body: 'Bugünkü hedefini tamamlamayı unutma. Her gün düzenli çalışmak başarının anahtarıdır!',
      data: { type: 'daily_reminder' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  return id;
}

/**
 * Cancel all daily reminder notifications
 */
export async function cancelDailyReminder(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.type === 'daily_reminder') {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

/**
 * Schedule a streak reminder notification (fires at 20:00 if user hasn't studied)
 */
export async function scheduleStreakReminder(): Promise<string | null> {
  const granted = await requestNotificationPermissions();
  if (!granted) return null;

  // Cancel existing streak reminders first
  await cancelStreakReminder();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔥 Serin kırılmasın!',
      body: 'Bugün henüz çalışmadın. Serini korumak için hemen birkaç soru çöz!',
      data: { type: 'streak_reminder' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });

  return id;
}

/**
 * Cancel all streak reminder notifications
 */
export async function cancelStreakReminder(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.type === 'streak_reminder') {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

/**
 * Send an immediate milestone notification
 */
export async function sendMilestoneNotification(title: string, body: string): Promise<void> {
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type: 'milestone' },
      sound: true,
    },
    trigger: null, // immediate
  });
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
