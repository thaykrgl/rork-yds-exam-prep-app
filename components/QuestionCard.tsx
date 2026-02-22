import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { CheckCircle, XCircle, Flag } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { Question, Passage } from '@/types';

interface QuestionCardProps {
  question: Question;
  selectedAnswer: number | null;
  isAnswered: boolean;
  examMode?: boolean;
  isFlagged?: boolean;
  onSelectAnswer: (index: number) => void;
  passage?: Passage;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export default function QuestionCard({
  question,
  selectedAnswer,
  isAnswered,
  examMode = false,
  isFlagged = false,
  onSelectAnswer,
  passage,
}: QuestionCardProps) {
  const colors = useColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const difficultyConfig = {
    easy: { label: 'Kolay', color: colors.success },
    medium: { label: 'Orta', color: colors.warning },
    hard: { label: 'Zor', color: colors.error },
  };

  const difficulty = difficultyConfig[question.difficulty];

  const getOptionStyle = (index: number) => {
    if (!isAnswered && selectedAnswer === index && examMode) {
      return styles.optionSelected;
    }
    if (!isAnswered || examMode) return styles.optionDefault;
    if (index === question.correctAnswer) return styles.optionCorrect;
    if (index === selectedAnswer) return styles.optionWrong;
    return styles.optionDefault;
  };

  const getOptionTextStyle = (index: number) => {
    if (!isAnswered && selectedAnswer === index && examMode) {
      return styles.optionTextSelected;
    }
    if (!isAnswered || examMode) return styles.optionTextDefault;
    if (index === question.correctAnswer) return styles.optionTextCorrect;
    if (index === selectedAnswer) return styles.optionTextWrong;
    return styles.optionTextDefault;
  };

  const getLetterStyle = (index: number) => {
    if (!isAnswered && selectedAnswer === index && examMode) {
      return styles.letterSelected;
    }
    if (!isAnswered || examMode) return styles.letterDefault;
    if (index === question.correctAnswer) return styles.letterCorrect;
    if (index === selectedAnswer) return styles.letterWrong;
    return styles.letterDefault;
  };

  return (
    <View style={styles.container}>
      {/* Passage for reading questions */}
      {passage && (
        <View style={styles.passageContainer}>
          {passage.title && (
            <Text style={styles.passageTitle}>{passage.title}</Text>
          )}
          <ScrollView style={styles.passageScroll} nestedScrollEnabled>
            <Text style={styles.passageText}>{passage.text}</Text>
          </ScrollView>
        </View>
      )}

      {/* Category and difficulty badges */}
      <View style={styles.badgeRow}>
        <View style={[styles.badge, { backgroundColor: difficulty.color + '20' }]}>
          <Text style={[styles.badgeText, { color: difficulty.color }]}>{difficulty.label}</Text>
        </View>
        {isFlagged && (
          <View style={styles.flagBadge}>
            <Flag size={12} color={colors.warning} fill={colors.warning} />
            <Text style={styles.flagText}>İşaretli</Text>
          </View>
        )}
      </View>

      {/* Question text */}
      <Text style={styles.questionText}>{question.question}</Text>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => {
          const disabled = examMode ? false : isAnswered;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.option, getOptionStyle(index)]}
              onPress={() => onSelectAnswer(index)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <View style={[styles.letterContainer, getLetterStyle(index)]}>
                <Text style={[styles.letterText, getOptionTextStyle(index)]}>
                  {OPTION_LETTERS[index]}
                </Text>
              </View>
              <Text style={[styles.optionText, getOptionTextStyle(index)]} numberOfLines={3}>
                {option}
              </Text>
              {!examMode && isAnswered && index === question.correctAnswer && (
                <CheckCircle size={20} color={colors.success} style={styles.icon} />
              )}
              {!examMode && isAnswered && index === selectedAnswer && index !== question.correctAnswer && (
                <XCircle size={20} color={colors.error} style={styles.icon} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Explanation (practice mode only, after answering) */}
      {!examMode && isAnswered && (
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>Açıklama</Text>
          <Text style={styles.explanationText}>{question.explanation}</Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  passageContainer: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    maxHeight: 250,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  passageTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  passageScroll: {
    maxHeight: 200,
  },
  passageText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  flagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.warning + '20',
  },
  flagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.warning,
  },
  questionText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 26,
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  optionDefault: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  optionSelected: {
    backgroundColor: colors.accent + '15',
    borderColor: colors.accent,
  },
  optionCorrect: {
    backgroundColor: colors.success + '10',
    borderColor: colors.success,
  },
  optionWrong: {
    backgroundColor: colors.error + '10',
    borderColor: colors.error,
  },
  letterContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  letterDefault: {
    backgroundColor: colors.surfaceAlt,
  },
  letterSelected: {
    backgroundColor: colors.accent,
  },
  letterCorrect: {
    backgroundColor: colors.success,
  },
  letterWrong: {
    backgroundColor: colors.error,
  },
  letterText: {
    fontSize: 14,
    fontWeight: '700',
  },
  optionTextDefault: {
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.accent,
  },
  optionTextCorrect: {
    color: colors.success,
  },
  optionTextWrong: {
    color: colors.error,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  icon: {
    marginLeft: 8,
  },
  explanationContainer: {
    marginTop: 16,
    padding: 14,
    backgroundColor: colors.accent + '10',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  explanationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 6,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  },
});
