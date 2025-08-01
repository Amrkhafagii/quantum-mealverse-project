import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Play, Plus, TrendingUp, Users } from 'lucide-react-native';

interface QuickAction {
  label: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface HomeQuickActionsSectionProps {
  quickActions: QuickAction[];
}

export default function HomeQuickActionsSection({ quickActions }: HomeQuickActionsSectionProps) {
  const handleQuickAction = (actionLabel: string) => {
    switch (actionLabel) {
      case 'Start Workout':
        // Navigate to workouts tab to select a workout
        router.push('/(tabs)/workouts');
        break;
      case 'Log Exercise':
        // Navigate to create workout screen for quick exercise logging
        router.push('/(tabs)/create-workout');
        break;
      case 'View Progress':
        // Navigate to progress tab
        router.push('/(tabs)/progress');
        break;
      case 'Find Friends':
        // Navigate to social tab
        router.push('/(tabs)/social');
        break;
      default:
        console.log('Unknown action:', actionLabel);
    }
  };

  return (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.quickActionCard}
            onPress={() => handleQuickAction(action.label)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[action.color, `${action.color}CC`]}
              style={styles.quickActionGradient}>
              <action.icon size={28} color="#fff" />
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  quickActionCard: {
    width: '48%',
    marginBottom: 12,
  },
  quickActionGradient: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 8,
    textAlign: 'center',
  },
});