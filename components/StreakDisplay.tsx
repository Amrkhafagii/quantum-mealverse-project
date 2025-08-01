import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Calendar, Trophy } from 'lucide-react-native';
import { WorkoutStreak } from '@/lib/supabase';

interface StreakDisplayProps {
  streak: WorkoutStreak | null;
  loading?: boolean;
}

export default function StreakDisplay({ streak, loading }: StreakDisplayProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading streak...</Text>
      </View>
    );
  }

  if (!streak) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Zap size={32} color="#666" />
          <Text style={styles.emptyTitle}>No Streak Yet</Text>
          <Text style={styles.emptyText}>Complete your first workout to start building your streak!</Text>
        </View>
      </View>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getStreakMessage = () => {
    if (streak.current_streak === 0) {
      return "Time to get back on track!";
    } else if (streak.current_streak === 1) {
      return "Great start! Keep it going!";
    } else if (streak.current_streak < 7) {
      return "Building momentum!";
    } else if (streak.current_streak < 30) {
      return "You're on fire! 🔥";
    } else {
      return "Incredible dedication! 🏆";
    }
  };

  const isPersonalBest = streak.current_streak === streak.longest_streak && streak.current_streak > 0;

  return (
    <LinearGradient
      colors={streak.current_streak > 0 ? ['#FF6B35', '#FF8C42'] : ['#333', '#444']}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Zap size={32} color="#fff" />
        </View>
        <View style={styles.streakInfo}>
          <Text style={styles.streakNumber}>{streak.current_streak}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </View>
        {isPersonalBest && (
          <View style={styles.badgeContainer}>
            <Trophy size={20} color="#FFD700" />
            <Text style={styles.badgeText}>PB!</Text>
          </View>
        )}
      </View>

      <Text style={styles.streakMessage}>{getStreakMessage()}</Text>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Calendar size={16} color="#fff" />
          <Text style={styles.statLabel}>Longest</Text>
          <Text style={styles.statValue}>{streak.longest_streak} days</Text>
        </View>
        <View style={styles.statItem}>
          <Calendar size={16} color="#fff" />
          <Text style={styles.statLabel}>Last Workout</Text>
          <Text style={styles.statValue}>{formatDate(streak.last_workout_date)}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 16,
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 36,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    lineHeight: 40,
  },
  streakLabel: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    opacity: 0.9,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    color: '#FFD700',
    fontFamily: 'Inter-Bold',
    marginLeft: 4,
  },
  streakMessage: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    marginBottom: 20,
    opacity: 0.9,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
    marginBottom: 2,
    opacity: 0.8,
  },
  statValue: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    padding: 40,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});