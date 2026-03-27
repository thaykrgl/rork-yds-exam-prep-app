import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersonalRecord, Milestone, RecordType, UserStats, DailyStudyRecord } from '@/types';

const MAX_MILESTONES = 50;

interface WeeklyComparison {
  currentWeek: { questionsAnswered: number; questionsCorrect: number; studyTimeSeconds: number; accuracy: number };
  previousWeek: { questionsAnswered: number; questionsCorrect: number; studyTimeSeconds: number; accuracy: number };
  changes: { questionsChange: number; accuracyChange: number; studyTimeChange: number };
}

const recordDefinitions: Array<{ id: RecordType; titleTr: string; icon: string; color: string }> = [
  { id: 'best_exam_score', titleTr: 'En Yüksek Sınav Puanı', icon: 'Trophy', color: '#F59E0B' },
  { id: 'longest_streak', titleTr: 'En Uzun Seri', icon: 'Flame', color: '#EF4444' },
  { id: 'most_questions_day', titleTr: 'Günlük En Çok Soru', icon: 'Target', color: '#3B82F6' },
  { id: 'best_accuracy', titleTr: 'En Yüksek Doğruluk', icon: 'TrendingUp', color: '#22C55E' },
  { id: 'fastest_exam', titleTr: 'En Hızlı Sınav', icon: 'Zap', color: '#F97316' },
  { id: 'total_exams', titleTr: 'Toplam Sınav', icon: 'FileText', color: '#6366F1' },
  { id: 'best_grammar', titleTr: 'En İyi Dilbilgisi', icon: 'PenTool', color: '#8B5CF6' },
  { id: 'best_vocabulary', titleTr: 'En İyi Kelime', icon: 'BookOpen', color: '#14B8A6' },
];

function formatRecordValue(id: RecordType, value: number): string {
  switch (id) {
    case 'best_exam_score':
    case 'best_accuracy':
    case 'best_grammar':
    case 'best_vocabulary':
      return `%${Math.round(value)}`;
    case 'longest_streak':
      return `${value} gün`;
    case 'most_questions_day':
    case 'total_exams':
      return `${value}`;
    case 'fastest_exam':
      if (value === 0) return '-';
      const minutes = Math.floor(value / 60);
      const seconds = value % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    default:
      return `${value}`;
  }
}

function computeRecordValue(id: RecordType, stats: UserStats, dailyRecords: DailyStudyRecord[]): number {
  switch (id) {
    case 'best_exam_score': {
      if (stats.examHistory.length === 0) return 0;
      return Math.max(...stats.examHistory.map(e => (e.score / e.totalQuestions) * 100));
    }
    case 'longest_streak':
      return stats.bestStreak;
    case 'most_questions_day': {
      if (dailyRecords.length === 0) return stats.dailyProgress;
      return Math.max(stats.dailyProgress, ...dailyRecords.map(d => d.questionsAnswered));
    }
    case 'best_accuracy': {
      if (stats.totalAnswered === 0) return 0;
      return (stats.correctAnswers / stats.totalAnswered) * 100;
    }
    case 'fastest_exam': {
      const fullExams = stats.examHistory.filter(e => e.config.mode === 'full');
      if (fullExams.length === 0) return 0;
      return Math.min(...fullExams.map(e => e.timeSpentSeconds));
    }
    case 'total_exams':
      return stats.examHistory.length;
    case 'best_grammar': {
      const g = stats.categoryStats.grammar;
      if (!g || g.answered < 5) return 0;
      return (g.correct / g.answered) * 100;
    }
    case 'best_vocabulary': {
      const v = stats.categoryStats.vocabulary;
      if (!v || v.answered < 5) return 0;
      return (v.correct / v.answered) * 100;
    }
    default:
      return 0;
  }
}

interface PersonalRecordsStore {
  records: Record<string, PersonalRecord>;
  milestones: Milestone[];

  updateRecords: (stats: UserStats, dailyRecords: DailyStudyRecord[]) => void;
  getTopRecords: () => PersonalRecord[];
  getMilestones: () => Milestone[];
  getWeeklyComparison: (dailyRecords: DailyStudyRecord[]) => WeeklyComparison;
}

export const usePersonalRecordsStore = create<PersonalRecordsStore>()(
  persist(
    (set, get) => ({
      records: {},
      milestones: [],

      updateRecords: (stats: UserStats, dailyRecords: DailyStudyRecord[]) => {
        const now = new Date().toISOString();

        set((state) => {
          const newRecords = { ...state.records };
          const newMilestones = [...state.milestones];

          for (const def of recordDefinitions) {
            const newValue = computeRecordValue(def.id, stats, dailyRecords);
            const existing = newRecords[def.id];

            const isHigherBetter = def.id !== 'fastest_exam';
            const isBetter = isHigherBetter
              ? newValue > (existing?.value || 0)
              : (newValue > 0 && (existing?.value === 0 || !existing || newValue < existing.value));

            if (isBetter && newValue > 0) {
              const oldValue = existing?.value || 0;

              // Create milestone if there was a previous value to beat
              if (existing && oldValue > 0 && oldValue !== newValue) {
                newMilestones.push({
                  id: `${def.id}_${Date.now()}`,
                  titleTr: def.titleTr,
                  icon: def.icon,
                  color: def.color,
                  achievedDate: now,
                  recordType: def.id,
                  oldValue: formatRecordValue(def.id, oldValue),
                  newValue: formatRecordValue(def.id, newValue),
                });
              }

              newRecords[def.id] = {
                id: def.id,
                titleTr: def.titleTr,
                icon: def.icon,
                color: def.color,
                value: newValue,
                displayValue: formatRecordValue(def.id, newValue),
                achievedDate: now,
              };
            } else if (!existing && newValue > 0) {
              // First time setting a record
              newRecords[def.id] = {
                id: def.id,
                titleTr: def.titleTr,
                icon: def.icon,
                color: def.color,
                value: newValue,
                displayValue: formatRecordValue(def.id, newValue),
                achievedDate: now,
              };
            }
          }

          return {
            records: newRecords,
            milestones: newMilestones.slice(-MAX_MILESTONES),
          };
        });
      },

      getTopRecords: () => {
        const records = Object.values(get().records);
        return records
          .filter(r => r.value > 0)
          .sort((a, b) => {
            // Prioritize exam score, streak, accuracy
            const priority: Record<string, number> = {
              best_exam_score: 1,
              longest_streak: 2,
              best_accuracy: 3,
              most_questions_day: 4,
              fastest_exam: 5,
              total_exams: 6,
              best_grammar: 7,
              best_vocabulary: 8,
            };
            return (priority[a.id] || 99) - (priority[b.id] || 99);
          })
          .slice(0, 3);
      },

      getMilestones: () => {
        return [...get().milestones].reverse();
      },

      getWeeklyComparison: (dailyRecords: DailyStudyRecord[]) => {
        const today = new Date();
        const currentWeekStart = new Date(today);
        currentWeekStart.setDate(today.getDate() - today.getDay());
        const previousWeekStart = new Date(currentWeekStart);
        previousWeekStart.setDate(currentWeekStart.getDate() - 7);

        const currentWeekStr = currentWeekStart.toISOString().split('T')[0];
        const previousWeekStr = previousWeekStart.toISOString().split('T')[0];

        const currentWeekRecords = dailyRecords.filter(r => r.date >= currentWeekStr);
        const previousWeekRecords = dailyRecords.filter(
          r => r.date >= previousWeekStr && r.date < currentWeekStr
        );

        const sum = (records: DailyStudyRecord[]) => ({
          questionsAnswered: records.reduce((s, r) => s + r.questionsAnswered, 0),
          questionsCorrect: records.reduce((s, r) => s + r.questionsCorrect, 0),
          studyTimeSeconds: records.reduce((s, r) => s + r.studyTimeSeconds, 0),
          accuracy: records.reduce((s, r) => s + r.questionsAnswered, 0) > 0
            ? (records.reduce((s, r) => s + r.questionsCorrect, 0) / records.reduce((s, r) => s + r.questionsAnswered, 0)) * 100
            : 0,
        });

        const current = sum(currentWeekRecords);
        const previous = sum(previousWeekRecords);

        const pctChange = (cur: number, prev: number) => {
          if (prev === 0) return cur > 0 ? 100 : 0;
          return ((cur - prev) / prev) * 100;
        };

        return {
          currentWeek: current,
          previousWeek: previous,
          changes: {
            questionsChange: pctChange(current.questionsAnswered, previous.questionsAnswered),
            accuracyChange: current.accuracy - previous.accuracy,
            studyTimeChange: pctChange(current.studyTimeSeconds, previous.studyTimeSeconds),
          },
        };
      },
    }),
    {
      name: 'yds_personal_records',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        records: state.records,
        milestones: state.milestones,
      }),
    }
  )
);

export type { WeeklyComparison };
