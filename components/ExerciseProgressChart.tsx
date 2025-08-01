import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ExerciseProgressData {
  date: string;
  value: number;
  sessionId: number;
}

interface ExerciseProgressChartProps {
  data: ExerciseProgressData[];
  title: string;
  subtitle?: string;
  color?: string;
  unit?: string;
  chartType?: 'line' | 'bar';
  height?: number;
}

const screenWidth = Dimensions.get('window').width;

export default function ExerciseProgressChart({
  data,
  title,
  subtitle,
  color = '#FF6B35',
  unit = '',
  chartType = 'line',
  height = 120,
}: ExerciseProgressChartProps) {
  if (data.length === 0) {
    return null;
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value));
  const chartWidth = screenWidth - 80;
  const pointWidth = Math.max(8, (chartWidth - (data.length - 1) * 4) / data.length);

  const formatValue = (value: number) => {
    if (unit === 'kg' && value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const getProgressTrend = () => {
    if (data.length < 2) return 'neutral';
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const change = ((lastValue - firstValue) / firstValue) * 100;
    
    if (change > 5) return 'positive';
    if (change < -5) return 'negative';
    return 'neutral';
  };

  const getTrendColor = () => {
    const trend = getProgressTrend();
    switch (trend) {
      case 'positive':
        return '#27AE60';
      case 'negative':
        return '#E74C3C';
      default:
        return '#999';
    }
  };

  const getTrendText = () => {
    if (data.length < 2) return 'Not enough data';
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const change = ((lastValue - firstValue) / firstValue) * 100;
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}% from start`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.trendContainer}>
          <Text style={[styles.trendText, { color: getTrendColor() }]}>
            {getTrendText()}
          </Text>
        </View>
      </View>
      
      <View style={[styles.chart, { height }]}>
        {chartType === 'line' ? (
          <View style={styles.lineChart}>
            {data.map((point, index) => {
              const x = (index / (data.length - 1)) * (chartWidth - 20);
              const y = height - 40 - ((point.value - minValue) / (maxValue - minValue)) * (height - 60);
              
              return (
                <View
                  key={index}
                  style={[
                    styles.dataPoint,
                    {
                      left: x,
                      top: y,
                      backgroundColor: color,
                    },
                  ]}
                />
              );
            })}
            
            {/* Connect points with lines */}
            {data.map((point, index) => {
              if (index === data.length - 1) return null;
              
              const x1 = (index / (data.length - 1)) * (chartWidth - 20);
              const y1 = height - 40 - ((point.value - minValue) / (maxValue - minValue)) * (height - 60);
              const x2 = ((index + 1) / (data.length - 1)) * (chartWidth - 20);
              const y2 = height - 40 - ((data[index + 1].value - minValue) / (maxValue - minValue)) * (height - 60);
              
              const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
              const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
              
              return (
                <View
                  key={`line-${index}`}
                  style={[
                    styles.connectionLine,
                    {
                      left: x1,
                      top: y1,
                      width: length,
                      transform: [{ rotate: `${angle}deg` }],
                      backgroundColor: color,
                    },
                  ]}
                />
              );
            })}
          </View>
        ) : (
          <View style={styles.barChart}>
            {data.map((point, index) => (
              <View key={index} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: pointWidth,
                      height: `${(point.value / maxValue) * 80}%`,
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        )}
      </View>
      
      <View style={styles.xAxis}>
        {data.map((point, index) => {
          // Show every nth label to avoid crowding
          const showLabel = data.length <= 7 || index % Math.ceil(data.length / 5) === 0;
          return (
            <Text
              key={index}
              style={[
                styles.xAxisLabel,
                { opacity: showLabel ? 1 : 0 },
              ]}
            >
              {formatDate(point.date)}
            </Text>
          );
        })}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Max: {formatValue(maxValue)} {unit}
        </Text>
        <Text style={styles.footerText}>
          Latest: {formatValue(data[data.length - 1].value)} {unit}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
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
  trendContainer: {
    alignItems: 'flex-end',
  },
  trendText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  chart: {
    position: 'relative',
    marginBottom: 16,
  },
  lineChart: {
    position: 'relative',
    height: '100%',
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 2,
  },
  connectionLine: {
    position: 'absolute',
    height: 2,
    zIndex: 1,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingHorizontal: 4,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    height: '80%',
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  xAxisLabel: {
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