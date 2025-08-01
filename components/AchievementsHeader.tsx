import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Star, Target, Crown, Award, Zap } from 'lucide-react-native';

interface AchievementsHeaderProps {
  unlockedCount: number;
  totalPoints: number;
  completionPercentage: number;
}

export default function AchievementsHeader({ 
  unlockedCount, 
  totalPoints, 
  completionPercentage 
}: AchievementsHeaderProps) {
  const getRankTitle = (points: number) => {
    if (points >= 1000) return 'Fitness Legend';
    if (points >= 500) return 'Fitness Master';
    if (points >= 250) return 'Fitness Expert';
    if (points >= 100) return 'Fitness Enthusiast';
    if (points >= 50) return 'Rising Star';
    return 'Beginner';
  };

  const getRankIcon = (points: number) => {
    if (points >= 1000) return Crown;
    if (points >= 500) return Trophy;
    if (points >= 250) return Award;
    if (points >= 100) return Star;
    if (points >= 50) return Zap;
    return Target;
  };

  const getRankColor = (points: number) => {
    if (points >= 1000) return '#FFD700';
    if (points >= 500) return '#FF6B35';
    if (points >= 250) return '#E74C3C';
    if (points >= 100) return '#9B59B6';
    if (points >= 50) return '#4A90E2';
    return '#27AE60';
  };

  const RankIcon = getRankIcon(totalPoints);
  const rankColor = getRankColor(totalPoints);
  const rankTitle = getRankTitle(totalPoints);

  return (
    <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
      <Text style={styles.headerTitle}>Achievements</Text>
      <Text style={styles.headerSubtitle}>Track your fitness milestones</Text>
      
      {/* Rank Display */}
      <View style={styles.rankContainer}>
        <View style={[styles.rankIcon, { backgroundColor: `${rankColor}20` }]}>
          <RankIcon size={32} color={rankColor} />
        </View>
        <View style={styles.rankInfo}>
          <Text style={[styles.rankTitle, { color: rankColor }]}>{rankTitle}</Text>
          <Text style={styles.rankSubtitle}>
            {totalPoints} points • {unlockedCount} achievements
          </Text>
        </View>
      </View>
      
      {/* Progress Ring */}
      <View style={styles.progressRingContainer}>
        <View style={styles.progressRing}>
          <View style={[
            styles.progressRingFill,
            {
              transform: [{ rotate: `${(completionPercentage / 100) * 360}deg` }],
              borderColor: rankColor,
            }
          ]} />
          <View style={styles.progressRingCenter}>
            <Text style={styles.progressPercentage}>{completionPercentage}%</Text>
            <Text style={styles.progressLabel}>Complete</Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Trophy size={20} color="#FF6B35" />
          <Text style={styles.statValue}>{unlockedCount}</Text>
          <Text style={styles.statLabel}>Unlocked</Text>
        </View>
        <View style={styles.statCard}>
          <Star size={20} color="#FFD700" />
          <Text style={styles.statValue}>{totalPoints}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statCard}>
          <Target size={20} color="#4A90E2" />
          <Text style={styles.statValue}>{completionPercentage}%</Text>
          <Text style={styles.statLabel}>Progress</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginBottom: 30,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  rankIcon: {
    padding: 16,
    borderRadius: 16,
    marginRight: 16,
  },
  rankInfo: {
    flex: 1,
  },
  rankTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  rankSubtitle: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  progressRingContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  progressRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressRingFill: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FF6B35',
  },
  progressRingCenter: {
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  progressLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  statValue: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
});