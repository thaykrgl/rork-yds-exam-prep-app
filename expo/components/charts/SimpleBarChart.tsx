import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface SimpleBarChartProps {
  data: BarData[];
  height?: number;
  maxValue?: number;
}

export default function SimpleBarChart({ data, height = 120, maxValue }: SimpleBarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  return (
    <View style={styles.container}>
      <View style={[styles.barsContainer, { height }]}>
        {data.map((item, index) => {
          const barHeight = max > 0 ? (item.value / max) * height : 0;
          return (
            <View key={index} style={styles.barWrapper}>
              <Text style={styles.barValue}>{item.value}</Text>
              <View style={[styles.bar, {
                height: Math.max(barHeight, 2),
                backgroundColor: item.color || Colors.accent,
              }]} />
            </View>
          );
        })}
      </View>
      <View style={styles.labelsRow}>
        {data.map((item, index) => (
          <View key={index} style={styles.labelWrapper}>
            <Text style={styles.label} numberOfLines={1}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 4,
  },
  bar: {
    width: '80%',
    borderRadius: 4,
    minWidth: 16,
    maxWidth: 40,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  labelWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  label: {
    fontSize: 10,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
