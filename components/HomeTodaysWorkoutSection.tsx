import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Play } from 'lucide-react-native';

export default function HomeTodaysWorkoutSection() {
  const handleStartWorkout = () => {
    // Navigate to the specific workout detail page
    // For now, we'll navigate to workouts tab since we don't have a specific workout ID
    // In a real app, you'd have a "today's workout" ID to navigate to
    router.push('/(tabs)/workouts');
  };

  return (
    <View style={styles.todayWorkoutContainer}>
      <Text style={styles.sectionTitle}>Today's Workout</Text>
      <View style={styles.workoutCard}>
        <View style={styles.workoutHeader}>
          <Text style={styles.workoutTitle}>Push Day</Text>
          <Text style={styles.workoutDuration}>45 min</Text>
        </View>
        <Text style={styles.workoutDescription}>
          Chest, Shoulders & Triceps
        </Text>
        <View style={styles.workoutExercises}>
          <Text style={styles.exerciseText}>• Bench Press</Text>
          <Text style={styles.exerciseText}>• Shoulder Press</Text>
          <Text style={styles.exerciseText}>• Tricep Dips</Text>
          <Text style={styles.exerciseText}>• Push-ups</Text>
        </View>
        <TouchableOpacity 
          style={styles.startWorkoutButton}
          onPress={handleStartWorkout}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF6B35', '#FF8C42']}
            style={styles.startWorkoutGradient}>
            <Play size={20} color="#fff" />
            <Text style={styles.startWorkoutText}>Start Workout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  todayWorkoutContainer: {
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
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  workoutDuration: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  workoutDescription: {
    fontSize: 16,
    color: '#4A90E2',
    fontFamily: 'Inter-Medium',
    marginBottom: 16,
  },
  workoutExercises: {
    marginBottom: 20,
  },
  exerciseText: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  startWorkoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  startWorkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  startWorkoutText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
});