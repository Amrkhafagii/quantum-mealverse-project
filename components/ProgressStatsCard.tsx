import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Video as LucideIcon } from 'lucide-react-native';

interface ProgressStatsCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color: string;
}

export default function ProgressStatsCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color,
}: ProgressStatsCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return '#27AE60';
      case 'negative':
        return '#E74C3C';
      default:
        return '#999';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Icon size={20} color={color} />
        </View>
        <Text style={styles.value}>{value}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
      {change && (
        <Text style={[styles.change, { color: getChangeColor() }]}>
          {change}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
    flex: 1,
    marginHorizontal: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  value: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  label: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  change: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});