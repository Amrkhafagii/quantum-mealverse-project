import { supabase } from '@/integrations/supabase/client';
import {
  DeliveryAssignmentCriteria,
  DeliveryAssignmentHistory,
  DeliveryDriverAvailability,
  AvailableDriver,
  AssignmentResult
} from '@/types/delivery-handoff';

export class RestaurantDeliveryHandoffService {
  // Get assignment criteria for a restaurant
  async getAssignmentCriteria(restaurantId: string): Promise<DeliveryAssignmentCriteria> {
    const { data, error } = await supabase
      .from('delivery_assignment_criteria')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .single();

    if (error) throw error;

    // Type cast the priority_factors from Json to the expected type
    return {
      ...data,
      priority_factors: data.priority_factors as { distance: number; rating: number; availability: number; }
    } as DeliveryAssignmentCriteria;
  }

  // Update assignment criteria for a restaurant
  async updateAssignmentCriteria(
    restaurantId: string,
    criteria: Partial<DeliveryAssignmentCriteria>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('delivery_assignment_criteria')
        .upsert({
          restaurant_id: restaurantId,
          ...criteria,
          updated_at: new Date().toISOString()
        });

      return !error;
    } catch (error) {
      console.error('Error updating assignment criteria:', error);
      return false;
    }
  }

  // Get available drivers for assignment
  async getAvailableDrivers(
    restaurantId: string,
    restaurantLat: number,
    restaurantLng: number,
    maxDistance: number = 15.0
  ): Promise<AvailableDriver[]> {
    try {
      const { data, error } = await supabase.rpc('find_best_drivers_for_assignment', {
        p_restaurant_id: restaurantId,
        p_restaurant_lat: restaurantLat,
        p_restaurant_lng: restaurantLng,
        p_max_distance_km: maxDistance,
        p_limit: 10
      });

      if (error) throw error;

      return (data || []).map((driver: any) => ({
        delivery_user_id: driver.delivery_user_id,
        driver_name: driver.driver_name,
        priority_score: driver.priority_score,
        distance_km: driver.distance_km,
        current_deliveries: driver.current_deliveries,
        average_rating: driver.average_rating
      }));
    } catch (error) {
      console.error('Error getting available drivers:', error);
      return [];
    }
  }

  // Manually assign delivery to a specific driver
  async manuallyAssignDelivery(
    orderId: string,
    restaurantId: string,
    deliveryUserId: string,
    assignmentTimeMinutes: number = 30
  ): Promise<AssignmentResult> {
    try {
      // Check if driver is available
      const { data: availability } = await supabase
        .from('delivery_driver_availability')
        .select('*')
        .eq('delivery_user_id', deliveryUserId)
        .single();

      if (!availability?.is_available || 
          availability.current_delivery_count >= availability.max_concurrent_deliveries) {
        return {
          success: false,
          reason: 'Driver is not available or at maximum capacity'
        };
      }

      // Get driver details
      const { data: driver } = await supabase
        .from('delivery_users')
        .select('first_name, last_name, average_rating')
        .eq('id', deliveryUserId)
        .single();

      if (!driver) {
        return {
          success: false,
          reason: 'Driver not found'
        };
      }

      // Create assignment
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + assignmentTimeMinutes);

      const { data: assignment, error } = await supabase
        .from('delivery_assignments')
        .insert({
          order_id: orderId,
          restaurant_id: restaurantId,
          delivery_user_id: deliveryUserId,
          status: 'assigned',
          expires_at: expiresAt.toISOString(),
          auto_assigned: false,
          priority_score: 0,
          assignment_attempt: 1
        })
        .select()
        .single();

      if (error) throw error;

      // Update driver delivery count using RPC with type assertion
      await (supabase.rpc as any)('increment_delivery_count', {
        user_id: deliveryUserId
      });

      // Log the assignment
      await this.logAssignmentHistory(assignment.id, deliveryUserId, 'assigned', {
        manual_assignment: true,
        restaurant_id: restaurantId
      });

      return {
        success: true,
        assignment_id: assignment.id,
        driver_name: `${driver.first_name} ${driver.last_name}`,
        priority_score: 0,
        expires_at: expiresAt.toISOString()
      };
    } catch (error) {
      console.error('Error in manual assignment:', error);
      return {
        success: false,
        reason: 'Failed to create assignment'
      };
    }
  }

  // Handle driver response to assignment (accept/reject)
  async handleAssignmentResponse(
    assignmentId: string,
    deliveryUserId: string,
    response: 'accept' | 'reject',
    reason?: string
  ): Promise<boolean> {
    try {
      if (response === 'accept') {
        const { error } = await supabase
          .from('delivery_assignments')
          .update({
            status: 'accepted',
            updated_at: new Date().toISOString()
          })
          .eq('id', assignmentId)
          .eq('delivery_user_id', deliveryUserId);

        if (error) throw error;

        await this.logAssignmentHistory(assignmentId, deliveryUserId, 'accepted');
      } else {
        // Reject assignment
        const { error } = await supabase
          .from('delivery_assignments')
          .update({
            status: 'rejected',
            updated_at: new Date().toISOString()
          })
          .eq('id', assignmentId)
          .eq('delivery_user_id', deliveryUserId);

        if (error) throw error;

        // Decrease driver delivery count using RPC with type assertion
        await (supabase.rpc as any)('decrement_delivery_count', {
          user_id: deliveryUserId
        });

        await this.logAssignmentHistory(assignmentId, deliveryUserId, 'rejected', { reason });

        // Trigger reassignment logic here if needed
        await this.processExpiredAssignments();
      }

      return true;
    } catch (error) {
      console.error('Error handling assignment response:', error);
      return false;
    }
  }

  // Get driver availability
  async getDriverAvailability(deliveryUserId: string): Promise<DeliveryDriverAvailability | null> {
    try {
      const { data, error } = await supabase
        .from('delivery_driver_availability')
        .select('*')
        .eq('delivery_user_id', deliveryUserId)
        .single();

      if (error) throw error;
      return data as DeliveryDriverAvailability;
    } catch (error) {
      console.error('Error getting driver availability:', error);
      return null;
    }
  }

  // Update driver availability
  async updateDriverAvailability(
    deliveryUserId: string,
    updates: Partial<DeliveryDriverAvailability>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('delivery_driver_availability')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('delivery_user_id', deliveryUserId);

      return !error;
    } catch (error) {
      console.error('Error updating driver availability:', error);
      return false;
    }
  }

  // Get assignment history
  async getAssignmentHistory(deliveryUserId?: string): Promise<DeliveryAssignmentHistory[]> {
    try {
      let query = supabase
        .from('delivery_assignment_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (deliveryUserId) {
        query = query.eq('delivery_user_id', deliveryUserId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Type cast the results to handle union types
      return (data || []).map(item => ({
        ...item,
        action: item.action as 'assigned' | 'accepted' | 'rejected' | 'expired' | 'reassigned',
        metadata: item.metadata as Record<string, any>
      })) as DeliveryAssignmentHistory[];
    } catch (error) {
      console.error('Error getting assignment history:', error);
      return [];
    }
  }

  // Process expired assignments
  async processExpiredAssignments(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('handle_expired_delivery_assignments');
      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error processing expired assignments:', error);
      return 0;
    }
  }

  // Subscribe to driver assignments
  subscribeToDriverAssignments(
    deliveryUserId: string,
    onNewAssignment: (assignment: any) => void,
    onAssignmentUpdate: (assignment: any) => void
  ) {
    const channel = supabase
      .channel(`driver_assignments_${deliveryUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'delivery_assignments',
          filter: `delivery_user_id=eq.${deliveryUserId}`
        },
        onNewAssignment
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'delivery_assignments',
          filter: `delivery_user_id=eq.${deliveryUserId}`
        },
        onAssignmentUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Private helper to log assignment history
  private async logAssignmentHistory(
    assignmentId: string,
    deliveryUserId: string,
    action: 'assigned' | 'accepted' | 'rejected' | 'expired' | 'reassigned',
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      await supabase
        .from('delivery_assignment_history')
        .insert({
          delivery_assignment_id: assignmentId,
          delivery_user_id: deliveryUserId,
          action,
          metadata
        });
    } catch (error) {
      console.error('Error logging assignment history:', error);
    }
  }
}

export const restaurantDeliveryHandoffService = new RestaurantDeliveryHandoffService();
