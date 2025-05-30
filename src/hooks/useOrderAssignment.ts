
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

export const useOrderAssignment = () => {
  const [isLoading, setIsLoading] = useState(false);

  const acceptOrder = async (orderId: string, restaurantId: string, notes?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Accepting order:', { orderId, restaurantId, notes });

      // First, update the restaurant assignment status
      const { error: assignmentError } = await supabase
        .from('restaurant_assignments')
        .update({
          status: 'accepted',
          responded_at: new Date().toISOString(),
          response_notes: notes
        })
        .eq('order_id', orderId)
        .eq('restaurant_id', restaurantId)
        .eq('status', 'pending');

      if (assignmentError) {
        console.error('Error updating assignment:', assignmentError);
        toast.error('Failed to accept order assignment');
        return false;
      }

      // Update the order status to restaurant_accepted
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'restaurant_accepted',
          restaurant_id: restaurantId
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('Error updating order status:', orderError);
        toast.error('Failed to update order status');
        return false;
      }

      // Initialize preparation stages
      const { error: stagesError } = await supabase.rpc('create_default_preparation_stages', {
        p_order_id: orderId,
        p_restaurant_id: restaurantId
      });

      if (stagesError) {
        console.error('Error creating preparation stages:', stagesError);
        // Don't fail the acceptance for this, just log it
        console.warn('Preparation stages not created, but order accepted');
      }

      toast.success('Order accepted successfully!');
      return true;
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error('Failed to accept order');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectOrder = async (orderId: string, restaurantId: string, notes?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Rejecting order:', { orderId, restaurantId, notes });

      // Update the restaurant assignment status
      const { error: assignmentError } = await supabase
        .from('restaurant_assignments')
        .update({
          status: 'rejected',
          responded_at: new Date().toISOString(),
          response_notes: notes
        })
        .eq('order_id', orderId)
        .eq('restaurant_id', restaurantId)
        .eq('status', 'pending');

      if (assignmentError) {
        console.error('Error updating assignment:', assignmentError);
        toast.error('Failed to reject order assignment');
        return false;
      }

      // Update the order status to restaurant_rejected
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'restaurant_rejected'
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('Error updating order status:', orderError);
        toast.error('Failed to update order status');
        return false;
      }

      toast.success('Order rejected successfully');
      return true;
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast.error('Failed to reject order');
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
