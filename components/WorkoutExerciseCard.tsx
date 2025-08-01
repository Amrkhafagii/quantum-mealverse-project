import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { Trash2, ChevronUp, ChevronDown, CreditCard as Edit3, Check, X } from 'lucide-react-native';
import { Exercise } from '@/lib/supabase';

interface WorkoutExercise {
  exercise: Exercise;
  order_index: number;
  target_sets: number;
  target_reps: number[];
  target_weight_kg?: number;
  target_duration_seconds?: number;
  rest_seconds: number;
  notes?: string;
}

interface WorkoutExerciseCardProps {
  exercise: WorkoutExercise;
  index: number;
  onUpdate: (updates: Partial<WorkoutExercise>) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export default function WorkoutExerciseCard({
  exercise,
  index,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: WorkoutExerciseCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    target_sets: exercise.target_sets.toString(),
    target_reps: exercise.target_reps.join(', '),
    target_weight_kg: exercise.target_weight_kg?.toString() || '',
    target_duration_seconds: exercise.target_duration_seconds?.toString() || '',
    rest_seconds: exercise.rest_seconds.toString(),
    notes: exercise.notes || '',
  });

  const handleSaveEdit = () => {
    try {
      const updates: Partial<WorkoutExercise> = {
        target_sets: parseInt(editData.target_sets) || 1,
        rest_seconds: parseInt(editData.rest_seconds) || 60,
      };

      // Parse reps
      if (editData.target_reps.trim()) {
        const reps = editData.target_reps
          .split(',')
          .map(r => parseInt(r.trim()))
          .filter(r => !isNaN(r));
        updates.target_reps = reps.length > 0 ? reps : [8];
      } else {
        updates.target_reps = [];
      }

      // Parse weight
      if (editData.target_weight_kg.trim()) {
        updates.target_weight_kg = parseFloat(editData.target_weight_kg) || undefined;
      }

      // Parse duration
      if (editData.target_duration_seconds.trim()) {
        updates.target_duration_seconds = parseInt(editData.target_duration_seconds) || undefined;
      }

      // Notes
      updates.notes = editData.notes.trim() || undefined;

      onUpdate(updates);
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Please check your input values');
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      target_sets: exercise.target_sets.toString(),
      target_reps: exercise.target_reps.join(', '),
      target_weight_kg: exercise.target_weight_kg?.toString() || '',
      target_duration_seconds: exercise.target_duration_seconds?.toString() || '',
      rest_seconds: exercise.rest_seconds.toString(),
      notes: exercise.notes || '',
    });
    setIsEditing(false);
  };

  const handleRemove = () => {
    Alert.alert(
      'Remove Exercise',
      `Are you sure you want to remove "${exercise.exercise.name}" from this workout?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: onRemove },
      ]
    );
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.orderBadge}>
          <Text style={styles.orderText}>{index + 1}</Text>
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{exercise.exercise.name}</Text>
          <Text style={styles.exerciseType}>{exercise.exercise.exercise_type}</Text>
        </View>
        <View style={styles.actions}>
          {onMoveUp && (
            <TouchableOpacity style={styles.actionButton} onPress={onMoveUp}>
              <ChevronUp size={16} color="#999" />
            </TouchableOpacity>
          )}
          {onMoveDown && (
            <TouchableOpacity style={styles.actionButton} onPress={onMoveDown}>
              <ChevronDown size={16} color="#999" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Edit3 size={16} color="#4A90E2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleRemove}>
            <Trash2 size={16} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>

      {exercise.exercise.demo_image_url && (
        <Image
          source={{ uri: exercise.exercise.demo_image_url }}
          style={styles.exerciseImage}
        />
      )}

      {isEditing ? (
        <View style={styles.editForm}>
          <View style={styles.editRow}>
            <View style={styles.editField}>
              <Text style={styles.editLabel}>Sets</Text>
              <TextInput
                style={styles.editInput}
                value={editData.target_sets}
                onChangeText={(text) => setEditData({ ...editData, target_sets: text })}
                keyboardType="numeric"
                placeholder="3"
                placeholderTextColor="#666"
              />
            </View>

            {exercise.exercise.exercise_type !== 'cardio' && (
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Reps (comma separated)</Text>
                <TextInput
                  style={styles.editInput}
                  value={editData.target_reps}
                  onChangeText={(text) => setEditData({ ...editData, target_reps: text })}
                  placeholder="8, 10, 12"
                  placeholderTextColor="#666"
                />
              </View>
            )}
          </View>

          <View style={styles.editRow}>
            {exercise.exercise.exercise_type !== 'cardio' && (
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.editInput}
                  value={editData.target_weight_kg}
                  onChangeText={(text) => setEditData({ ...editData, target_weight_kg: text })}
                  keyboardType="numeric"
                  placeholder="Optional"
                  placeholderTextColor="#666"
                />
              </View>
            )}

            {exercise.exercise.exercise_type === 'cardio' && (
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Duration (seconds)</Text>
                <TextInput
                  style={styles.editInput}
                  value={editData.target_duration_seconds}
                  onChangeText={(text) => setEditData({ ...editData, target_duration_seconds: text })}
                  keyboardType="numeric"
                  placeholder="300"
                  placeholderTextColor="#666"
                />
              </View>
            )}

            <View style={styles.editField}>
              <Text style={styles.editLabel}>Rest (seconds)</Text>
              <TextInput
                style={styles.editInput}
                value={editData.rest_seconds}
                onChangeText={(text) => setEditData({ ...editData, rest_seconds: text })}
                keyboardType="numeric"
                placeholder="60"
                placeholderTextColor="#666"
              />
            </View>
          </View>

          <View style={styles.editField}>
            <Text style={styles.editLabel}>Notes</Text>
            <TextInput
              style={[styles.editInput, styles.notesInput]}
              value={editData.notes}
              onChangeText={(text) => setEditData({ ...editData, notes: text })}
              placeholder="Optional notes..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
              <X size={16} color="#E74C3C" />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
              <Check size={16} color="#27AE60" />
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.details}>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Sets</Text>
              <Text style={styles.detailValue}>{exercise.target_sets}</Text>
            </View>

            {exercise.target_reps.length > 0 && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Reps</Text>
                <Text style={styles.detailValue}>{exercise.target_reps.join(', ')}</Text>
              </View>
            )}

            {exercise.target_weight_kg && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Weight</Text>
                <Text style={styles.detailValue}>{exercise.target_weight_kg} kg</Text>
              </View>
            )}

            {exercise.target_duration_seconds && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>
                  {formatDuration(exercise.target_duration_seconds)}
                </Text>
              </View>
            )}

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Rest</Text>
              <Text style={styles.detailValue}>{exercise.rest_seconds}s</Text>
            </View>
          </View>

          {exercise.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{exercise.notes}</Text>
            </View>
          )}

          <View style={styles.muscleGroups}>
            {exercise.exercise.muscle_groups.map((muscle, muscleIndex) => (
              <View key={muscleIndex} style={styles.muscleTag}>
                <Text style={styles.muscleTagText}>{muscle}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderBadge: {
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  exerciseType: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  exerciseImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  details: {
    gap: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  notesContainer: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
  },
  notesLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  muscleTag: {
    backgroundColor: '#333',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  muscleTagText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  editForm: {
    gap: 12,
  },
  editRow: {
    flexDirection: 'row',
    gap: 12,
  },
  editField: {
    flex: 1,
  },
  editLabel: {
    fontSize: 12,
    color: '#ccc',
    fontFamily: 'Inter-Medium',
    marginBottom: 6,
  },
  editInput: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: '#444',
  },
  notesInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#E74C3C',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    color: '#27AE60',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
});