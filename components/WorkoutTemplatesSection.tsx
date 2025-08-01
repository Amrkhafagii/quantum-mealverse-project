import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Clock, Target, Users, Star } from 'lucide-react-native';
import { Workout } from '@/lib/supabase';

interface WorkoutTemplatesSectionProps {
  loading: boolean;
  workoutTemplates: Workout[];
  onWorkoutPress: (workout: Workout) => void;
  getDifficultyColor: (difficulty: string) => string;
  getWorkoutTypeColor: (type: string) => string;
  searchQuery?: string;
  selectedFilter?: string;
}

export default function WorkoutTemplatesSection({ 
  loading, 
  workoutTemplates, 
  onWorkoutPress,
  getDifficultyColor,
  getWorkoutTypeColor,
  searchQuery = '',
  selectedFilter = 'all'
}: WorkoutTemplatesSectionProps) {
  const getWorkoutImage = (workoutType: string): string => {
    switch (workoutType) {
      case 'strength':
        return 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2';
      case 'cardio':
        return 'https://images.pexels.com/photos/4164746/pexels-photo-4164746.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2';
      case 'hiit':
        return 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2';
      case 'flexibility':
        return 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2';
      case 'mixed':
        return 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2';
      default:
        return 'https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2';
    }
  };

  const getFilterTitle = () => {
    if (searchQuery) {
      return `Search Results for "${searchQuery}"`;
    }
    if (selectedFilter && selectedFilter !== 'all') {
      const filterName = selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1);
      return `${filterName} Workouts`;
    }
    return 'Workout Templates';
  };

  const getResultsCount = () => {
    if (searchQuery || (selectedFilter && selectedFilter !== 'all')) {
      return `${workoutTemplates.length} ${workoutTemplates.length === 1 ? 'result' : 'results'}`;
    }
    return null;
  };

  return (
    <View style={styles.templatesContainer}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{getFilterTitle()}</Text>
          {getResultsCount() && (
            <Text style={styles.resultsCount}>{getResultsCount()}</Text>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading workouts...</Text>
        </View>
      ) : workoutTemplates.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No workouts found' : 'No workouts available'}
          </Text>
          <Text style={styles.emptyText}>
            {searchQuery 
              ? 'Try adjusting your search terms or filters'
              : 'Check back later for new workout templates'
            }
          </Text>
        </View>
      ) : (
        workoutTemplates.map((workout) => (
          <TouchableOpacity
            key={workout.id}
            style={styles.workoutCard}
            onPress={() => onWorkoutPress(workout)}
          >
            <Image 
              source={{ uri: getWorkoutImage(workout.workout_type) }}
              style={styles.workoutImage}
            />
            
            <View style={styles.workoutContent}>
              <View style={styles.workoutHeader}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <View style={styles.ratingContainer}>
                  <Star size={14} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.ratingText}>4.8</Text>
                </View>
              </View>
              
              <Text style={styles.workoutDescription} numberOfLines={2}>
                {workout.description}
              </Text>
              
              <View style={styles.workoutMeta}>
                <View style={styles.metaItem}>
                  <Clock size={14} color="#999" />
                  <Text style={styles.metaText}>{workout.estimated_duration_minutes} min</Text>
                </View>
                <View style={styles.metaItem}>
                  <Target size={14} color={getDifficultyColor(workout.difficulty_level)} />
                  <Text style={[styles.metaText, { color: getDifficultyColor(workout.difficulty_level) }]}>
                    {workout.difficulty_level}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={[styles.workoutTypeText, { color: getWorkoutTypeColor(workout.workout_type) }]}>
                    {workout.workout_type.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.workoutFooter}>
                <View style={styles.popularityIndicator}>
                  <Users size={12} color="#999" />
                  <Text style={styles.popularityText}>1.2k users</Text>
                </View>
                <TouchableOpacity 
                  style={styles.startButton}
                  onPress={() => onWorkoutPress(workout)}
                >
                  <Text style={styles.startButtonText}>Start</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  templatesContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  resultsCount: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  workoutCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  workoutImage: {
    width: '100%',
    height: 120,
  },
  workoutContent: {
    padding: 16,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  workoutName: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#FFD700',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  workoutDescription: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 12,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  workoutTypeText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  workoutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularityText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginLeft: 4,
  },
  startButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
});