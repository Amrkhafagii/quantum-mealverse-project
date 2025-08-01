import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, X, TrendingUp, Calendar } from 'lucide-react-native';
import { PersonalRecordData, formatPersonalRecordValue } from '@/lib/personalRecords';

interface PersonalRecordModalProps {
  visible: boolean;
  record: PersonalRecordData | null;
  onClose: () => void;
}

export default function PersonalRecordModal({ visible, record, onClose }: PersonalRecordModalProps) {
  const scaleValue = new Animated.Value(0);

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      scaleValue.setValue(0);
    }
  }, [visible]);

  if (!record) return null;

  const getRecordTypeColor = (recordType: string) => {
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

  const getRecordTypeTitle = (recordType: string) => {
    switch (recordType) {
      case 'max_weight':
        return 'New Weight Record!';
      case 'max_reps':
        return 'New Rep Record!';
      case 'best_time':
        return 'New Time Record!';
      case 'max_distance':
        return 'New Distance Record!';
      default:
        return 'New Personal Record!';
    }
  };

  const recordColor = getRecordTypeColor(record.record_type);
  const recordTitle = getRecordTypeTitle(record.record_type);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          <LinearGradient
            colors={[recordColor, `${recordColor}CC`]}
            style={styles.modalContent}
          >
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.recordIcon}>
              <Trophy size={64} color="#fff" />
            </View>

            <Text style={styles.congratsText}>Personal Record!</Text>
            <Text style={styles.recordTitle}>{recordTitle}</Text>
            <Text style={styles.exerciseName}>{record.exercise_name}</Text>

            <View style={styles.recordDetails}>
              <View style={styles.recordValue}>
                <Text style={styles.newValueLabel}>New Record</Text>
                <Text style={styles.newValueText}>
                  {formatPersonalRecordValue(record.value, record.record_type, record.unit)}
                </Text>
              </View>

              {record.previous_value && record.previous_value > 0 && (
                <View style={styles.improvementContainer}>
                  <TrendingUp size={20} color="#fff" />
                  <Text style={styles.improvementText}>
                    <Text>+</Text>
                    {formatPersonalRecordValue(
                      record.improvement || 0, 
                      record.record_type, 
                      record.unit
                    )}
                    <Text> improvement</Text>
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.dateContainer}>
              <Calendar size={16} color="#fff" />
              <Text style={styles.dateText}>
                {new Date(record.achieved_at).toLocaleDateString()}
              </Text>
            </View>

            <TouchableOpacity style={styles.continueButton} onPress={onClose}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 350,
  },
  modalContent: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  recordIcon: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
  },
  congratsText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
    opacity: 0.9,
  },
  recordTitle: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
  },
  recordDetails: {
    alignItems: 'center',
    marginBottom: 24,
  },
  recordValue: {
    alignItems: 'center',
    marginBottom: 16,
  },
  newValueLabel: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    opacity: 0.8,
    marginBottom: 4,
  },
  newValueText: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  improvementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  improvementText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dateText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
    opacity: 0.8,
  },
  continueButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  continueButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
});