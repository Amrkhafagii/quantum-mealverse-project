
import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Bell, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { Link, useNavigate } from 'react-router-dom';

const Notifications = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    isLoading, 
    markAsRead, 
    markAllAsRead,
    unreadCount
  } = useNotifications();

  const handleNotificationClick = async (notificationId: string, link?: string) => {
    await markAsRead(notificationId);
    if (link) {
      navigate(link);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_status':
        return <div className="w-2 h-2 rounded-full bg-blue-500" />;
      case 'system':
        return <div className="w-2 h-2 rounded-full bg-yellow-500" />;
      case 'promotion':
        return <div className="w-2 h-2 rounded-full bg-green-500" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-4 pt-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-quantum-cyan">Notifications</h1>
        </div>

        {notifications.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => markAllAsRead()}
          >
            <Check className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No notifications</h2>
            <p className="text-muted-foreground max-w-md">
              You don't have any notifications yet. When you receive new notifications, they will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-160px)]">
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`cursor-pointer hover:border-quantum-cyan transition-colors ${
                  !notification.is_read ? 'bg-quantum-darkBlue/30 border-quantum-cyan/30' : ''
                }`}
                onClick={() => handleNotificationClick(notification.id, notification.link)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <h3 className="font-medium">{notification.title}</h3>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default Notifications;
