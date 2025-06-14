import React, { useState, useEffect } from 'react';
import { Award, X, Trophy, TrendingUp, Bell, Calendar, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface FitnessNotification {
  id: string;
  title: string;
  message: string;
  notification_type: 'achievement' | 'goal' | 'reminder' | 'streak' | 'measurement' | 'workout';
  read?: boolean;
  date: Date;
}

interface FitnessNotificationProps {
  notification: FitnessNotification;
  onDismiss: (id: string) => void;
}

export const FitnessNotificationItem: React.FC<FitnessNotificationProps> = ({ 
  notification,
  onDismiss
}) => {
  const getIcon = () => {
    switch (notification.notification_type) {
      case 'achievement':
        return <Trophy className="h-5 w-5 text-yellow-400" />;
      case 'goal':
        return <Award className="h-5 w-5 text-blue-400" />;
      case 'streak':
        return <Zap className="h-5 w-5 text-purple-400" />;
      case 'measurement':
        return <TrendingUp className="h-5 w-5 text-green-400" />;
      case 'workout':
        return <Calendar className="h-5 w-5 text-cyan-400" />;
      default:
        return <Bell className="h-5 w-5 text-gray-400" />;
    }
  };

  const getBgColor = () => {
    switch (notification.notification_type) {
      case 'achievement':
        return 'bg-yellow-900/30 border-yellow-600/30';
      case 'goal':
        return 'bg-blue-900/30 border-blue-600/30';
      case 'streak':
        return 'bg-purple-900/30 border-purple-600/30';
      case 'measurement':
        return 'bg-green-900/30 border-green-600/30';
      case 'workout':
        return 'bg-cyan-900/30 border-cyan-600/30';
      default:
        return 'bg-gray-800/30 border-gray-600/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`rounded-lg border p-4 shadow-md ${getBgColor()}`}
    >
      <div className="flex items-start">
        <div className="mr-4 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-white">{notification.title}</h3>
          <p className="text-sm text-gray-300">{notification.message}</p>
          <p className="text-xs text-gray-400 mt-1">
            {notification.date.toLocaleTimeString([], { 
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </p>
        </div>
        <button 
          onClick={() => onDismiss(notification.id)}
          className="ml-2 text-gray-400 hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

interface FitnessNotificationsProps {
  userId?: string;
  limit?: number;
}

export const FitnessNotifications: React.FC<FitnessNotificationsProps> = ({ 
  userId,
  limit = 5
}) => {
  const [notifications, setNotifications] = useState<FitnessNotification[]>([]);
  const [showAll, setShowAll] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId]);
  
  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('notifications_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(showAll ? 20 : limit);
        
      if (error) throw error;
      
      const mappedData: FitnessNotification[] = (data || []).map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        notification_type: n.notification_type as any,
        read: n.is_read,
        date: new Date(n.created_at)
      }));
      
      setNotifications(mappedData);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };
  
  const dismissNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
        
      if (error) throw error;
      
      // Remove from local state
      setNotifications(notifications.filter(n => n.id !== id));
      
    } catch (error) {
      console.error('Error dismissing notification:', error);
      toast({
        title: "Error",
        description: "Failed to dismiss notification",
        variant: "destructive",
      });
    }
  };
  
  const displayedNotifications = showAll 
    ? notifications
    : notifications.slice(0, limit);
  
  if (!userId) {
    return null;
  }
  
  if (displayedNotifications.length === 0) {
    return (
      <div className="text-center p-4 bg-quantum-darkBlue/30 rounded-lg border border-quantum-cyan/20">
        <Bell className="h-5 w-5 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-400">No new notifications</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <AnimatePresence>
        {displayedNotifications.map((notification) => (
          <FitnessNotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={dismissNotification}
          />
        ))}
      </AnimatePresence>
      
      {notifications.length > limit && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-quantum-cyan hover:text-quantum-cyan/80 w-full text-center block"
        >
          {showAll ? "Show less" : `Show all (${notifications.length})`}
        </button>
      )}
    </div>
  );
};

// Add a function to push a notification to the database
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  notification_type: FitnessNotification['notification_type'] = 'reminder',
  link?: string
) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        notifications_user_id: userId,
        title,
        message,
        notification_type,
        link,
        is_read: false,
        created_at: new Date().toISOString()
      });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
};
