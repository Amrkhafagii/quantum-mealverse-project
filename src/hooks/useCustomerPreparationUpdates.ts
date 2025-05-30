
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from '@/components/ui/use-toast';

export const useCustomerPreparationUpdates = (orderId: string) => {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { showNotification, permission } = usePushNotifications();

  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`customer_preparation_${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'order_preparation_stages',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          console.log('Preparation stage updated:', payload);
          
          const newStage = payload.new;
          const oldStage = payload.old;
          
          // Only notify on significant status changes
          if (oldStage.status !== newStage.status) {
            setLastUpdate(new Date());
            
            let title = 'Order Update';
            let message = '';
            
            switch (newStage.status) {
              case 'in_progress':
                if (newStage.stage_name === 'cooking') {
                  title = '🍳 Cooking Started';
                  message = 'Your meal is now being cooked!';
                } else if (newStage.stage_name === 'ingredients_prep') {
                  title = '👨‍🍳 Preparation Started';
                  message = 'Our chefs are preparing your ingredients';
                } else {
                  title = '📋 Stage Update';
                  message = `${newStage.stage_name.replace('_', ' ')} has started`;
                }
                break;
                
              case 'completed':
                if (newStage.stage_name === 'ready') {
                  title = '✅ Order Ready!';
                  message = 'Your order is ready for pickup/delivery';
                } else if (newStage.stage_name === 'cooking') {
                  title = '🎉 Cooking Complete';
                  message = 'Your meal has been cooked to perfection!';
                } else {
                  title = '✓ Stage Complete';
                  message = `${newStage.stage_name.replace('_', ' ')} completed`;
                }
                break;
            }
            
            // Show toast notification
            toast({
              title,
              description: message,
              duration: 5000,
            });
            
            // Show push notification only if permission granted
            if (permission === 'granted') {
              showNotification(title, message, {
                orderId,
                stage: newStage.stage_name,
                status: newStage.status
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, showNotification, permission]);

  return {
    lastUpdate
  };
};
