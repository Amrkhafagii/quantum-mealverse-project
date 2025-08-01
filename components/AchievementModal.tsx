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
import { Trophy, X, Star } from 'lucide-react-native';
import { Achievement } from '@/lib/supabase';

interface AchievementModalProps {
  visible: boolean;
  achievement: Achievement | null;
  onClose: () => void;
}

export default function AchievementModal({ visible, achievement, onClose }: AchievementModalProps) {
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

  if (!achievement) return null;

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
      default:
        return Trophy;
    }
  };

  const IconComponent = getIconComponent(achievement.icon || 'trophy');
  const categoryColor = getCategoryColor(achievement.category);

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
            colors={[categoryColor, `${categoryColor}CC`]}
            style={styles.modalContent}
          >
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.achievementIcon}>
              <IconComponent size={64} color="#fff" />
            </View>

            <Text style={styles.congratsText}>Achievement Unlocked!</Text>
            <Text style={styles.achievementName}>{achievement.name}</Text>
            <Text style={styles.achievementDescription}>{achievement.description}</Text>

            <View style={styles.pointsContainer}>
              <Star size={20} color="#FFD700" />
              <Text style={styles.pointsText}>{achievement.points} points</Text>
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
  achievementIcon: {
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
  achievementName: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  achievementDescription: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    opacity: 0.9,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  pointsText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
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