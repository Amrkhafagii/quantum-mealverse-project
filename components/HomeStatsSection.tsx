import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dumbbell, Zap, Trophy, Clock } from 'lucide-react-native';

interface StatItem {
  label: string;
  value: string;
  icon: React.ComponentType<any>;
}

interface HomeStatsSectionProps {
  stats: StatItem[];
  loading?: boolean;
}

export default function HomeStatsSection({ stats, loading }: HomeStatsSectionProps) {
  return (
    <View style={styles.statsContainer}>
      <Text style={styles.sectionTitle}>This Month</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statIcon}>
              <stat.icon size={24} color="#FF6B35" />
            </View>
            <Text style={styles.statValue}>
              {loading ? '...' : stat.value}
            </Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
});