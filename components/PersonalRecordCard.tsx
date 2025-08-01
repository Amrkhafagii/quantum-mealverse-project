import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Trophy, TrendingUp, Calendar } from 'lucide-react-native';
import { PersonalRecord } from '@/lib/supabase';
import { formatPersonalRecordValue } from '@/lib/personalRecords';

interface PersonalRecordCardProps {
  record: PersonalRecord & { exercise?: { name: string } };
  showExerciseName?: boolean;
  onPress?: () => void;
}

export default function PersonalRecordCard({ 
  record, 
  showExerciseName = true,
  onPress 
}: PersonalRecordCardProps) {
  const getRecordIcon = (recordType: string) => {
    switch (recordType) {
      case 'max_weight':
        return Trophy;
      case 'max_reps':
        return TrendingUp;
      case 'best_time':
        return Calendar;
      case 'max_distance':
        return TrendingUp;
      default:
        return Trophy;
    }
  };

  const getRecordColor = (recordType: string) => {
    switch (recordType) {
      case 'max_weight':
        return '#FF6B35';
      case 'max_reps':
        return '#4A90E2';
      case 'best_time':
        return '#27AE60';
      case 'max_distance':
        return '#9B59B6';
      default:
        return '#FF6B35';
    }
  };

  const getRecordTypeLabel = (recordType: string) => {
    switch (recordType) {
      case 'max_weight':
        return 'Max Weight';
      case 'max_reps':
        return 'Max Reps';
      case 'best_time':
        return 'Best Time';
      case 'max_distance':
        return 'Max Distance';
      default:
        return recordType;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const IconComponent = getRecordIcon(record.record_type);
  const recordColor = getRecordColor(record.record_type);

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent style={styles.container} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: `${recordColor}20` }]}>
        <IconComponent size={24} color={recordColor} />
      </View>
      
      <View style={styles.content}>
        {showExerciseName && record.exercise && (
          <Text style={styles.exerciseName}>{record.exercise.name}</Text>
        )}
        <Text style={styles.recordType}>{getRecordTypeLabel(record.record_type)}</Text>
        <Text style={styles.recordValue}>
          {formatPersonalRecordValue(record.value, record.record_type, record.unit)}
        </Text>
        <Text style={styles.recordDate}>{formatDate(record.achieved_at)}</Text>
      </View>
      
      <View style={styles.badge}>
        <Text style={styles.badgeText}>PR</Text>
      </View>
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  recordType: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  recordValue: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  badge: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#000',
    fontFamily: 'Inter-Bold',
  },
});