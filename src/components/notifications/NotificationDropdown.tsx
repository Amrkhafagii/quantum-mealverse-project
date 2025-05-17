
import React, { useEffect } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Notification } from '@/types/notification';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationBadge } from './NotificationBadge';
import { useNavigate } from 'react-router-dom';
import { useBadge } from '@/hooks/useBadge';
import { Platform } from '@/utils/platform';

export const NotificationDropdown = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    isLoading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  const { updateBadgeCount, isSupported } = useBadge();
  
  // When dropdown opens, sync the badge with actual notifications
  const handleDropdownOpenChange = (open: boolean) => {
    if (open && isSupported && Platform.isNative()) {
      // Ensure the app badge matches the actual unread count
      const unreadCount = notifications.filter(n => !n.is_read).length;
      updateBadgeCount(unreadCount);
    }
  };
  
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_status':
        return <span className="h-2 w-2 rounded-full bg-blue-500" />;
      case 'system':
        return <span className="h-2 w-2 rounded-full bg-yellow-500" />;
      case 'promotion':
        return <span className="h-2 w-2 rounded-full bg-green-500" />;
      default:
        return <span className="h-2 w-2 rounded-full bg-gray-500" />;
    }
  };
  
  return (
    <DropdownMenu onOpenChange={handleDropdownOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <NotificationBadge />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs" 
              onClick={markAllAsRead}
            >
              <Check className="mr-1 h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <DropdownMenuGroup>
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex cursor-pointer flex-col items-start py-2 px-4 ${
                    !notification.is_read ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex w-full items-center gap-2">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 text-sm font-medium">
                      {notification.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {notification.message}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
