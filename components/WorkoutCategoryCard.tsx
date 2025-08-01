import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Dumbbell, Heart, Zap, Flower } from 'lucide-react-native';

interface WorkoutCategoryCardProps {
  name: string;
  exercises: number;
  duration: string;
  color: string;
  type: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  onPress: () => void;
  isSelected?: boolean;
}

export default function WorkoutCategoryCard({
  name,
  exercises,
  duration,
  color,
  type,
  difficulty,
  onPress,
  isSelected = false,
}: WorkoutCategoryCardProps) {
  const getIcon = () => {
    switch (type) {
      case 'strength':
        return Dumbbell;
      case 'cardio':
        return Heart;
      case 'hiit':
        return Zap;
      case 'flexibility':
        return Flower;
      default:
        return Dumbbell;
    }
  };

  const getDifficultyColor = () => {
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

  const IconComponent = getIcon();

  return (
    <TouchableOpacity 
      style={[styles.container, isSelected && styles.selectedContainer]} 
      onPress={onPress}
    >
      <LinearGradient
        colors={[color, `${color}CC`]}
        style={styles.gradient}
      >
        <View style={styles.iconContainer}>
          <IconComponent size={32} color="#fff" />
        </View>
        
        <Text style={styles.categoryName}>{name}</Text>
        
        <View style={styles.statsContainer}>
          <Text style={styles.exerciseCount}>
            {exercises} {exercises === 1 ? 'workout' : 'workouts'}
          </Text>
          <Text style={styles.duration}>{duration}</Text>
        </View>
        
        <View style={styles.difficultyContainer}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() }]}>
            <Text style={styles.difficultyText}>{difficulty}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  selectedContainer: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  gradient: {
    width: 140,
    height: 160,
    padding: 16,
    justifyContent: 'space-between',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  statsContainer: {
    alignItems: 'center',
  },
  exerciseCount: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    opacity: 0.9,
    marginBottom: 2,
  },
  duration: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    opacity: 0.9,
  },
  difficultyContainer: {
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    textTransform: 'uppercase',
  },
});