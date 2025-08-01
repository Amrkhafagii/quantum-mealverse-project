import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  SocialFeedPost,
  PostComment,
  getSocialFeedWithStats,
  togglePostLike,
  addPostComment,
  getPostComments,
  createWorkoutPost,
  createAchievementPost,
  createProgressPost,
  deletePost,
  getUserPosts,
  searchPosts,
} from '@/lib/socialFeed';

export function useSocialFeed(userId?: string) {
  const [posts, setPosts] = useState<SocialFeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial feed
  const loadFeed = useCallback(async () => {
    try {
      setError(null);
      const feedPosts = await getSocialFeedWithStats(userId);
      setPosts(feedPosts);
    } catch (err) {
      console.error('Error loading social feed:', err);
      setError('Failed to load social feed');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Refresh feed
  const refreshFeed = useCallback(async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  }, [loadFeed]);

  // Set up realtime subscriptions
  useEffect(() => {
    loadFeed();

    // Subscribe to new posts
    const postsSubscription = supabase
      .channel('social_posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_posts',
          filter: 'is_public=eq.true',
        },
        async (payload) => {
          console.log('Post change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Add new post to the beginning of the feed
            const newPost = await getSocialFeedWithStats(userId, 1);
            if (newPost.length > 0) {
              setPosts(prevPosts => [newPost[0], ...prevPosts]);
            }
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted post from feed
            setPosts(prevPosts => 
              prevPosts.filter(post => post.id !== payload.old.id)
            );
          } else if (payload.eventType === 'UPDATE') {
            // Update existing post
            setPosts(prevPosts =>
              prevPosts.map(post =>
                post.id === payload.new.id
                  ? { ...post, ...payload.new }
                  : post
              )
            );
          }
        }
      )
      .subscribe();

    // Subscribe to likes changes
    const likesSubscription = supabase
      .channel('post_likes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes',
        },
        async (payload) => {
          console.log('Like change detected:', payload);
          
          const postId = payload.new?.post_id || payload.old?.post_id;
          if (!postId) return;

          // Update the likes count for the affected post
          setPosts(prevPosts =>
            prevPosts.map(post => {
              if (post.id === postId) {
                if (payload.eventType === 'INSERT') {
                  return {
                    ...post,
                    likes_count: post.likes_count + 1,
                    user_has_liked: payload.new.user_id === userId ? true : post.user_has_liked,
                  };
                } else if (payload.eventType === 'DELETE') {
                  return {
                    ...post,
                    likes_count: Math.max(0, post.likes_count - 1),
                    user_has_liked: payload.old.user_id === userId ? false : post.user_has_liked,
                  };
                }
              }
              return post;
            })
          );
        }
      )
      .subscribe();

    // Subscribe to comments changes
    const commentsSubscription = supabase
      .channel('post_comments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_comments',
        },
        async (payload) => {
          console.log('Comment change detected:', payload);
          
          const postId = payload.new?.post_id || payload.old?.post_id;
          if (!postId) return;

          // Update the comments count for the affected post
          setPosts(prevPosts =>
            prevPosts.map(post => {
              if (post.id === postId) {
                if (payload.eventType === 'INSERT') {
                  return {
                    ...post,
                    comments_count: post.comments_count + 1,
                  };
                } else if (payload.eventType === 'DELETE') {
                  return {
                    ...post,
                    comments_count: Math.max(0, post.comments_count - 1),
                  };
                }
              }
              return post;
            })
          );
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(postsSubscription);
      supabase.removeChannel(likesSubscription);
      supabase.removeChannel(commentsSubscription);
    };
  }, [loadFeed, userId]);

  // Like/unlike a post
  const handleToggleLike = async (postId: number) => {
    if (!userId) return;

    try {
      const isLiked = await togglePostLike(postId, userId);
      
      // Optimistically update the UI
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                likes_count: isLiked ? post.likes_count + 1 : post.likes_count - 1,
                user_has_liked: isLiked,
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      setError('Failed to update like');
    }
  };

  // Add a comment to a post
  const handleAddComment = async (postId: number, content: string) => {
    if (!userId) return null;

    try {
      const comment = await addPostComment(postId, userId, content);
      
      if (comment) {
        // Optimistically update the comments count
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? { ...post, comments_count: post.comments_count + 1 }
              : post
          )
        );
      }
      
      return comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
      return null;
    }
  };

  // Create a new workout post
  const handleCreateWorkoutPost = async (content: string, workoutSessionId?: number) => {
    if (!userId) return null;

    try {
      const post = await createWorkoutPost(userId, content, workoutSessionId);
      if (post) {
        // The realtime subscription will handle adding it to the feed
        return post;
      }
    } catch (error) {
      console.error('Error creating workout post:', error);
      setError('Failed to create post');
    }
    return null;
  };

  // Create a new achievement post
  const handleCreateAchievementPost = async (content: string, achievementId: number) => {
    if (!userId) return null;

    try {
      const post = await createAchievementPost(userId, content, achievementId);
      if (post) {
        // The realtime subscription will handle adding it to the feed
        return post;
      }
    } catch (error) {
      console.error('Error creating achievement post:', error);
      setError('Failed to create post');
    }
    return null;
  };

  // Create a new progress post
  const handleCreateProgressPost = async (content: string, mediaUrls?: string[]) => {
    if (!userId) return null;

    try {
      const post = await createProgressPost(userId, content, mediaUrls);
      if (post) {
        // The realtime subscription will handle adding it to the feed
        return post;
      }
    } catch (error) {
      console.error('Error creating progress post:', error);
      setError('Failed to create post');
    }
    return null;
  };

  // Delete a post
  const handleDeletePost = async (postId: number) => {
    if (!userId) return false;

    try {
      const success = await deletePost(postId, userId);
      if (success) {
        // Optimistically remove from UI
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      }
      return success;
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post');
      return false;
    }
  };

  // Search posts
  const handleSearchPosts = async (query: string) => {
    try {
      setLoading(true);
      const searchResults = await searchPosts(query, userId);
      setPosts(searchResults);
    } catch (error) {
      console.error('Error searching posts:', error);
      setError('Failed to search posts');
    } finally {
      setLoading(false);
    }
  };

  // Get user's own posts
  const handleGetUserPosts = async (targetUserId: string) => {
    try {
      setLoading(true);
      const userPosts = await getUserPosts(targetUserId);
      setPosts(userPosts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setError('Failed to fetch user posts');
    } finally {
      setLoading(false);
    }
  };

  return {
    posts,
    loading,
    refreshing,
    error,
    refreshFeed,
    toggleLike: handleToggleLike,
    addComment: handleAddComment,
    createWorkoutPost: handleCreateWorkoutPost,
    createAchievementPost: handleCreateAchievementPost,
    createProgressPost: handleCreateProgressPost,
    deletePost: handleDeletePost,
    searchPosts: handleSearchPosts,
    getUserPosts: handleGetUserPosts,
    clearError: () => setError(null),
  };
}