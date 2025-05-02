
import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

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
  
  const hasUnread = unreadCount > 0;
  
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
