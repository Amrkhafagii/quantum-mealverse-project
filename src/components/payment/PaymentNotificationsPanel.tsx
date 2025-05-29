
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentNotification } from '@/types/payment-flow';
import { Bell, DollarSign, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

interface PaymentNotificationsPanelProps {
  notifications: PaymentNotification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  loading?: boolean;
}

export const PaymentNotificationsPanel: React.FC<PaymentNotificationsPanelProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  loading = false
}) => {
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'tip_received':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'payment_confirmed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'payment_failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatNotificationTime = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInHours = (now.getTime() - notificationTime.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return notificationTime.toLocaleDateString();
    }
  };

  return (
    <Card className="holographic-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-quantum-cyan flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Payment Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onMarkAllAsRead}
            disabled={loading}
          >
            Mark All Read
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {notifications.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <Bell className="h-8 w-8 mx-auto mb-2" />
            <p>No payment notifications</p>
          </div>
        )}

        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`border rounded-lg p-3 transition-colors ${
              notification.is_read 
                ? 'border-gray-600 bg-gray-900/50' 
                : 'border-quantum-cyan/50 bg-quantum-darkBlue/30'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getNotificationIcon(notification.notification_type)}
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{notification.title}</h4>
                    {notification.amount && (
                      <Badge variant="outline" className="text-green-500 border-green-500">
                        ${notification.amount.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-2">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatNotificationTime(notification.sent_at)}</span>
                    {notification.is_read && notification.read_at && (
                      <span>• Read {formatNotificationTime(notification.read_at)}</span>
                    )}
                  </div>
                </div>
              </div>

              {!notification.is_read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  disabled={loading}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
