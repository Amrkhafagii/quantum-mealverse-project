
import React, { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { useBadge } from '@/hooks/useBadge';
import { Platform } from '@/utils/platform';

interface NotificationBadgeProps {
  className?: string;
  variant?: 'default' | 'small';
  onClick?: () => void;
}

export const NotificationBadge = ({ 
  className, 
  variant = 'default',
  onClick 
}: NotificationBadgeProps) => {
  const { unreadCount } = useNotifications();
  const { updateBadgeCount, isSupported } = useBadge();
  
  const hasUnread = unreadCount > 0;
  
  // Update app icon badge when unread count changes
  useEffect(() => {
    if (isSupported && Platform.isNative()) {
      updateBadgeCount(unreadCount);
    }
  }, [unreadCount, isSupported, updateBadgeCount]);
  
  return (
    <button 
      className={cn(
        "relative flex items-center text-muted-foreground hover:text-white transition-colors", 
        className
      )}
      onClick={onClick}
      aria-label={`Notifications ${hasUnread ? `(${unreadCount} unread)` : ''}`}
    >
      <Bell className={variant === 'small' ? "h-4 w-4" : "h-5 w-5"} />
      
      {hasUnread && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};
