import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Trophy, Zap, Target, Crown } from 'lucide-react-native';

interface LeaderboardUser {
  id: string;
  name: string;
  username: string;
  points: number;
  rank: number;
  avatar: string;
  streak: number;
  workouts: number;
}

interface SocialLeaderboardProps {
  leaderboard: LeaderboardUser[];
  currentUserId?: string;
}

export default function SocialLeaderboard({ leaderboard, currentUserId }: SocialLeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={20} color="#FFD700" />;
      case 2:
        return <Trophy size={20} color="#C0C0C0" />;
      case 3:
        return <Trophy size={20} color="#CD7F32" />;
      default:
        return <Target size={20} color="#666" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700';
      case 2:
        return '#C0C0C0';
      case 3:
        return '#CD7F32';
      default:
        return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Leaderboard</Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.leaderboardCard}>
        {leaderboard.map((user, index) => (
          <TouchableOpacity
            key={user.id}
            style={[
              styles.leaderboardItem,
              user.id === currentUserId && styles.currentUserItem
            ]}
          >
            <View style={styles.rankContainer}>
              {getRankIcon(user.rank)}
              <Text style={[
                styles.rankText,
                { color: getRankColor(user.rank) }
              ]}>
                #{user.rank}
              </Text>
            </View>
            
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userHandle}>@{user.username}</Text>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.points.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.streakContainer}>
                  <Zap size={12} color="#FF6B35" />
                  <Text style={styles.streakText}>{user.streak}</Text>
                </View>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  viewAllText: {
    fontSize: 12,
    color: '#FF6B35',
    fontFamily: 'Inter-Medium',
  },
  leaderboardCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  currentUserItem: {
    backgroundColor: '#FF6B3520',
    borderRadius: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 0,
    marginHorizontal: -8,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
  },
  rankText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginLeft: 6,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    marginLeft: 16,
  },
  statValue: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B3520',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 2,
  },
  streakText: {
    fontSize: 12,
    color: '#FF6B35',
    fontFamily: 'Inter-Bold',
    marginLeft: 2,
  },
});