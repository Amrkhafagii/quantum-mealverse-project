import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Search, Trophy, Users, TrendingUp, Heart, MessageCircle, Share2, Filter } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useSocialFeed } from '@/hooks/useSocialFeed';
import SocialFeedPost from '@/components/SocialFeedPost';
import PostCommentsModal from '@/components/PostCommentsModal';
import CreatePostModal from '@/components/CreatePostModal';
import SocialLeaderboard from '@/components/SocialLeaderboard';
import SocialStatsCard from '@/components/SocialStatsCard';

export default function SocialScreen() {
  const { user } = useAuth();
  const {
    posts,
    loading,
    refreshing,
    error,
    refreshFeed,
    toggleLike,
    createWorkoutPost,
    createAchievementPost,
    createProgressPost,
    deletePost,
  } = useSocialFeed(user?.id);

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Mock leaderboard data - in production, this would come from the database
  const leaderboard = [
    { 
      id: '1',
      name: 'Alex Thompson', 
      username: 'alex_fit',
      points: 2450, 
      rank: 1, 
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      streak: 28,
      workouts: 156
    },
    { 
      id: '2',
      name: 'Sarah Johnson', 
      username: 'sarah_strong',
      points: 2380, 
      rank: 2, 
      avatar: 'https://images.pexels.com/photos/3823488/pexels-photo-3823488.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      streak: 21,
      workouts: 142
    },
    { 
      id: '3',
      name: 'Mike Chen', 
      username: 'mike_muscle',
      points: 2290, 
      rank: 3, 
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      streak: 15,
      workouts: 128
    },
    { 
      id: user?.id || '4',
      name: 'You', 
      username: 'your_username',
      points: 2180, 
      rank: 4, 
      avatar: 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      streak: 12,
      workouts: 98
    },
  ];

  // Mock social stats
  const socialStats = [
    { label: 'Following', value: '127', icon: Users, color: '#4A90E2' },
    { label: 'Followers', value: '89', icon: Heart, color: '#E74C3C' },
    { label: 'Posts', value: '34', icon: MessageCircle, color: '#27AE60' },
    { label: 'Likes', value: '456', icon: Heart, color: '#FF6B35' },
  ];

  const filterOptions = [
    { id: 'all', name: 'All Posts', icon: TrendingUp },
    { id: 'workout', name: 'Workouts', icon: Trophy },
    { id: 'achievement', name: 'Achievements', icon: Trophy },
    { id: 'progress', name: 'Progress', icon: TrendingUp },
    { id: 'following', name: 'Following', icon: Users },
  ];

  const handleLike = async (postId: number) => {
    try {
      await toggleLike(postId);
    } catch (error) {
      Alert.alert('Error', 'Failed to update like. Please try again.');
    }
  };

  const handleComment = (postId: number) => {
    setSelectedPostId(postId);
    setShowComments(true);
  };

  const handleShare = (postId: number) => {
    Alert.alert('Share Post', 'Share functionality coming soon!');
  };

  const handleDeletePost = async (postId: number) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deletePost(postId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete post. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleCreatePost = async (content: string, type: 'general' | 'workout' | 'achievement' | 'progress') => {
    try {
      switch (type) {
        case 'workout':
          await createWorkoutPost(content);
          break;
        case 'achievement':
          // For demo purposes, we'll create a general post
          // In a real app, you'd select a specific achievement
          await createAchievementPost(content, 1);
          break;
        case 'progress':
          await createProgressPost(content);
          break;
        default:
          await createProgressPost(content); // General posts as progress posts
          break;
      }
      setShowCreatePost(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    }
  };

  const filteredPosts = selectedFilter === 'all' 
    ? posts 
    : posts.filter(post => post.post_type === selectedFilter);

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshFeed} />
      }
    >
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Social</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Search size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowCreatePost(true)}
            >
              <Plus size={24} color="#FF6B35" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Connect with the fitness community</Text>
      </LinearGradient>

      {/* Social Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          {socialStats.map((stat, index) => (
            <SocialStatsCard
              key={index}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </View>
      </View>

      {/* Weekly Leaderboard */}
      <SocialLeaderboard leaderboard={leaderboard} currentUserId={user?.id} />

      {/* Filter Options */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <filter.icon 
                size={16} 
                color={selectedFilter === filter.id ? '#fff' : '#999'} 
              />
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === filter.id && styles.filterButtonTextActive,
                ]}
              >
                {filter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Social Feed */}
      <View style={styles.feedContainer}>
        <View style={styles.feedHeader}>
          <Text style={styles.sectionTitle}>Community Feed</Text>
          <TouchableOpacity style={styles.filterIconButton}>
            <Filter size={20} color="#999" />
          </TouchableOpacity>
        </View>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refreshFeed}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && posts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading feed...</Text>
          </View>
        ) : filteredPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Trophy size={48} color="#666" />
            <Text style={styles.emptyTitle}>
              {selectedFilter === 'all' ? 'No posts yet' : `No ${selectedFilter} posts`}
            </Text>
            <Text style={styles.emptyText}>
              {selectedFilter === 'all' 
                ? 'Be the first to share your fitness journey!'
                : `No ${selectedFilter} posts to show. Try a different filter.`
              }
            </Text>
            {selectedFilter === 'all' && (
              <TouchableOpacity 
                style={styles.createFirstPostButton}
                onPress={() => setShowCreatePost(true)}
              >
                <Text style={styles.createFirstPostText}>Create Post</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredPosts.map((post) => (
            <SocialFeedPost
              key={post.id}
              post={post}
              currentUserId={user?.id}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              onDelete={handleDeletePost}
            />
          ))
        )}
      </View>

      {/* Create Post Modal */}
      <CreatePostModal
        visible={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onCreatePost={handleCreatePost}
      />

      {/* Comments Modal */}
      {selectedPostId && (
        <PostCommentsModal
          visible={showComments}
          postId={selectedPostId}
          userId={user?.id}
          onClose={() => {
            setShowComments(false);
            setSelectedPostId(null);
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  feedContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
    paddingBottom: 100,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  filterIconButton: {
    padding: 8,
  },
  errorContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  createFirstPostButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createFirstPostText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
});