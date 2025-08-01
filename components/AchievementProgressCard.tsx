import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Star, CircleCheck as CheckCircle, Lock, Zap, Target, Award, Medal, Users, Calendar } from 'lucide-react-native';
import { Achievement } from '@/lib/supabase';
import { AchievementProgress } from '@/lib/achievements';

interface AchievementProgressCardProps {
  achievement: Achievement;
  progress: AchievementProgress;
  onPress?: () => void;
}

export default function AchievementProgressCard({ 
  achievement, 
  progress, 
  onPress 
}: AchievementProgressCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'workout':
        return '#FF6B35';
      case 'strength':
        return '#E74C3C';
      case 'consistency':
        return '#27AE60';
      case 'endurance':
        return '#4A90E2';
      case 'social':
        return '#9B59B6';
      default:
        return '#FF6B35';
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'trophy':
        return Trophy;
      case 'star':
        return Star;
      case 'zap':
        return Zap;
      case 'target':
        return Target;
      case 'award':
        return Award;
      case 'medal':
        return Medal;
      case 'users':
        return Users;
      case 'calendar':
        return Calendar;
      default:
        return Trophy;
    }
  };

  const IconComponent = getIconComponent(achievement.icon || 'trophy');
  const categoryColor = getCategoryColor(achievement.category);

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent 
      style={[styles.container, progress.unlocked && styles.unlockedContainer]} 
      onPress={onPress}
    >
      {progress.unlocked && (
        <LinearGradient
          colors={[`${categoryColor}20`, `${categoryColor}10`]}
          style={styles.unlockedGradient}
        />
      )}
      
      <View style={styles.header}>
        <View style={[
          styles.iconContainer, 
          { 
            backgroundColor: progress.unlocked ? categoryColor : '#333',
            borderColor: progress.unlocked ? categoryColor : '#555',
          }
        ]}>
          <IconComponent 
            size={24} 
            color={progress.unlocked ? '#fff' : '#999'} 
          />
        </View>
        
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <Text style={[
              styles.title, 
              progress.unlocked && styles.unlockedTitle
            ]}>
              {achievement.name}
            </Text>
            {progress.unlocked && (
              <CheckCircle size={20} color={categoryColor} />
            )}
            {!progress.unlocked && progress.percentage < 10 && (
              <Lock size={16} color="#666" />
            )}
          </View>
          <Text style={styles.description}>{achievement.description}</Text>
        </View>
      </View>

      {!progress.unlocked && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressPercentage}>
              {Math.round(progress.percentage)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(progress.percentage, 100)}%`,
                  backgroundColor: categoryColor,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {progress.current_value} / {progress.target_value}
          </Text>
        </View>
      )}

      {progress.unlocked && (
        <View style={styles.unlockedBadge}>
          <CheckCircle size={16} color={categoryColor} />
          <Text style={[styles.unlockedText, { color: categoryColor }]}>
            Unlocked!
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <View style={[styles.categoryTag, { backgroundColor: `${categoryColor}20` }]}>
          <Text style={[styles.categoryText, { color: categoryColor }]}>
            {achievement.category}
          </Text>
        </View>
        <View style={styles.pointsContainer}>
          <Star size={14} color="#FFD700" />
          <Text style={styles.pointsText}>{achievement.points} pts</Text>
        </View>
      </View>
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
    position: 'relative',
    overflow: 'hidden',
  },
  unlockedContainer: {
    borderColor: '#27AE60',
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  unlockedGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
    borderWidth: 2,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    color: '#ccc',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  unlockedTitle: {
    color: '#fff',
  },
  description: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  progressPercentage: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(39, 174, 96, 0.3)',
  },
  unlockedText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    textTransform: 'uppercase',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pointsText: {
    fontSize: 11,
    color: '#FFD700',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
  },
});