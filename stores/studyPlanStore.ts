import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActiveStudyPlan, StudyPlanId, StudyPlanTask } from '@/types';
import { studyPlans } from '@/data/studyPlans';

interface StudyPlanStore {
  activePlan: ActiveStudyPlan | null;
  startPlan: (planId: StudyPlanId) => void;
  completeTask: (taskId: string) => void;
  abandonPlan: () => void;
  getTodaysTasks: () => StudyPlanTask[];
  getPlanProgress: () => { completed: number; total: number; percentage: number };
  getActivePlanDef: () => typeof studyPlans[0] | null;
}

export const useStudyPlanStore = create<StudyPlanStore>()(
  persist(
    (set, get) => ({
      activePlan: null,

      startPlan: (planId: StudyPlanId) => {
        set({
          activePlan: {
            planId,
            startDate: new Date().toISOString().split('T')[0],
            completedTasks: [],
            currentDay: 1,
          },
        });
      },

      completeTask: (taskId: string) => {
        set((state) => {
          if (!state.activePlan) return state;
          const completedTasks = [...state.activePlan.completedTasks, taskId];
          return {
            activePlan: {
              ...state.activePlan,
              completedTasks,
            },
          };
        });
      },

      abandonPlan: () => {
        set({ activePlan: null });
      },

      getTodaysTasks: () => {
        const { activePlan } = get();
        if (!activePlan) return [];

        const plan = studyPlans.find((p) => p.id === activePlan.planId);
        if (!plan) return [];

        const startDate = new Date(activePlan.startDate);
        const today = new Date();
        const diffTime = today.getTime() - startDate.getTime();
        const currentDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (currentDay > plan.durationDays) return [];

        return plan.tasks
          .filter((t) => t.day === currentDay)
          .map((t) => ({
            ...t,
            completed: activePlan.completedTasks.includes(t.id),
          }));
      },

      getPlanProgress: () => {
        const { activePlan } = get();
        if (!activePlan) return { completed: 0, total: 0, percentage: 0 };

        const plan = studyPlans.find((p) => p.id === activePlan.planId);
        if (!plan) return { completed: 0, total: 0, percentage: 0 };

        const completed = activePlan.completedTasks.length;
        const total = plan.tasks.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, percentage };
      },

      getActivePlanDef: () => {
        const { activePlan } = get();
        if (!activePlan) return null;
        return studyPlans.find((p) => p.id === activePlan.planId) || null;
      },
    }),
    {
      name: 'yds_study_plan',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
