import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { X, Search, Filter } from 'lucide-react-native';
import { Exercise, getExercises } from '@/lib/supabase';

interface ExerciseSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
  excludeExerciseIds?: number[];
}

export default function ExerciseSelector({
  visible,
  onClose,
  onSelectExercise,
  excludeExerciseIds = [],
}: ExerciseSelectorProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const muscleGroups = [
    'all',
    'chest',
    'back',
    'shoulders',
    'arms',
    'legs',
    'core',
    'glutes',
    'cardio',
  ];

  const exerciseTypes = [
    'all',
    'strength',
    'cardio',
    'flexibility',
    'balance',
  ];

  useEffect(() => {
    if (visible) {
      loadExercises();
    }
  }, [visible]);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchQuery, selectedMuscleGroup, selectedType, excludeExerciseIds]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const exerciseData = await getExercises();
      setExercises(exerciseData);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = exercises.filter(exercise => 
      !excludeExerciseIds.includes(exercise.id)
    );

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.muscle_groups.some(mg => 
          mg.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filter by muscle group
    if (selectedMuscleGroup !== 'all') {
      filtered = filtered.filter(exercise =>
        exercise.muscle_groups.some(mg => 
          mg.toLowerCase().includes(selectedMuscleGroup.toLowerCase())
        )
      );
    }

    // Filter by exercise type
    if (selectedType !== 'all') {
      filtered = filtered.filter(exercise =>
        exercise.exercise_type === selectedType
      );
    }

    setFilteredExercises(filtered);
  };

  const handleSelectExercise = (exercise: Exercise) => {
    onSelectExercise(exercise);
    setSearchQuery('');
    setSelectedMuscleGroup('all');
    setSelectedType('all');
  };

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
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Select Exercise</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search and Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            <Text style={styles.filterLabel}>Muscle:</Text>
            {muscleGroups.map((group) => (
              <TouchableOpacity
                key={group}
                style={[
                  styles.filterButton,
                  selectedMuscleGroup === group && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedMuscleGroup(group)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedMuscleGroup === group && styles.filterButtonTextActive,
                  ]}
                >
                  {group}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            <Text style={styles.filterLabel}>Type:</Text>
            {exerciseTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  selectedType === type && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedType(type)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedType === type && styles.filterButtonTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Exercise List */}
        <ScrollView style={styles.exercisesList} showsVerticalScrollIndicator={false}>
          {loading ? (
            <Text style={styles.loadingText}>Loading exercises...</Text>
          ) : filteredExercises.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No exercises found</Text>
              <Text style={styles.emptyText}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            filteredExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseCard}
                onPress={() => handleSelectExercise(exercise)}
              >
                {exercise.demo_image_url && (
                  <Image
                    source={{ uri: exercise.demo_image_url }}
                    style={styles.exerciseImage}
                  />
                )}
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDescription} numberOfLines={2}>
                    {exercise.description}
                  </Text>
                  
                  <View style={styles.exerciseMeta}>
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Text
                          style={[
                            styles.metaText,
                            { color: getDifficultyColor(exercise.difficulty_level) },
                          ]}
                        >
                          {exercise.difficulty_level}
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Text
                          style={[
                            styles.metaText,
                            { color: getTypeColor(exercise.exercise_type) },
                          ]}
                        >
                          {exercise.exercise_type}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.muscleGroups}>
                      {exercise.muscle_groups.slice(0, 3).map((muscle, index) => (
                        <View key={index} style={styles.muscleTag}>
                          <Text style={styles.muscleTagText}>{muscle}</Text>
                        </View>
                      ))}
                      {exercise.muscle_groups.length > 3 && (
                        <Text style={styles.moreText}>
                          +{exercise.muscle_groups.length - 3}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  closeButton: {
    padding: 4,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
  filterRow: {
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Medium',
    marginRight: 12,
    paddingVertical: 8,
  },
  filterButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  exercisesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 40,
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
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  exerciseCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
  },
  exerciseImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 12,
  },
  exerciseMeta: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  muscleTag: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  muscleTagText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  moreText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    paddingVertical: 4,
  },
});