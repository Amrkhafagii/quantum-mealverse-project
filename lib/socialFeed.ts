import { supabase, SocialPost, createSocialPost } from './supabase';

export interface SocialFeedPost extends SocialPost {
  profile: {
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
  workout_session?: {
    name: string;
    duration_minutes?: number;
    calories_burned?: number;
  };
  achievement?: {
    name: string;
    description: string;
    icon?: string;
  };
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
}

export interface PostComment {
  id: number;
  user_id: string;
  post_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  profile: {
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
}

interface PostLike {
  id: number;
  user_id: string;
  post_id: number;
  created_at: string;
}

// Get social feed with realtime data
export const getSocialFeedWithStats = async (
  userId?: string,
  limit: number = 20
): Promise<SocialFeedPost[]> => {
  try {
    const { data: posts, error } = await supabase
      .from('social_posts')
      .select(`
        *,
        profile:profiles(username, full_name, avatar_url),
        workout_session:workout_sessions(name, duration_minutes, calories_burned),
        achievement:achievements(name, description, icon)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Get likes and comments counts for each post
    const postsWithStats = await Promise.all(
      (posts || []).map(async (post) => {
        // Get likes count and check if current user liked
        const { data: likes, error: likesError } = await supabase
          .from('post_likes')
          .select('user_id')
          .eq('post_id', post.id);

        if (likesError) throw likesError;

        const likesCount = likes?.length || 0;
        const userHasLiked = userId ? likes?.some(like => like.user_id === userId) || false : false;

        // Get comments count
        const { data: comments, error: commentsError } = await supabase
          .from('post_comments')
          .select('id')
          .eq('post_id', post.id);

        if (commentsError) throw commentsError;

        const commentsCount = comments?.length || 0;

        return {
          ...post,
          likes_count: likesCount,
          comments_count: commentsCount,
          user_has_liked: userHasLiked,
        } as SocialFeedPost;
      })
    );

    return postsWithStats;
  } catch (error) {
    console.error('Error fetching social feed:', error);
    return [];
  }
};

// Like or unlike a post
export const togglePostLike = async (postId: number, userId: string): Promise<boolean> => {
  try {
    // Check if user already liked the post
    const { data: existingLike, error: checkError } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (existingLike) {
      // Unlike the post
      const { error: deleteError } = await supabase
        .from('post_likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) throw deleteError;
      return false; // Post was unliked
    } else {
      // Like the post
      const { error: insertError } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: userId,
        });

      if (insertError) throw insertError;
      return true; // Post was liked
    }
  } catch (error) {
    console.error('Error toggling post like:', error);
    throw error;
  }
};

// Add a comment to a post
export const addPostComment = async (
  postId: number,
  userId: string,
  content: string
): Promise<PostComment | null> => {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content,
      })
      .select(`
        *,
        profile:profiles(username, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data as PostComment;
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
};

// Get comments for a post
export const getPostComments = async (postId: number): Promise<PostComment[]> => {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        profile:profiles(username, full_name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as PostComment[];
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

// Create a workout post
export const createWorkoutPost = async (
  userId: string,
  content: string,
  workoutSessionId?: number
): Promise<SocialPost | null> => {
  try {
    const postData = {
      user_id: userId,
      content,
      post_type: 'workout' as const,
      workout_session_id: workoutSessionId,
      is_public: true,
    };

    const { data, error } = await createSocialPost(postData);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating workout post:', error);
    return null;
  }
};

// Create an achievement post
export const createAchievementPost = async (
  userId: string,
  content: string,
  achievementId: number
): Promise<SocialPost | null> => {
  try {
    const postData = {
      user_id: userId,
      content,
      post_type: 'achievement' as const,
      achievement_id: achievementId,
      is_public: true,
    };

    const { data, error } = await createSocialPost(postData);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating achievement post:', error);
    return null;
  }
};

// Create a progress post
export const createProgressPost = async (
  userId: string,
  content: string,
  mediaUrls?: string[]
): Promise<SocialPost | null> => {
  try {
    const postData = {
      user_id: userId,
      content,
      post_type: 'progress' as const,
      media_urls: mediaUrls,
      is_public: true,
    };

    const { data, error } = await createSocialPost(postData);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating progress post:', error);
    return null;
  }
};

// Delete a post (only by the author)
export const deletePost = async (postId: number, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
};

// Get user's own posts
export const getUserPosts = async (userId: string): Promise<SocialFeedPost[]> => {
  try {
    const { data: posts, error } = await supabase
      .from('social_posts')
      .select(`
        *,
        profile:profiles(username, full_name, avatar_url),
        workout_session:workout_sessions(name, duration_minutes, calories_burned),
        achievement:achievements(name, description, icon)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get likes and comments counts for each post
    const postsWithStats = await Promise.all(
      (posts || []).map(async (post) => {
        const { data: likes } = await supabase
          .from('post_likes')
          .select('user_id')
          .eq('post_id', post.id);

        const { data: comments } = await supabase
          .from('post_comments')
          .select('id')
          .eq('post_id', post.id);

        return {
          ...post,
          likes_count: likes?.length || 0,
          comments_count: comments?.length || 0,
          user_has_liked: likes?.some(like => like.user_id === userId) || false,
        } as SocialFeedPost;
      })
    );

    return postsWithStats;
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return [];
  }
};

// Search posts by content
export const searchPosts = async (query: string, userId?: string): Promise<SocialFeedPost[]> => {
  try {
    const { data: posts, error } = await supabase
      .from('social_posts')
      .select(`
        *,
        profile:profiles(username, full_name, avatar_url),
        workout_session:workout_sessions(name, duration_minutes, calories_burned),
        achievement:achievements(name, description, icon)
      `)
      .eq('is_public', true)
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Get likes and comments counts for each post
    const postsWithStats = await Promise.all(
      (posts || []).map(async (post) => {
        const { data: likes } = await supabase
          .from('post_likes')
          .select('user_id')
          .eq('post_id', post.id);

        const { data: comments } = await supabase
          .from('post_comments')
          .select('id')
          .eq('post_id', post.id);

        return {
          ...post,
          likes_count: likes?.length || 0,
          comments_count: comments?.length || 0,
          user_has_liked: userId ? likes?.some(like => like.user_id === userId) || false : false,
        } as SocialFeedPost;
      })
    );

    return postsWithStats;
  } catch (error) {
    console.error('Error searching posts:', error);
    return [];
  }
};