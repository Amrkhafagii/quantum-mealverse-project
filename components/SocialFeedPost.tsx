import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Heart, MessageCircle, Share2, MoveHorizontal as MoreHorizontal, Trophy, Zap, Calendar, Clock, Target } from 'lucide-react-native';
import { SocialFeedPost } from '@/lib/socialFeed';

interface SocialFeedPostProps {
  post: SocialFeedPost;
  currentUserId?: string;
  onLike: (postId: number) => void;
  onComment: (postId: number) => void;
  onShare: (postId: number) => void;
  onDelete?: (postId: number) => void;
}

export default function SocialFeedPostComponent({
  post,
  currentUserId,
  onLike,
  onComment,
  onShare,
  onDelete,
}: SocialFeedPostProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleMorePress = () => {
    if (post.user_id === currentUserId && onDelete) {
      Alert.alert(
        'Post Options',
        'What would you like to do?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete Post', style: 'destructive', onPress: () => onDelete(post.id) },
        ]
      );
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return postDate.toLocaleDateString();
  };

  const getPostTypeIcon = () => {
    switch (post.post_type) {
      case 'workout':
        return <Trophy size={16} color="#FF6B35" />;
      case 'achievement':
        return <Trophy size={16} color="#FFD700" />;
      case 'progress':
        return <Zap size={16} color="#27AE60" />;
      default:
        return <MessageCircle size={16} color="#4A90E2" />;
    }
  };

  const getPostTypeLabel = () => {
    switch (post.post_type) {
      case 'workout':
        return 'Workout';
      case 'achievement':
        return 'Achievement';
      case 'progress':
        return 'Progress';
      default:
        return 'Post';
    }
  };

  return (
    <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <Image 
          source={{ 
            uri: post.profile.avatar_url || 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
          }} 
          style={styles.userAvatar} 
        />
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>
              {post.profile.full_name || post.profile.username}
            </Text>
            <View style={styles.postTypeBadge}>
              {getPostTypeIcon()}
              <Text style={styles.postTypeText}>{getPostTypeLabel()}</Text>
            </View>
          </View>
          <Text style={styles.userHandle}>@{post.profile.username}</Text>
        </View>
        <View style={styles.postMeta}>
          <Text style={styles.timestamp}>{formatTimeAgo(post.created_at)}</Text>
          {post.user_id === currentUserId && (
            <TouchableOpacity style={styles.moreButton} onPress={handleMorePress}>
              <MoreHorizontal size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Post Content */}
      <Text style={styles.postContent}>{post.content}</Text>

      {/* Post Type Specific Content */}
      {post.post_type === 'workout' && post.workout_session && (
        <View style={styles.workoutCard}>
          <View style={styles.workoutHeader}>
            <View style={styles.workoutIconContainer}>
              <Trophy size={20} color="#FF6B35" />
            </View>
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>{post.workout_session.name}</Text>
              <View style={styles.workoutStats}>
                {post.workout_session.duration_minutes && (
                  <View style={styles.workoutStat}>
                    <Clock size={14} color="#999" />
                    <Text style={styles.workoutStatText}>
                      {post.workout_session.duration_minutes} min
                    </Text>
                  </View>
                )}
                {post.workout_session.calories_burned && (
                  <View style={styles.workoutStat}>
                    <Zap size={14} color="#999" />
                    <Text style={styles.workoutStatText}>
                      {post.workout_session.calories_burned} cal
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      )}

      {post.post_type === 'achievement' && post.achievement && (
        <View style={styles.achievementCard}>
          <View style={styles.achievementIcon}>
            <Trophy size={24} color="#FFD700" />
          </View>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementTitle}>{post.achievement.name}</Text>
            <Text style={styles.achievementDescription}>
              {post.achievement.description}
            </Text>
          </View>
          <View style={styles.achievementBadge}>
            <Text style={styles.achievementBadgeText}>🏆</Text>
          </View>
        </View>
      )}

      {post.post_type === 'progress' && (
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.progressIcon}>
              <Zap size={20} color="#27AE60" />
            </View>
            <Text style={styles.progressTitle}>Progress Update</Text>
          </View>
          <Text style={styles.progressDetails}>Keep pushing forward! 💪</Text>
        </View>
      )}

      {/* Media */}
      {post.media_urls && post.media_urls.length > 0 && (
        <View style={styles.mediaContainer}>
          {post.media_urls.slice(0, 4).map((url, index) => (
            <Image key={index} source={{ uri: url }} style={styles.mediaImage} />
          ))}
        </View>
      )}

      {/* Post Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => onLike(post.id)}
        >
          <Heart 
            size={20} 
            color={post.user_has_liked ? "#E74C3C" : "#999"} 
            fill={post.user_has_liked ? "#E74C3C" : "none"}
          />
          <Text style={[
            styles.actionText,
            post.user_has_liked && styles.likedText
          ]}>
            {post.likes_count}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => onComment(post.id)}
        >
          <MessageCircle size={20} color="#999" />
          <Text style={styles.actionText}>{post.comments_count}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => onShare(post.id)}
        >
          <Share2 size={20} color="#999" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginRight: 8,
  },
  postTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  postTypeText: {
    fontSize: 10,
    color: '#ccc',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  userHandle: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  postMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  moreButton: {
    padding: 4,
  },
  postContent: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginBottom: 12,
  },
  workoutCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutIconContainer: {
    backgroundColor: '#FF6B3520',
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  workoutStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  workoutStatText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginLeft: 4,
  },
  achievementCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    padding: 8,
    backgroundColor: '#FFD70020',
    borderRadius: 8,
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  achievementBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    padding: 4,
  },
  achievementBadgeText: {
    fontSize: 16,
  },
  progressCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27AE60',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressIcon: {
    backgroundColor: '#27AE6020',
    padding: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  progressTitle: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  progressDetails: {
    fontSize: 12,
    color: '#27AE60',
    fontFamily: 'Inter-Medium',
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  mediaImage: {
    width: '48%',
    height: 120,
    borderRadius: 8,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginLeft: 6,
  },
  likedText: {
    color: '#E74C3C',
  },
});