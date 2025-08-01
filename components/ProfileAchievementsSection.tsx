import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Achievement {
  title: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface ProfileAchievementsSectionProps {
  achievements: Achievement[];
}

export default function ProfileAchievementsSection({ achievements }: ProfileAchievementsSectionProps) {
  return (
    <View style={styles.achievementsContainer}>
      <Text style={styles.sectionTitle}>Achievements</Text>
      <View style={styles.achievementsGrid}>
        {achievements.map((achievement, index) => (
          <View key={index} style={styles.achievementCard}>
            <View style={[styles.achievementIcon, { backgroundColor: achievement.color }]}>
              <achievement.icon size={20} color="#fff" />
            </View>
            <Text style={styles.achievementTitle}>{achievement.title}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  achievementsContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '30%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  achievementIcon: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 11,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
});