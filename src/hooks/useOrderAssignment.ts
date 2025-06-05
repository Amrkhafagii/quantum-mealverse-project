
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { orderActionToasts } from '@/utils/orderActionToasts';
import { recordRestaurantOrderHistory } from '@/services/orders/webhook/orderHistoryService';

export const useOrderAssignment = () => {
  const [isLoading, setIsLoading] = useState(false);

  const acceptOrder = async (orderId: string, restaurantId: string, notes?: string): Promise<boolean> => {
    setIsLoading(true);
    let orderUpdated = false;
    
    try {
      console.log('🎯 Accepting order:', { orderId, restaurantId, notes });

      // First update the order with restaurant_id and status
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          restaurant_id: restaurantId,
          status: 'restaurant_accepted'
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('❌ Error updating order:', orderError);
        orderActionToasts.error('accept', 'Failed to accept order');
        return false;
      }

      orderUpdated = true;

      // Record order history with proper validation
      const historyResult = await recordRestaurantOrderHistory(
        orderId,
        'restaurant_accepted',
        restaurantId,
        undefined, // changedBy - could be passed if available
        {
          response_notes: notes,
          action: 'accept',
          source: 'restaurant_assignment',
          timestamp: new Date().toISOString()
        }
      );

      if (!historyResult.success) {
        console.warn('⚠️ Failed to record order history for acceptance:', historyResult.message);
        // Don't fail the acceptance, just log the warning
      }

      // Then update the assignment status
      const { error: assignmentError } = await supabase
        .from('restaurant_assignments')
        .update({
          status: 'accepted',
          responded_at: new Date().toISOString(),
          response_notes: notes,
          restaurant_id: restaurantId
        })
        .eq('order_id', orderId)
        .eq('status', 'pending');

      if (assignmentError) {
        console.error('❌ Error updating assignment:', assignmentError);
        
        // Attempt rollback
        try {
          await supabase
            .from('orders')
            .update({
              restaurant_id: null,
              status: 'pending'
            })
            .eq('id', orderId);
          
          orderActionToasts.error('accept', 'Failed to update assignment status');
        } catch (rollbackError) {
          console.error('💥 Rollback failed:', rollbackError);
          orderActionToasts.rollbackError('accept');
        }
        
        return false;
      }

      // Cancel other pending assignments for this order
      const { error: cancelError } = await supabase
        .from('restaurant_assignments')
        .update({ status: 'cancelled' })
        .eq('order_id', orderId)
        .eq('status', 'pending')
        .neq('restaurant_id', restaurantId);

      if (cancelError) {
        console.warn('⚠️ Error cancelling other assignments:', cancelError);
        // Don't fail the acceptance for this, just log it
      }

      // Initialize preparation stages
      const { error: stagesError } = await supabase.rpc('create_default_preparation_stages', {
        p_order_id: orderId,
        p_restaurant_id: restaurantId
      });

      if (stagesError) {
        console.error('❌ Error creating preparation stages:', stagesError);
        // Don't fail the acceptance for this, just log it
        console.warn('⚠️ Preparation stages not created, but order accepted');
      }

      return true;
    } catch (error) {
      console.error('💥 Error accepting order:', error);
      
      // Attempt rollback if order was updated
      if (orderUpdated) {
        try {
          await supabase
            .from('orders')
            .update({
              restaurant_id: null,
              status: 'pending'
            })
            .eq('id', orderId);
        } catch (rollbackError) {
          console.error('💥 Rollback failed:', rollbackError);
          orderActionToasts.rollbackError('accept');
          return false;
        }
      }
      
      // Determine error type and show appropriate toast
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          orderActionToasts.networkError('accept');
        } else {
          orderActionToasts.error('accept', error.message);
        }
      } else {
        orderActionToasts.error('accept', 'An unexpected error occurred');
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectOrder = async (orderId: string, restaurantId: string, notes?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('❌ Rejecting order:', { orderId, restaurantId, notes });

      // Record order history for rejection
      const historyResult = await recordRestaurantOrderHistory(
        orderId,
        'restaurant_rejected',
        restaurantId,
        undefined, // changedBy - could be passed if available
        {
          response_notes: notes,
          action: 'reject',
          source: 'restaurant_assignment',
          timestamp: new Date().toISOString()
        }
      );

      if (!historyResult.success) {
        console.warn('⚠️ Failed to record order history for rejection:', historyResult.message);
        // Don't fail the rejection, just log the warning
      }

      // Update the assignment status to rejected
      const { error: assignmentError } = await supabase
        .from('restaurant_assignments')
        .update({
          status: 'rejected',
          responded_at: new Date().toISOString(),
          response_notes: notes,
          restaurant_id: restaurantId
        })
        .eq('order_id', orderId)
        .eq('status', 'pending');

      if (assignmentError) {
        console.error('❌ Error updating assignment:', assignmentError);
        orderActionToasts.error('reject', 'Failed to reject order assignment');
        return false;
      }

      // Check if any assignments are still pending
      const { data: pendingAssignments } = await supabase
        .from('restaurant_assignments')
        .select('id')
        .eq('order_id', orderId)
        .eq('status', 'pending');

      if (!pendingAssignments?.length) {
        // Update order status if no more pending assignments
        await supabase
          .from('orders')
          .update({ status: 'no_restaurant_accepted' })
          .eq('id', orderId);
      }

      return true;
    } catch (error) {
      console.error('💥 Error rejecting order:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          orderActionToasts.networkError('reject');
        } else {
          orderActionToasts.error('reject', error.message);
        }
      } else {
        orderActionToasts.error('reject', 'An unexpected error occurred');
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    acceptOrder,
    rejectOrder,
    isLoading
  };
};
