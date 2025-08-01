import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Dumbbell, Zap, Target, Clock, Trophy } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkoutAnalytics } from '@/hooks/useWorkoutAnalytics';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import ProgressStatsCard from '@/components/ProgressStatsCard';
import ProgressChart from '@/components/ProgressChart';
import StreakDisplay from '@/components/StreakDisplay';
import PersonalRecordsSection from '@/components/PersonalRecordsSection';

export default function ProgressScreen() {
  const { user } = useAuth();
  const { 
    workoutSessions, 
    streak, 
    stats, 
    personalRecordsCount,
    weeklyProgress, 
    monthlyProgress, 
    loading, 
    error,
    refreshAnalytics 
  } = useWorkoutAnalytics(user?.id || null);
  
  const { 
    personalRecords, 
    loading: recordsLoading,
    refreshRecords 
  } = usePersonalRecords(user?.id || null);

  const handleRefresh = async () => {
    await Promise.all([
      refreshAnalytics(),
      refreshRecords(),
    ]);
  };

  const getChangeText = (current: number, previous: number, unit: string = '') => {
    const diff = current - previous;
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff}${unit} this week`;
  };

  const getChangeType = (current: number, previous: number): 'positive' | 'negative' | 'neutral' => {
    if (current > previous) return 'positive';
    if (current < previous) return 'negative';
    return 'neutral';
  };

  // Calculate previous week stats for comparison
  const previousWeekWorkouts = Math.max(0, stats.workoutsThisMonth - stats.workoutsThisWeek);
  const previousWeekDuration = Math.max(0, stats.totalDuration - weeklyProgress.reduce((a, b) => a + b, 0));

  const statsData = [
    {
      label: 'Total Workouts',
      value: stats.totalWorkouts.toString(),
      change: getChangeText(stats.workoutsThisWeek, previousWeekWorkouts),
      changeType: getChangeType(stats.workoutsThisWeek, previousWeekWorkouts),
      icon: Dumbbell,
      color: '#FF6B35',
    },
    {
      label: 'Current Streak',
      value: `${streak?.current_streak || 0} days`,
      change: streak?.current_streak === streak?.longest_streak && (streak?.current_streak || 0) > 0 ? 'Personal best!' : undefined,
      changeType: 'positive' as const,
      icon: Zap,
      color: '#27AE60',
    },
    {
      label: 'Personal Records',
      value: personalRecordsCount.toString(),
      change: personalRecordsCount > 0 ? `${personalRecordsCount} total` : 'None yet',
      changeType: 'neutral' as const,
      icon: Target,
      color: '#4A90E2',
    },
    {
      label: 'Total Time',
      value: `${Math.floor(stats.totalDuration / 60)}h ${stats.totalDuration % 60}m`,
      change: getChangeText(weeklyProgress.reduce((a, b) => a + b, 0), previousWeekDuration, ' min'),
      changeType: getChangeType(weeklyProgress.reduce((a, b) => a + b, 0), previousWeekDuration),
      icon: Clock,
      color: '#9B59B6',
    },
  ];

  if (error) {
    return (
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
          <Text style={styles.headerTitle}>Progress</Text>
          <Text style={styles.headerSubtitle}>Track your fitness journey</Text>
        </LinearGradient>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
      }
    >
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
        <Text style={styles.headerTitle}>Progress</Text>
        <Text style={styles.headerSubtitle}>Track your fitness journey</Text>
      </LinearGradient>

      {/* Streak Display */}
      <StreakDisplay streak={streak} loading={loading} />

      {/* Overview Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          {statsData.map((stat, index) => (
            <ProgressStatsCard
              key={index}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </View>
      </View>

      {/* Weekly Progress Chart */}
      {weeklyProgress.length > 0 && (
        <View style={styles.chartContainer}>
          <ProgressChart
            data={weeklyProgress}
            title="Weekly Activity"
            subtitle="Workout duration (minutes) for the last 7 days"
            color="#FF6B35"
            height={120}
            labelFormatter={(index) => {
              const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const today = new Date().getDay();
              const dayIndex = (today - 6 + index + 7) % 7;
              return days[dayIndex];
            }}
          />
        </View>
      )}

      {/* Monthly Progress Chart */}
      {monthlyProgress.length > 0 && (
        <View style={styles.chartContainer}>
          <ProgressChart
            data={monthlyProgress}
            title="Monthly Activity"
            subtitle="Workout duration (minutes) for the last 30 days"
            color="#4A90E2"
            height={100}
            showLabels={false}
          />
        </View>
      )}

      {/* Personal Records Section */}
      <PersonalRecordsSection
        personalRecords={personalRecords}
        loading={recordsLoading}
        onRecordPress={(record) => console.log('Record pressed:', record)}
      />

      {/* Workout Summary */}
      {workoutSessions.length > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Workout Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Average Duration</Text>
              <Text style={styles.summaryValue}>{stats.averageDuration} min</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Average Calories</Text>
              <Text style={styles.summaryValue}>{stats.averageCalories} cal</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Longest Session</Text>
              <Text style={styles.summaryValue}>{stats.longestSession} min</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>This Month</Text>
              <Text style={styles.summaryValue}>{stats.workoutsThisMonth} workouts</Text>
            </View>
          </View>
        </View>
      )}

      {/* Motivation Section */}
      {stats.totalWorkouts > 0 && (
        <View style={styles.motivationContainer}>
          <LinearGradient colors={['#FF6B35', '#FF8C42']} style={styles.motivationCard}>
            <TrendingUp size={32} color="#fff" />
            <Text style={styles.motivationTitle}>Keep it up! 🎉</Text>
            <Text style={styles.motivationText}>
              {stats.workoutsThisWeek > 0 
                ? `You've completed ${stats.workoutsThisWeek} workout${stats.workoutsThisWeek > 1 ? 's' : ''} this week. You're building great habits!`
                : "Ready to start a new week? Your next workout is waiting!"
              }
            </Text>
          </LinearGradient>
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#E74C3C20',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
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
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  chartContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  summaryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
  },
  summaryValue: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  motivationContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  motivationCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  motivationTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 12,
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  bottomSpacer: {
    height: 100,
  },
});