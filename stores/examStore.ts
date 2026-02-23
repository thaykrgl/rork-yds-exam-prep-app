import { create } from 'zustand';
import { ExamAnswer, ExamConfig, ExamResult, CategoryBreakdown, Question, QuestionCategory } from '@/types';
import { calculateEstimatedYDSScore } from '@/utils/examUtils';

interface ExamStore {
  isActive: boolean;
  config: ExamConfig | null;
  questions: Question[];
  answers: ExamAnswer[];
  currentIndex: number;
  startTime: number | null;
  elapsedSeconds: number;

  startExam: (config: ExamConfig, questions: Question[]) => void;
  setAnswer: (questionId: string, answerIndex: number) => void;
  toggleFlag: (questionId: string) => void;
  navigateTo: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  updateElapsed: (seconds: number) => void;
  submitExam: () => ExamResult;
  clearExam: () => void;
}

export const useExamStore = create<ExamStore>((set, get) => ({
  isActive: false,
  config: null,
  questions: [],
  answers: [],
  currentIndex: 0,
  startTime: null,
  elapsedSeconds: 0,

  startExam: (config, questions) => {
    const answers: ExamAnswer[] = questions.map(q => ({
      questionId: q.id,
      selectedAnswer: null,
      isFlagged: false,
    }));
    set({
      isActive: true,
      config,
      questions,
      answers,
      currentIndex: 0,
      startTime: Date.now(),
      elapsedSeconds: 0,
    });
  },

  setAnswer: (questionId, answerIndex) => {
    set(state => ({
      answers: state.answers.map(a =>
        a.questionId === questionId ? { ...a, selectedAnswer: answerIndex } : a
      ),
    }));
  },

  toggleFlag: (questionId) => {
    set(state => ({
      answers: state.answers.map(a =>
        a.questionId === questionId ? { ...a, isFlagged: !a.isFlagged } : a
      ),
    }));
  },

  navigateTo: (index) => {
    const state = get();
    if (index >= 0 && index < state.questions.length) {
      set({ currentIndex: index });
    }
  },

  nextQuestion: () => {
    const state = get();
    if (state.currentIndex < state.questions.length - 1) {
      set({ currentIndex: state.currentIndex + 1 });
    }
  },

  prevQuestion: () => {
    const state = get();
    if (state.currentIndex > 0) {
      set({ currentIndex: state.currentIndex - 1 });
    }
  },

  updateElapsed: (seconds) => {
    set({ elapsedSeconds: seconds });
  },

  submitExam: () => {
    const state = get();
    const { questions, answers, config, startTime } = state;

    if (!config) throw new Error('No exam config');

    // Calculate score
    let score = 0;
    answers.forEach(answer => {
      if (answer.selectedAnswer === null) return;
      const question = questions.find(q => q.id === answer.questionId);
      if (question && answer.selectedAnswer === question.correctAnswer) {
        score++;
      }
    });

    // Calculate category breakdown
    const categoryMap = new Map<QuestionCategory, { total: number; correct: number }>();
    questions.forEach(q => {
      if (!categoryMap.has(q.category)) {
        categoryMap.set(q.category, { total: 0, correct: 0 });
      }
      const cat = categoryMap.get(q.category)!;
      cat.total++;
      const answer = answers.find(a => a.questionId === q.id);
      if (answer?.selectedAnswer === q.correctAnswer) {
        cat.correct++;
      }
    });

    const categoryBreakdown: CategoryBreakdown[] = Array.from(categoryMap.entries()).map(
      ([category, data]) => ({
        category,
        total: data.total,
        correct: data.correct,
        percentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      })
    );

    const timeSpentSeconds = startTime ? Math.round((Date.now() - startTime) / 1000) : state.elapsedSeconds;

    // Estimated YDS score (difficulty-weighted with category balance)
    const ydsResult = calculateEstimatedYDSScore(questions, answers, categoryBreakdown);
    const estimatedYDSScore = ydsResult.score;

    const result: ExamResult = {
      id: `exam_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
      config,
      answers,
      score,
      totalQuestions: questions.length,
      timeSpentSeconds,
      categoryBreakdown,
      estimatedYDSScore,
    };

    // Clear exam state
    set({
      isActive: false,
      config: null,
      questions: [],
      answers: [],
      currentIndex: 0,
      startTime: null,
      elapsedSeconds: 0,
    });

    return result;
  },

  clearExam: () => {
    set({
      isActive: false,
      config: null,
      questions: [],
      answers: [],
      currentIndex: 0,
      startTime: null,
      elapsedSeconds: 0,
    });
  },
}));
