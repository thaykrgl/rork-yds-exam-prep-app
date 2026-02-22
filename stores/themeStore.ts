import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

interface ThemeStore {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'light',

      toggleTheme: () => {
        set((state) => ({
          mode: state.mode === 'light' ? 'dark' : 'light',
        }));
      },

      setTheme: (mode: ThemeMode) => {
        set({ mode });
      },
    }),
    {
      name: 'yds_theme',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
