import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PostComment, getPostComments, addPostComment } from '@/lib/socialFeed';

export function usePostComments(postId: number, userId?: string) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load comments
  const loadComments = async () => {
    try {
      setError(null);
      const postComments = await getPostComments(postId);
      setComments(postComments);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  // Set up realtime subscription for comments
  useEffect(() => {
    loadComments();

    const subscription = supabase
      .channel(`post_comments_${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_comments',
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          console.log('Comment change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Add new comment
            const { data: newComment, error } = await supabase
              .from('post_comments')
              .select(`
                *,
                profile:profiles(username, full_name, avatar_url)
              `)
              .eq('id', payload.new.id)
              .single();

            if (!error && newComment) {
              setComments(prevComments => [...prevComments, newComment as PostComment]);
            }
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted comment
            setComments(prevComments =>
              prevComments.filter(comment => comment.id !== payload.old.id)
            );
          } else if (payload.eventType === 'UPDATE') {
            // Update existing comment
            setComments(prevComments =>
              prevComments.map(comment =>
                comment.id === payload.new.id
                  ? { ...comment, ...payload.new }
                  : comment
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [postId]);

  // Add a comment
  const addComment = async (content: string) => {
    if (!userId) return null;

    try {
      const comment = await addPostComment(postId, userId, content);
      // The realtime subscription will handle adding it to the list
      return comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
      return null;
    }
  };

  return {
    comments,
    loading,
    error,
    addComment,
    refreshComments: loadComments,
    clearError: () => setError(null),
  };
}