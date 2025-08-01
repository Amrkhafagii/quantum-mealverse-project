import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import WorkoutCategoryCard from './WorkoutCategoryCard';

interface WorkoutCategory {
  name: string;
  exercises: number;
  duration: string;
  color: string;
  type: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface WorkoutQuickStartSectionProps {
  workoutCategories: WorkoutCategory[];
  onCategoryPress: (category: WorkoutCategory) => void;
  selectedCategory?: string;
}

export default function WorkoutQuickStartSection({ 
  workoutCategories, 
  onCategoryPress,
  selectedCategory = 'all'
}: WorkoutQuickStartSectionProps) {
  const handleCreateWorkout = () => {
    router.push('/(tabs)/create-workout');
  };

  return (
    <View style={styles.quickStartContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateWorkout}>
          <Plus size={20} color="#FF6B35" />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        <View style={styles.categoriesContainer}>
          {workoutCategories.map((category, index) => (
            <WorkoutCategoryCard
              key={category.type}
              name={category.name}
              exercises={category.exercises}
              duration={category.duration}
              color={category.color}
              type={category.type}
              difficulty={category.difficulty}
              onPress={() => onCategoryPress(category)}
              isSelected={selectedCategory === category.type}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  quickStartContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  createButtonText: {
    fontSize: 14,
    color: '#FF6B35',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 6,
  },
  categoriesScroll: {
    marginLeft: -20,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 4,
  },
});