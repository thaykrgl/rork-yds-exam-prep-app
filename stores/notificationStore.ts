import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationPreferences } from '@/types';
import { 
  scheduleDailyReminder, 
  cancelDailyReminder, 
  scheduleStreakReminder, 
  cancelStreakReminder 
} from '@/utils/notifications';

interface NotificationStore {
  preferences: NotificationPreferences;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  syncNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      preferences: {
        dailyReminder: false,
        dailyReminderTime: '09:00',
        streakReminder: false,
        milestoneNotifications: true,
      },

      updatePreferences: async (prefs) => {
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        }));
        
        await get().syncNotifications();
      },

      syncNotifications: async () => {
        const { preferences } = get();
        
        // Handle daily reminder
        if (preferences.dailyReminder) {
          const [hour, minute] = preferences.dailyReminderTime.split(':').map(Number);
          await scheduleDailyReminder(hour, minute);
        } else {
          await cancelDailyReminder();
        }

        // Handle streak reminder
        if (preferences.streakReminder) {
          await scheduleStreakReminder();
        } else {
          await cancelStreakReminder();
        }
      },
    }),
    {
      name: 'yds_notifications',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
