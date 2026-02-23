import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationPreferences } from '@/types';
import {
  scheduleDailyReminder,
  cancelDailyReminder,
  scheduleStreakReminder,
  cancelStreakReminder,
  scheduleWordOfTheDay,
  cancelWordOfTheDay,
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
        wordOfTheDay: false,
        wordOfTheDayTime: '08:00',
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

        // Handle word of the day
        if (preferences.wordOfTheDay) {
          const wotdTime = preferences.wordOfTheDayTime || '08:00';
          const [wHour, wMinute] = wotdTime.split(':').map(Number);
          await scheduleWordOfTheDay(wHour, wMinute);
        } else {
          await cancelWordOfTheDay();
        }
      },
    }),
    {
      name: 'yds_notifications',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
