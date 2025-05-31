
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOrderAssignment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const acceptOrder = async (orderId: string, restaurantId: string, notes?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Accepting order:', { orderId, restaurantId, notes });

      // Find the assignment for this restaurant and order
      const { data: assignment, error: findError } = await supabase
        .from('restaurant_assignments')
        .select('id')
        .eq('order_id', orderId)
        .eq('restaurant_id', restaurantId)
        .eq('status', 'pending')
        .single();

      if (findError || !assignment) {
        console.error('Assignment not found:', findError);
        toast({
          title: 'Error',
          description: 'Order assignment not found',
          variant: 'destructive'
        });
        return false;
      }

      // Update the assignment status - triggers will handle the rest
      const { error: assignmentError } = await supabase
        .from('restaurant_assignments')
        .update({
          status: 'accepted',
          responded_at: new Date().toISOString(),
          response_notes: notes
        })
        .eq('id', assignment.id);

      if (assignmentError) {
        console.error('Error updating assignment:', assignmentError);
        toast({
          title: 'Error',
          description: 'Failed to accept order assignment',
          variant: 'destructive'
        });
        return false;
      }

      // Cancel other pending assignments for this order
      await supabase
        .from('restaurant_assignments')
        .update({ status: 'cancelled' })
        .eq('order_id', orderId)
        .eq('status', 'pending')
        .neq('id', assignment.id);

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

      toast({
        title: 'Success',
        description: 'Order accepted successfully!'
      });
      return true;
    } catch (error) {
      console.error('Error accepting order:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept order',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectOrder = async (orderId: string, restaurantId: string, notes?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Rejecting order:', { orderId, restaurantId, notes });

      // Find the assignment for this restaurant and order
      const { data: assignment, error: findError } = await supabase
        .from('restaurant_assignments')
        .select('id')
        .eq('order_id', orderId)
        .eq('restaurant_id', restaurantId)
        .eq('status', 'pending')
        .single();

      if (findError || !assignment) {
        console.error('Assignment not found:', findError);
        toast({
          title: 'Error',
          description: 'Order assignment not found',
          variant: 'destructive'
        });
        return false;
      }

      // Update the assignment status
      const { error: assignmentError } = await supabase
        .from('restaurant_assignments')
        .update({
          status: 'rejected',
          responded_at: new Date().toISOString(),
          response_notes: notes
        })
        .eq('id', assignment.id);

      if (assignmentError) {
        console.error('Error updating assignment:', assignmentError);
        toast({
          title: 'Error',
          description: 'Failed to reject order assignment',
          variant: 'destructive'
        });
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

      toast({
        title: 'Success',
        description: 'Order rejected successfully'
      });
      return true;
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject order',
        variant: 'destructive'
      });
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

