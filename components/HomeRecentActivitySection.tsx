import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, Target, Dumbbell, Trophy } from 'lucide-react-native';

interface Activity {
  type: string;
  title: string;
  description: string;
  date: string;
  icon: string;
}

interface HomeRecentActivitySectionProps {
  activities: Activity[];
}

export default function HomeRecentActivitySection({ activities }: HomeRecentActivitySectionProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'dumbbell':
        return Dumbbell;
      case 'trophy':
        return Trophy;
      case 'target':
        return Target;
      default:
        return Calendar;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'workout':
        return '#4A90E2';
      case 'achievement':
        return '#27AE60';
      case 'record':
        return '#FF6B35';
      default:
        return '#9B59B6';
    }
  };

  return (
    <View style={styles.recentActivityContainer}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {activities.map((activity, index) => {
        const IconComponent = getIcon(activity.icon);
        const iconColor = getIconColor(activity.type);
        
        return (
          <View key={index} style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <IconComponent size={20} color={iconColor} />
              <Text style={styles.activityDate}>{activity.date}</Text>
            </View>
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <Text style={styles.activityStats}>{activity.description}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  recentActivityContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  activityCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityDate: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  activityTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  activityStats: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
  },
});