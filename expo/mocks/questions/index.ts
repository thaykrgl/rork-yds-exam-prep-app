import { Question, StudyCategory } from '@/types';
import { vocabularyQuestions } from './vocabulary';
import { grammarQuestions } from './grammar';
import { paragraphQuestions } from './paragraph';
import { translationQuestions } from './translation';
import { clozeQuestions } from './cloze';
import { readingQuestions } from './reading';

export const questions: Question[] = [
  ...vocabularyQuestions,
  ...grammarQuestions,
  ...paragraphQuestions,
  ...translationQuestions,
  ...clozeQuestions,
  ...readingQuestions,
];

export const studyCategories: StudyCategory[] = [
  { id: 'vocabulary', title: 'Vocabulary', titleTr: 'Kelime Bilgisi', icon: 'BookOpen', color: '#3B82F6', questionCount: vocabularyQuestions.length },
  { id: 'grammar', title: 'Grammar', titleTr: 'Dilbilgisi', icon: 'PenTool', color: '#8B5CF6', questionCount: grammarQuestions.length },
  { id: 'paragraph', title: 'Paragraph', titleTr: 'Paragraf Tamamlama', icon: 'FileText', color: '#10B981', questionCount: paragraphQuestions.length },
  { id: 'translation', title: 'Translation', titleTr: 'Çeviri', icon: 'Languages', color: '#F59E0B', questionCount: translationQuestions.length },
  { id: 'cloze', title: 'Cloze Test', titleTr: 'Boşluk Doldurma', icon: 'PuzzleIcon', color: '#EF4444', questionCount: clozeQuestions.length },
  { id: 'reading', title: 'Reading', titleTr: 'Okuduğunu Anlama', icon: 'Newspaper', color: '#14B8A6', questionCount: readingQuestions.length },
];

export { vocabularyQuestions, grammarQuestions, paragraphQuestions, translationQuestions, clozeQuestions, readingQuestions };
