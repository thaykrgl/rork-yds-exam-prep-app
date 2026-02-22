import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationPreferences } from '@/types';

interface NotificationStore {
  preferences: NotificationPreferences;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      preferences: {
        dailyReminder: false,
        dailyReminderTime: '09:00',
        streakReminder: false,
        milestoneNotifications: true,
      },

      updatePreferences: (prefs) => {
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        }));
      },
    }),
    {
      name: 'yds_notifications',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
