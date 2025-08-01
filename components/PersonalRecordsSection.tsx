import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Trophy, TrendingUp, Clock, Target } from 'lucide-react-native';
import { router } from 'expo-router';
import { formatPersonalRecordValue } from '@/lib/personalRecords';

interface PersonalRecord {
  id: number;
  exercise_id: number;
  record_type: string;
  value: number;
  unit: string;
  achieved_at: string;
  exercise: {
    name: string;
    exercise_type: string;
  };
}

interface PersonalRecordsSectionProps {
  personalRecords: PersonalRecord[];
  loading: boolean;
  onRecordPress?: (record: PersonalRecord) => void;
}

export default function PersonalRecordsSection({ 
  personalRecords, 
  loading,
  onRecordPress 
}: PersonalRecordsSectionProps) {
  const getRecordIcon = (recordType: string) => {
    switch (recordType) {
      case 'max_weight':
        return Trophy;
      case 'max_reps':
        return Target;
      case 'best_time':
        return Clock;
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

  const handleRecordPress = (record: PersonalRecord) => {
    if (onRecordPress) {
      onRecordPress(record);
    } else {
      // Navigate to exercise progress screen
      router.push({
        pathname: '/(tabs)/exercise-progress',
        params: { exerciseId: record.exercise_id.toString() },
      });
    }
  };

  // Group records by exercise
  const recordsByExercise = personalRecords.reduce((acc, record) => {
    const exerciseName = record.exercise.name;
    if (!acc[exerciseName]) {
      acc[exerciseName] = [];
    }
    acc[exerciseName].push(record);
    return acc;
  }, {} as Record<string, PersonalRecord[]>);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Personal Records</Text>
        <Text style={styles.loadingText}>Loading records...</Text>
      </View>
    );
  }

  if (personalRecords.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Personal Records</Text>
        <View style={styles.emptyContainer}>
          <Trophy size={48} color="#666" />
          <Text style={styles.emptyTitle}>No records yet</Text>
          <Text style={styles.emptyText}>
            Complete workouts to start setting personal records!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Personal Records</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.recordsGrid}>
          {Object.entries(recordsByExercise).map(([exerciseName, records]) => (
            <View key={exerciseName} style={styles.exerciseGroup}>
              <Text style={styles.exerciseName}>{exerciseName}</Text>
              {records.map((record) => {
                const IconComponent = getRecordIcon(record.record_type);
                const recordColor = getRecordColor(record.record_type);
                
                return (
                  <TouchableOpacity
                    key={record.id}
                    style={styles.recordCard}
                    onPress={() => handleRecordPress(record)}
                  >
                    <View style={[styles.recordIcon, { backgroundColor: `${recordColor}20` }]}>
                      <IconComponent size={20} color={recordColor} />
                    </View>
                    <View style={styles.recordInfo}>
                      <Text style={styles.recordType}>
                        {getRecordTypeLabel(record.record_type)}
                      </Text>
                      <Text style={styles.recordValue}>
                        {formatPersonalRecordValue(record.value, record.record_type, record.unit)}
                      </Text>
                      <Text style={styles.recordDate}>
                        {new Date(record.achieved_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  recordsGrid: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  exerciseGroup: {
    marginRight: 20,
    minWidth: 200,
  },
  exerciseName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  recordCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordIcon: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordType: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  recordValue: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  recordDate: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
});