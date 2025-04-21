
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sendOrderToWebhook } from '@/services/orders/webhookService';
import { cancelOrder } from '@/services/orders/orderService';
import { recordOrderHistory } from '@/services/orders/webhookService';

export const useOrderTimer = (
  expiresAt: string | undefined,
  orderId: string | undefined,
  onExpire?: () => void
) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    if (!expiresAt || !orderId) {
      return;
    }

    const expiresAtDate = new Date(expiresAt);
    const expiresAtTime = expiresAtDate.getTime();

    if (isNaN(expiresAtTime)) {
      return;
    }

    const FIVE_MINUTES = 5 * 60; // 5 minutes in seconds

    const updateTimer = async () => {
      const now = Date.now();
      const secondsLeft = Math.max(0, Math.floor((expiresAtTime - now) / 1000));
      setTimeLeft(secondsLeft);

      const progressValue = (secondsLeft / FIVE_MINUTES) * 100;
      setProgress(Math.max(0, Math.min(100, progressValue)));

      // If the timer has just expired (secondsLeft is 0 and we haven't set isExpired yet)
      if (secondsLeft === 0 && !isExpired) {
        console.log(`Timer expired for order ${orderId}`);
        setIsExpired(true);
        
        try {
          // Check if any assignments are still pending for this order
          const { data: pendingAssignments, error } = await supabase
            .from('restaurant_assignments')
            .select('id, restaurant_id')
            .eq('order_id', orderId)
            .eq('status', 'pending');
          
          if (error) {
            console.error('Error checking pending assignments:', error);
            throw error;
          }
          
          // Only update if there are still pending assignments
          if (pendingAssignments && pendingAssignments.length > 0) {
            console.log(`Timer expired for ${pendingAssignments.length} restaurant assignments`);
            
            // For each pending assignment, create a history entry with timed_out status
            for (const assignment of pendingAssignments) {
              // First add the assignment history record
              const { error: historyError } = await supabase
                .from('restaurant_assignment_history')
                .insert({
                  order_id: orderId,
                  restaurant_id: assignment.restaurant_id,
                  status: 'timed_out',
                  notes: 'Timer expired automatically'
                });
                
              if (historyError) {
                console.error('Error inserting assignment history:', historyError);
              }
                
              // Also record in order_history
              await recordOrderHistory(
                orderId,
                'assignment_expired',
                assignment.restaurant_id,
                { assignment_id: assignment.id },
                new Date().toISOString()
              );
            }
            
            // Then mark all pending assignments as expired in the assignments table
            const { error: updateError } = await supabase
              .from('restaurant_assignments')
              .update({ status: 'expired' })
              .eq('order_id', orderId)
              .eq('status', 'pending');
              
            if (updateError) {
              console.error('Error updating assignments to expired:', updateError);
            }
              
            // Then cancel the order if all assignments have expired
            // First check if there are any non-expired assignments left
            const { data: activeAssignments, error: activeError } = await supabase
              .from('restaurant_assignments')
              .select('id')
              .eq('order_id', orderId)
              .eq('status', 'pending');
              
            if (activeError) {
              console.error('Error checking active assignments:', activeError);
            }
              
            // If no active assignments remain and no assignment was accepted, cancel the order
            const { data: acceptedAssignments, error: acceptedError } = await supabase
              .from('restaurant_assignments')
              .select('id')
              .eq('order_id', orderId)
              .eq('status', 'accepted');
              
            if (acceptedError) {
              console.error('Error checking accepted assignments:', acceptedError);
            }
              
            if ((!activeAssignments || activeAssignments.length === 0) && 
                (!acceptedAssignments || acceptedAssignments.length === 0)) {
              await cancelOrder(orderId);
              
              // Also record order cancellation in order_history
              await recordOrderHistory(
                orderId,
                'cancelled',
                null,
                { reason: 'All restaurant assignments expired' }
              );
            }
            
            // Force a refresh of assignment data
            if (onExpire) {
              setTimeout(() => {
                onExpire();
              }, 500); // Add a small delay to ensure DB operations complete
            }
          }
        } catch (error) {
          console.error('Error handling timer expiration:', error);
        }
      }
    };

    // Immediately check and update on mount/dependency change
    updateTimer();

    const timerInterval = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(timerInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt, orderId, onExpire, isExpired]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    progress,
    formattedTime: formatTime(timeLeft),
    isExpired
  };
};
