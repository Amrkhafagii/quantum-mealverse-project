import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellRing, Clock, CheckCircle } from 'lucide-react';
import { useRestaurantNotifications } from '@/hooks/useRestaurantNotifications';
import type { Notification } from '@/types/notifications';

const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}> = ({ notification, onMarkAsRead }) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order':
        return <BellRing className="h-4 w-4 text-blue-500" />;
      case 'order_accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'assignment_received':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_order':
        return 'bg-blue-100 text-blue-800';
      case 'order_accepted':
        return 'bg-green-100 text-green-800';
      case 'assignment_received':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className={`p-4 border-l-4 ${
        notification.is_read 
          ? 'border-gray-200 bg-gray-50' 
          : 'border-blue-500 bg-blue-50'
      } rounded-r-lg mb-3`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getNotificationIcon(notification.notification_type)}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-gray-900">{notification.title}</h4>
              <Badge className={getNotificationColor(notification.notification_type)}>
                {notification.notification_type.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{notification.message}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(notification.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        {!notification.is_read && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkAsRead(notification.id)}
            className="text-xs"
          >
            Mark as read
          </Button>
        )}
      </div>
    </div>
  );
};

export const NotificationCenter: React.FC = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useRestaurantNotifications();
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle>Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No notifications yet</p>
            <p className="text-sm">You'll see order updates and assignments here</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
