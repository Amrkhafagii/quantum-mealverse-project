import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Trophy, TrendingUp, Calendar, Target } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useExerciseProgress } from '@/hooks/useExerciseProgress';
import ExerciseProgressChart from '@/components/ExerciseProgressChart';
import PersonalRecordCard from '@/components/PersonalRecordCard';

export default function ExerciseProgressScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const { user } = useAuth();
  const {
    exercise,
    progressData,
    personalRecords,
    stats,
    loading,
    error,
    refreshProgress,
  } = useExerciseProgress(user?.id || null, exerciseId ? parseInt(exerciseId) : null);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProgress();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading exercise progress...</Text>
      </View>
    );
  }

  if (error || !exercise) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Exercise not found'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#27AE60';
      case 'intermediate':
        return '#F39C12';
      case 'advanced':
        return '#E74C3C';
      default:
        return '#999';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'strength':
        return '#FF6B35';
      case 'cardio':
        return '#E74C3C';
      case 'flexibility':
        return '#27AE60';
      case 'balance':
        return '#9B59B6';
      default:
        return '#999';
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseTitle}>{exercise.name}</Text>
          <View style={styles.exerciseMeta}>
            <View style={styles.metaItem}>
              <Text style={[styles.metaText, { color: getDifficultyColor(exercise.difficulty_level) }]}>
                {exercise.difficulty_level}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={[styles.metaText, { color: getTypeColor(exercise.exercise_type) }]}>
                {exercise.exercise_type}
              </Text>
            </View>
          </View>
          {exercise.description && (
            <Text style={styles.exerciseDescription}>{exercise.description}</Text>
          )}
        </View>
      </LinearGradient>

      {exercise.demo_image_url && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: exercise.demo_image_url }} style={styles.exerciseImage} />
        </View>
      )}

      {/* Exercise Stats Overview */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Calendar size={20} color="#4A90E2" />
            <Text style={styles.statValue}>{stats.totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Target size={20} color="#27AE60" />
            <Text style={styles.statValue}>{stats.totalSets}</Text>
            <Text style={styles.statLabel}>Total Sets</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={20} color="#FF6B35" />
            <Text style={styles.statValue}>{stats.averageReps}</Text>
            <Text style={styles.statLabel}>Avg Reps</Text>
          </View>
          <View style={styles.statCard}>
            <Trophy size={20} color="#9B59B6" />
            <Text style={styles.statValue}>{personalRecords.length}</Text>
            <Text style={styles.statLabel}>Records</Text>
          </View>
        </View>
      </View>

      {/* Progress Charts */}
      {progressData.weightProgress.length > 0 && (
        <View style={styles.chartContainer}>
          <ExerciseProgressChart
            data={progressData.weightProgress}
            title="Weight Progress"
            subtitle="Maximum weight lifted per session"
            color="#FF6B35"
            unit="kg"
            chartType="line"
          />
        </View>
      )}

      {progressData.repsProgress.length > 0 && (
        <View style={styles.chartContainer}>
          <ExerciseProgressChart
            data={progressData.repsProgress}
            title="Reps Progress"
            subtitle="Maximum reps performed per session"
            color="#4A90E2"
            unit="reps"
            chartType="line"
          />
        </View>
      )}

      {progressData.volumeProgress.length > 0 && (
        <View style={styles.chartContainer}>
          <ExerciseProgressChart
            data={progressData.volumeProgress}
            title="Volume Progress"
            subtitle="Total volume (weight × reps) per session"
            color="#27AE60"
            unit="kg"
            chartType="bar"
          />
        </View>
      )}

      {progressData.durationProgress.length > 0 && (
        <View style={styles.chartContainer}>
          <ExerciseProgressChart
            data={progressData.durationProgress}
            title="Duration Progress"
            subtitle="Exercise duration per session"
            color="#9B59B6"
            unit="min"
            chartType="line"
          />
        </View>
      )}

      {/* Personal Records */}
      {personalRecords.length > 0 && (
        <View style={styles.recordsContainer}>
          <Text style={styles.sectionTitle}>Personal Records</Text>
          {personalRecords.map((record, index) => (
            <PersonalRecordCard
              key={record.id}
              record={record}
              showExerciseName={false}
            />
          ))}
        </View>
      )}

      {/* Muscle Groups */}
      <View style={styles.muscleGroupsContainer}>
        <Text style={styles.sectionTitle}>Target Muscle Groups</Text>
        <View style={styles.muscleGroups}>
          {exercise.muscle_groups.map((muscle, index) => (
            <View key={index} style={styles.muscleTag}>
              <Text style={styles.muscleTagText}>{muscle}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Equipment */}
      {exercise.equipment && exercise.equipment.length > 0 && (
        <View style={styles.equipmentContainer}>
          <Text style={styles.sectionTitle}>Equipment Needed</Text>
          <View style={styles.equipmentList}>
            {exercise.equipment.map((item, index) => (
              <View key={index} style={styles.equipmentTag}>
                <Text style={styles.equipmentTagText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Instructions */}
      {exercise.instructions && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsText}>{exercise.instructions}</Text>
          </View>
        </View>
      )}

      {/* Empty State */}
      {progressData.weightProgress.length === 0 && 
       progressData.repsProgress.length === 0 && 
       progressData.volumeProgress.length === 0 && 
       progressData.durationProgress.length === 0 && (
        <View style={styles.emptyState}>
          <TrendingUp size={48} color="#666" />
          <Text style={styles.emptyTitle}>No Progress Data Yet</Text>
          <Text style={styles.emptyText}>
            Complete workouts with this exercise to see your progress charts and statistics.
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#E74C3C',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerBackButton: {
    marginBottom: 20,
  },
  exerciseHeader: {
    alignItems: 'flex-start',
  },
  exerciseTitle: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  exerciseMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaItem: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  exerciseDescription: {
    fontSize: 16,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  imageContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  exerciseImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
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
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  statValue: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  chartContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  recordsContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  muscleGroupsContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muscleTag: {
    backgroundColor: '#FF6B3520',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  muscleTagText: {
    fontSize: 14,
    color: '#FF6B35',
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  equipmentContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  equipmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  equipmentTag: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  equipmentTagText: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  instructionsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  instructionsText: {
    fontSize: 16,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSpacer: {
    height: 100,
  },
});