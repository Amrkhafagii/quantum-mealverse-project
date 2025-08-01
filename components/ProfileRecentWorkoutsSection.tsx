import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, Target } from 'lucide-react-native';

interface RecentWorkout {
  name: string;
  date: string;
  duration: string;
  calories: number;
}

interface ProfileRecentWorkoutsSectionProps {
  recentWorkouts: RecentWorkout[];
  onSeeAllPress: () => void;
}

export default function ProfileRecentWorkoutsSection({ 
  recentWorkouts, 
  onSeeAllPress 
}: ProfileRecentWorkoutsSectionProps) {
  return (
    <View style={styles.recentActivityContainer}>
      <Text style={styles.sectionTitle}>Recent Workouts</Text>
      {recentWorkouts.map((workout, index) => (
        <View key={index} style={styles.workoutCard}>
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutName}>{workout.name}</Text>
            <Text style={styles.workoutDate}>{workout.date}</Text>
          </View>
          <View style={styles.workoutStats}>
            <View style={styles.workoutStat}>
              <Text style={styles.workoutStatValue}>{workout.duration}</Text>
              <Text style={styles.workoutStatLabel}>Duration</Text>
            </View>
            <View style={styles.workoutStat}>
              <Text style={styles.workoutStatValue}>{workout.calories}</Text>
              <Text style={styles.workoutStatLabel}>Calories</Text>
            </View>
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.seeAllButton} onPress={onSeeAllPress}>
        <Text style={styles.seeAllText}>See All Workouts</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  recentActivityContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  workoutCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  workoutDate: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  workoutStats: {
    flexDirection: 'row',
  },
  workoutStat: {
    alignItems: 'center',
    marginLeft: 20,
  },
  workoutStatValue: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  workoutStatLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  seeAllButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF6B35',
    fontFamily: 'Inter-SemiBold',
  },
});