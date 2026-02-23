import { create } from 'zustand';

interface LevelUpStore {
  pendingLevelUp: number | null;
  triggerLevelUp: (newLevel: number) => void;
  dismissLevelUp: () => void;
}

export const useLevelUpStore = create<LevelUpStore>()((set) => ({
  pendingLevelUp: null,
  triggerLevelUp: (newLevel: number) => set({ pendingLevelUp: newLevel }),
  dismissLevelUp: () => set({ pendingLevelUp: null }),
}));
