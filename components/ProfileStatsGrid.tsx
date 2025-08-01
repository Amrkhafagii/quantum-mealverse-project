import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatItem {
  label: string;
  value: string;
  icon: React.ComponentType<any>;
}

interface ProfileStatsGridProps {
  stats: StatItem[];
}

export default function ProfileStatsGrid({ stats }: ProfileStatsGridProps) {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statIcon}>
              <stat.icon size={20} color="#FF6B35" />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '23%',
    borderWidth: 1,
    borderColor: '#333',
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
});