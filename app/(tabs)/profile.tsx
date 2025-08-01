import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Target, Zap, Users, Trophy, Medal, Calendar, Calculator } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileHeader from '@/components/ProfileHeader';
import ProfileStatsGrid from '@/components/ProfileStatsGrid';
import ProfileAchievementsSection from '@/components/ProfileAchievementsSection';
import ProfileRecentWorkoutsSection from '@/components/ProfileRecentWorkoutsSection';
import ProfilePersonalRecordsSection from '@/components/ProfilePersonalRecordsSection';
import ProfilePreferencesSection from '@/components/ProfilePreferencesSection';
import ProfileLogoutButton from '@/components/ProfileLogoutButton';
import TDEECalculator from '@/components/TDEECalculator';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const [showTDEECalculator, setShowTDEECalculator] = useState(false);

  const stats = [
    { label: 'Workouts', value: '127', icon: Target },
    { label: 'Streak', value: '14', icon: Zap },
    { label: 'Friends', value: '48', icon: Users },
    { label: 'Achievements', value: '23', icon: Trophy },
  ];

  const achievements = [
    { title: 'First Workout', icon: Medal, color: '#4A90E2' },
    { title: 'Week Warrior', icon: Calendar, color: '#27AE60' },
    { title: 'Consistency King', icon: Zap, color: '#FF6B35' },
    { title: 'Heavy Lifter', icon: Trophy, color: '#9B59B6' },
    { title: 'Social Butterfly', icon: Users, color: '#E74C3C' },
    { title: 'Goal Crusher', icon: Target, color: '#F39C12' },
  ];

  const recentWorkouts = [
    { name: 'Push Day', date: 'Today', duration: '45 min', calories: 245 },
    { name: 'Full Body', date: 'Yesterday', duration: '52 min', calories: 312 },
    { name: 'Leg Day', date: '2 days ago', duration: '48 min', calories: 298 },
  ];

  const personalRecords = [
    { exercise: 'Bench Press', weight: '185 lbs' },
    { exercise: 'Deadlift', weight: '225 lbs' },
    { exercise: 'Squat', weight: '200 lbs' },
    { exercise: 'OHP', weight: '95 lbs' },
  ];

  // Dynamic preferences based on profile data
  const preferences = [
    { label: 'Workout Reminders', value: 'Daily at 6:00 PM' },
    { 
      label: 'Units', 
      value: profile?.preferred_units === 'imperial' ? 'Imperial (lbs)' : 'Metric (kg)' 
    },
    { 
      label: 'Privacy', 
      value: profile?.is_public ? 'Public Profile' : 'Private Profile' 
    },
    { label: 'Notifications', value: 'Enabled' },
    { 
      label: 'TDEE Calculator', 
      value: 'Calculate daily calories',
      action: () => setShowTDEECalculator(true),
      icon: Calculator,
      color: '#FF6B35'
    },
  ];

  const handleSettingsPress = () => {
    console.log('Settings pressed');
  };

  const handleEditProfilePress = () => {
    router.push('/(tabs)/edit-profile');
  };

  const handleShareProfilePress = () => {
    console.log('Share profile pressed');
  };

  const handleSeeAllWorkoutsPress = () => {
    console.log('See all workouts pressed');
  };

  const handlePreferencePress = (index: number) => {
    const preference = preferences[index];
    if (preference.action) {
      preference.action();
    } else {
      console.log('Preference pressed:', index);
    }
  };

  const handleLogoutPress = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Get display values from profile or fallbacks
  const displayName = profile?.full_name || profile?.username || 'User';
  const displayHandle = profile?.username ? `@${profile.username}` : '@user';
  const displayBio = profile?.bio || 'No bio available. Edit your profile to add one!';
  const displayAvatar = profile?.avatar_url || 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2';

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ProfileHeader
          userName={displayName}
          userHandle={displayHandle}
          userBio={displayBio}
          profileImageUrl={displayAvatar}
          onSettingsPress={handleSettingsPress}
          onEditProfilePress={handleEditProfilePress}
          onShareProfilePress={handleShareProfilePress}
        />

        <ProfileStatsGrid stats={stats} />

        <ProfileAchievementsSection achievements={achievements} />

        <ProfileRecentWorkoutsSection 
          recentWorkouts={recentWorkouts}
          onSeeAllPress={handleSeeAllWorkoutsPress}
        />

        <ProfilePersonalRecordsSection personalRecords={personalRecords} />

        <ProfilePreferencesSection 
          preferences={preferences}
          onPreferencePress={handlePreferencePress}
        />

        <ProfileLogoutButton onLogoutPress={handleLogoutPress} />
      </ScrollView>

      <TDEECalculator
        visible={showTDEECalculator}
        onClose={() => setShowTDEECalculator(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
});