
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, Package, Info, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  type: string;
  link?: string;
}

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notificationsExist, setNotificationsExist] = useState(true);

  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Check if any notifications exist
      if (data.length === 0) {
        setNotificationsExist(false);
      }
      
      return data as Notification[];
    },
    enabled: !!user,
  });

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
      
    refetch();
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_status':
        return <Package className="h-5 w-5" />;
      case 'promotion':
        return <Calendar className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user || !notifications?.length) return;
    
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id);
      
    refetch();
  };

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-24 pb-12 container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-quantum-cyan neon-text">Notifications</h1>
          
          {notifications?.length > 0 && (
            <Button 
              variant="outline" 
              onClick={handleMarkAllAsRead}
              className="text-quantum-cyan border-quantum-cyan hover:bg-quantum-cyan/20"
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-quantum-cyan">Loading notifications...</div>
          </div>
        ) : !notificationsExist ? (
          <Card className="p-12 bg-quantum-black border-quantum-cyan/30 text-center">
            <Bell className="h-16 w-16 mx-auto mb-4 text-quantum-cyan opacity-50" />
            <h2 className="text-2xl font-semibold mb-2">No notifications yet</h2>
            <p className="text-gray-400 mb-6">
              When you receive notifications about your orders or promotions, they'll appear here.
            </p>
            <Button onClick={() => navigate('/customer')}>
              Browse Meals
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications?.map((notification) => (
              <Card 
                key={notification.id}
                className={`p-4 hover:bg-quantum-black/80 transition-colors border-l-4 ${
                  notification.is_read 
                    ? 'border-l-gray-500 bg-quantum-black/50' 
                    : 'border-l-quantum-cyan bg-quantum-black/70'
                } cursor-pointer`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${notification.is_read ? 'bg-gray-800' : 'bg-quantum-cyan/20'}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className={`font-semibold ${notification.is_read ? 'text-gray-300' : 'text-white'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`mt-1 ${notification.is_read ? 'text-gray-400' : 'text-gray-300'}`}>
                      {notification.message}
                    </p>
                    
                    {notification.link && (
                      <div className="flex justify-end mt-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-quantum-cyan hover:bg-quantum-cyan/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notification);
                          }}
                        >
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Notifications;
