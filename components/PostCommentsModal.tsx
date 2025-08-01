import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Send } from 'lucide-react-native';
import { usePostComments } from '@/hooks/usePostComments';

interface PostCommentsModalProps {
  visible: boolean;
  postId: number;
  userId?: string;
  onClose: () => void;
}

export default function PostCommentsModal({
  visible,
  postId,
  userId,
  onClose,
}: PostCommentsModalProps) {
  const { comments, loading, addComment } = usePostComments(postId, userId);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !userId || submitting) return;

    setSubmitting(true);
    try {
      await addComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return commentDate.toLocaleDateString();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Comments</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.commentsContainer} showsVerticalScrollIndicator={false}>
          {loading ? (
            <Text style={styles.loadingText}>Loading comments...</Text>
          ) : comments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No comments yet</Text>
              <Text style={styles.emptyText}>Be the first to comment!</Text>
            </View>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <Image 
                  source={{ 
                    uri: comment.profile.avatar_url || 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
                  }} 
                  style={styles.commentAvatar} 
                />
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>
                      {comment.profile.full_name || comment.profile.username}
                    </Text>
                    <Text style={styles.commentTime}>
                      {formatTimeAgo(comment.created_at)}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{comment.content}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {userId && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor="#999"
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!newComment.trim() || submitting) && styles.sendButtonDisabled,
              ]}
              onPress={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
            >
              <Send size={20} color={!newComment.trim() || submitting ? "#666" : "#FF6B35"} />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  closeButton: {
    padding: 4,
  },
  commentsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  commentCard: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  commentText: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#333',
  },
  sendButton: {
    marginLeft: 12,
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});