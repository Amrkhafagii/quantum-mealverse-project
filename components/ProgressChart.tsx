import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ProgressChartProps {
  data: number[];
  title: string;
  subtitle?: string;
  color?: string;
  height?: number;
  showLabels?: boolean;
  labelFormatter?: (index: number) => string;
}

const screenWidth = Dimensions.get('window').width;

export default function ProgressChart({
  data,
  title,
  subtitle,
  color = '#FF6B35',
  height = 120,
  showLabels = true,
  labelFormatter,
}: ProgressChartProps) {
  const maxValue = Math.max(...data, 1); // Prevent division by zero
  const chartWidth = screenWidth - 80; // Account for padding
  const barWidth = Math.max(8, (chartWidth - (data.length - 1) * 4) / data.length);

  const defaultLabelFormatter = (index: number) => {
    if (data.length === 7) {
      const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      return days[index];
    } else if (data.length === 30) {
      return index % 5 === 0 ? (index + 1).toString() : '';
    }
    return (index + 1).toString();
  };

  const formatLabel = labelFormatter || defaultLabelFormatter;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      
      <View style={[styles.chart, { height }]}>
        <View style={styles.barsContainer}>
          {data.map((value, index) => (
            <View key={index} style={styles.barContainer}>
              <View style={[styles.bar, { width: barWidth }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: maxValue > 0 ? `${(value / maxValue) * 100}%` : '0%',
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
              {showLabels && (
                <Text style={styles.barLabel}>{formatLabel(index)}</Text>
              )}
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Max: {Math.max(...data)} min
        </Text>
        <Text style={styles.footerText}>
          Avg: {data.length > 0 ? Math.round(data.reduce((a, b) => a + b, 0) / data.length) : 0} min
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  chart: {
    marginBottom: 16,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingHorizontal: 4,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: 8,
    height: '80%',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    borderRadius: 4,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
});