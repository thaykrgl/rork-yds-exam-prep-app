import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

interface DataPoint {
  label: string;
  value: number;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
}

export default function SimpleLineChart({ data, height = 120, color = Colors.accent }: SimpleLineChartProps) {
  if (data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.emptyText}>Henüz veri yok</Text>
      </View>
    );
  }

  const max = Math.max(...data.map(d => d.value), 1);
  const min = 0;
  const range = max - min || 1;

  return (
    <View style={styles.container}>
      <View style={[styles.chartArea, { height }]}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <View key={i} style={[styles.gridLine, { bottom: ratio * height }]} />
        ))}

        {/* Data points and connectors */}
        <View style={styles.pointsRow}>
          {data.map((point, index) => {
            const y = ((point.value - min) / range) * (height - 20);
            return (
              <View key={index} style={[styles.pointColumn, { height }]}>
                <View style={[styles.point, {
                  backgroundColor: color,
                  bottom: y,
                }]}>
                  <Text style={[styles.pointValue, { color }]}>{point.value}</Text>
                </View>
                {/* Vertical line from bottom to point */}
                <View style={[styles.pointLine, {
                  height: y + 4,
                  backgroundColor: color + '30',
                }]} />
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.labelsRow}>
        {data.map((point, index) => (
          <View key={index} style={styles.labelWrapper}>
            <Text style={styles.label} numberOfLines={1}>{point.label}</Text>
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
  chartArea: {
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.border + '50',
  },
  pointsRow: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
  },
  pointColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  point: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    zIndex: 2,
  },
  pointValue: {
    position: 'absolute',
    bottom: 12,
    fontSize: 10,
    fontWeight: '600',
    width: 30,
    textAlign: 'center',
    left: -11,
  },
  pointLine: {
    width: 2,
    borderRadius: 1,
    position: 'absolute',
    bottom: 0,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  labelWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    color: Colors.textLight,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textLight,
    fontSize: 14,
    marginTop: 40,
  },
});
