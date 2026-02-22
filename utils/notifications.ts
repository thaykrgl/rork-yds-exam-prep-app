// Notification utilities - stubbed for now (expo-notifications will be added later)
// These functions provide the interface; actual scheduling requires expo-notifications

export async function requestNotificationPermission(): Promise<boolean> {
  // Stub: will use Notifications.requestPermissionsAsync() when expo-notifications is installed
  return false;
}

export async function scheduleDailyReminder(hour: number, minute: number): Promise<string | null> {
  // Stub: will use Notifications.scheduleNotificationAsync() with daily trigger
  console.log(`[Notifications] Would schedule daily reminder at ${hour}:${minute}`);
  return null;
}

export async function cancelAllScheduled(): Promise<void> {
  // Stub: will use Notifications.cancelAllScheduledNotificationsAsync()
  console.log('[Notifications] Would cancel all scheduled notifications');
}

export async function sendLocalNotification(title: string, body: string): Promise<void> {
  // Stub: will use Notifications.scheduleNotificationAsync() with immediate trigger
  console.log(`[Notifications] Would send: ${title} - ${body}`);
}
