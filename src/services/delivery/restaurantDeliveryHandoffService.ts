
import { supabase } from '@/integrations/supabase/client';
import {
  DeliveryAssignmentCriteria,
  DeliveryDriverAvailability,
  AvailableDriver,
  AssignmentResult,
  DeliveryAssignmentHistory
} from '@/types/delivery-handoff';

export class RestaurantDeliveryHandoffService {
  // Get assignment criteria for a restaurant
  async getAssignmentCriteria(restaurantId: string): Promise<DeliveryAssignmentCriteria | null> {
    try {
      const { data, error } = await supabase
        .from('delivery_assignment_criteria')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error getting assignment criteria:', error);
      return null;
    }
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

      if (error) throw error;
      return true;
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
    maxDistanceKm: number = 15.0,
    limit: number = 10
  ): Promise<AvailableDriver[]> {
    try {
      const { data, error } = await supabase.rpc('find_best_drivers_for_assignment', {
        p_restaurant_id: restaurantId,
        p_restaurant_lat: restaurantLat,
        p_restaurant_lng: restaurantLng,
        p_max_distance_km: maxDistanceKm,
        p_limit: limit
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting available drivers:', error);
      return [];
    }
  }

  // Manually assign delivery to specific driver
  async manuallyAssignDelivery(
    orderId: string,
    restaurantId: string,
    deliveryUserId: string,
    assignmentTimeMinutes: number = 30
  ): Promise<AssignmentResult> {
    try {
      // Get driver information
      const { data: driverData, error: driverError } = await supabase
        .from('delivery_users')
        .select('first_name, last_name, average_rating')
        .eq('id', deliveryUserId)
        .single();

      if (driverError) throw driverError;

      // Calculate priority score for this driver
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('latitude, longitude')
        .eq('id', restaurantId)
        .single();

      let priorityScore = 50; // Default score for manual assignment
      if (restaurant?.latitude && restaurant?.longitude) {
        const { data: scoreData } = await supabase.rpc('calculate_delivery_priority_score', {
          p_delivery_user_id: deliveryUserId,
          p_restaurant_lat: restaurant.latitude,
          p_restaurant_lng: restaurant.longitude,
          p_restaurant_id: restaurantId
        });
        priorityScore = scoreData || 50;
      }

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + assignmentTimeMinutes);

      // Create assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('delivery_assignments')
        .insert({
          order_id: orderId,
          restaurant_id: restaurantId,
          delivery_user_id: deliveryUserId,
          status: 'assigned',
          priority_score: priorityScore,
          expires_at: expiresAt.toISOString(),
          auto_assigned: false,
          estimated_delivery_time: new Date(Date.now() + 45 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // Log the assignment
      await supabase.from('delivery_assignment_history').insert({
        delivery_assignment_id: assignment.id,
        delivery_user_id: deliveryUserId,
        action: 'assigned',
        priority_score: priorityScore,
        driver_rating: driverData.average_rating,
        metadata: {
          manual_assignment: true,
          restaurant_id: restaurantId
        }
      });

      // Update driver's delivery count
      await supabase
        .from('delivery_driver_availability')
        .update({
          current_delivery_count: supabase.sql`current_delivery_count + 1`
        })
        .eq('delivery_user_id', deliveryUserId);

      return {
        success: true,
        assignment_id: assignment.id,
        driver_name: `${driverData.first_name} ${driverData.last_name}`.trim(),
        priority_score: priorityScore,
        expires_at: expiresAt.toISOString()
      };
    } catch (error) {
      console.error('Error manually assigning delivery:', error);
      return {
        success: false,
        reason: error instanceof Error ? error.message : 'Failed to assign delivery'
      };
    }
  }

  // Handle assignment response (accept/reject)
  async handleAssignmentResponse(
    assignmentId: string,
    deliveryUserId: string,
    action: 'accept' | 'reject',
    reason?: string
  ): Promise<boolean> {
    try {
      const { data: assignment, error: getError } = await supabase
        .from('delivery_assignments')
        .select('*')
        .eq('id', assignmentId)
        .eq('delivery_user_id', deliveryUserId)
        .eq('status', 'assigned')
        .single();

      if (getError || !assignment) {
        console.error('Assignment not found or not valid for response:', getError);
        return false;
      }

      if (action === 'accept') {
        // Update assignment status
        const { error: updateError } = await supabase
          .from('delivery_assignments')
          .update({
            status: 'picked_up',
            pickup_time: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', assignmentId);

        if (updateError) throw updateError;

        // Log acceptance
        await supabase.from('delivery_assignment_history').insert({
          delivery_assignment_id: assignmentId,
          delivery_user_id: deliveryUserId,
          action: 'accepted',
          assignment_duration_seconds: Math.floor(
            (new Date().getTime() - new Date(assignment.created_at).getTime()) / 1000
          )
        });

      } else {
        // Handle rejection
        await supabase.from('delivery_assignment_history').insert({
          delivery_assignment_id: assignmentId,
          delivery_user_id: deliveryUserId,
          action: 'rejected',
          reason: reason || 'Driver declined assignment',
          assignment_duration_seconds: Math.floor(
            (new Date().getTime() - new Date(assignment.created_at).getTime()) / 1000
          )
        });

        // Update driver availability (decrease delivery count)
        await supabase
          .from('delivery_driver_availability')
          .update({
            current_delivery_count: supabase.sql`GREATEST(0, current_delivery_count - 1)`
          })
          .eq('delivery_user_id', deliveryUserId);

        // Trigger reassignment by calling the function
        await supabase.rpc('handle_expired_delivery_assignments');
      }

      return true;
    } catch (error) {
      console.error('Error handling assignment response:', error);
      return false;
    }
  }

  // Update driver availability and location
  async updateDriverAvailability(
    deliveryUserId: string,
    availability: Partial<DeliveryDriverAvailability>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('delivery_driver_availability')
        .upsert({
          delivery_user_id: deliveryUserId,
          ...availability,
          last_location_update: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating driver availability:', error);
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

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error getting driver availability:', error);
      return null;
    }
  }

  // Get assignment history for analysis
  async getAssignmentHistory(
    deliveryAssignmentId: string
  ): Promise<DeliveryAssignmentHistory[]> {
    try {
      const { data, error } = await supabase
        .from('delivery_assignment_history')
        .select('*')
        .eq('delivery_assignment_id', deliveryAssignmentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting assignment history:', error);
      return [];
    }
  }

  // Process expired assignments (manual trigger)
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

  // Subscribe to assignment updates for a specific driver
  subscribeToDriverAssignments(
    deliveryUserId: string,
    onAssignment: (assignment: any) => void,
    onUpdate: (assignment: any) => void
  ) {
    const channel = supabase
      .channel(`driver-assignments-${deliveryUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'delivery_assignments',
          filter: `delivery_user_id=eq.${deliveryUserId}`
        },
        (payload) => {
          console.log('New assignment received:', payload);
          onAssignment(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'delivery_assignments',
          filter: `delivery_user_id=eq.${deliveryUserId}`
        },
        (payload) => {
          console.log('Assignment updated:', payload);
          onUpdate(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Subscribe to assignment history for tracking
  subscribeToAssignmentHistory(
    deliveryAssignmentId: string,
    onHistoryUpdate: (history: DeliveryAssignmentHistory) => void
  ) {
    const channel = supabase
      .channel(`assignment-history-${deliveryAssignmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'delivery_assignment_history',
          filter: `delivery_assignment_id=eq.${deliveryAssignmentId}`
        },
        (payload) => {
          console.log('Assignment history updated:', payload);
          onHistoryUpdate(payload.new as DeliveryAssignmentHistory);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const restaurantDeliveryHandoffService = new RestaurantDeliveryHandoffService();
