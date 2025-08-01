import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Dumbbell, Zap, Trophy, Clock, Play, Plus, TrendingUp, Users } from 'lucide-react-native';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHomeStats } from '@/hooks/useHomeStats';
import { useWorkoutAnalytics } from '@/hooks/useWorkoutAnalytics';
import HomeHeader from '@/components/HomeHeader';
import HomeStatsSection from '@/components/HomeStatsSection';
import HomeQuickActionsSection from '@/components/HomeQuickActionsSection';
import HomeTodaysWorkoutSection from '@/components/HomeTodaysWorkoutSection';
import HomeRecentActivitySection from '@/components/HomeRecentActivitySection';

export default function HomeScreen() {
  const { user } = useAuth();
  const { workouts, streak, personalRecords, hours, loading } = useHomeStats(user?.id || null);
  const { workoutSessions, refreshAnalytics } = useWorkoutAnalytics(user?.id || null);
  const [refreshing, setRefreshing] = useState(false);

  const stats = [
    { label: 'Workouts', value: workouts, icon: Dumbbell },
    { label: 'Streak', value: streak, icon: Zap },
    { label: 'PR\'s', value: personalRecords, icon: Trophy },
    { label: 'Hours', value: hours, icon: Clock },
  ];

  const quickActions = [
    { label: 'Start Workout', icon: Play, color: '#FF6B35' },
    { label: 'Log Exercise', icon: Plus, color: '#4A90E2' },
    { label: 'View Progress', icon: TrendingUp, color: '#27AE60' },
    { label: 'Find Friends', icon: Users, color: '#9B59B6' },
  ];

  // Get recent activity from actual workout sessions
  const getRecentActivity = () => {
    if (!workoutSessions || workoutSessions.length === 0) {
      return [
        {
          type: 'welcome',
          title: 'Welcome to FitTracker!',
          description: 'Start your first workout to see your activity here',
          date: 'Today',
          icon: 'dumbbell',
        },
      ];
    }

    return workoutSessions.slice(0, 3).map((session, index) => {
      const sessionDate = new Date(session.started_at);
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let dateLabel = 'Today';
      if (diffInDays === 1) dateLabel = 'Yesterday';
      else if (diffInDays > 1) dateLabel = `${diffInDays} days ago`;

      return {
        type: 'workout',
        title: session.name,
        description: `${session.duration_minutes || 0} minutes • ${session.calories_burned || 0} calories`,
        date: dateLabel,
        icon: 'dumbbell',
      };
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshAnalytics();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <HomeHeader />
      <HomeStatsSection stats={stats} loading={loading} />
      <HomeQuickActionsSection quickActions={quickActions} />
      <HomeTodaysWorkoutSection />
      <HomeRecentActivitySection activities={getRecentActivity()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
});