
import { supabase } from '@/integrations/supabase/client';

export interface NearbyRestaurant {
  id: string;
  name: string;
  distance_km: number;
  latitude: number;
  longitude: number;
}

export interface AssignmentResult {
  success: boolean;
  assignmentCount: number;
  restaurants: NearbyRestaurant[];
  error?: string;
}

export class MultiRestaurantAssignmentService {
  /**
   * Find nearby restaurants for an order location
   */
  static async findNearbyRestaurants(
    latitude: number,
    longitude: number,
    maxDistance: number = 15
  ): Promise<NearbyRestaurant[]> {
    try {
      console.log(`Finding restaurants near (${latitude}, ${longitude}) within ${maxDistance}km`);

      const { data, error } = await supabase.rpc('find_nearest_restaurant', {
        order_lat: latitude,
        order_lng: longitude,
        max_distance_km: maxDistance
      });

      if (error) {
        console.error('Error finding nearby restaurants:', error);
        return [];
      }

      console.log('Raw restaurant data from RPC:', data);

      // Map the RPC response to match our NearbyRestaurant interface
      return (data || []).map((restaurant: any) => ({
        id: restaurant.restaurant_id,
        name: restaurant.restaurant_name,
        distance_km: restaurant.distance_km,
        latitude: restaurant.restaurant_latitude || 0,
        longitude: restaurant.restaurant_longitude || 0
      }));
    } catch (error) {
      console.error('Error in findNearbyRestaurants:', error);
      return [];
    }
  }

  /**
   * Create assignments for multiple restaurants
   */
  static async createMultipleAssignments(
    orderId: string,
    restaurants: NearbyRestaurant[],
    expirationMinutes: number = 15
  ): Promise<AssignmentResult> {
    try {
      if (restaurants.length === 0) {
        return {
          success: false,
          assignmentCount: 0,
          restaurants: [],
          error: 'No nearby restaurants found'
        };
      }

      const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000).toISOString();
      
      // Create assignments for all nearby restaurants
      const assignments = restaurants.map(restaurant => ({
        order_id: orderId,
        restaurant_id: restaurant.id,
        status: 'pending',
        expires_at: expiresAt
      }));

      const { data, error } = await supabase
        .from('restaurant_assignments')
        .insert(assignments)
        .select();

      if (error) {
        console.error('Error creating restaurant assignments:', error);
        return {
          success: false,
          assignmentCount: 0,
          restaurants,
          error: error.message
        };
      }

      console.log(`Created ${data.length} restaurant assignments for order ${orderId}`);

      return {
        success: true,
        assignmentCount: data.length,
        restaurants
      };
    } catch (error) {
      console.error('Error in createMultipleAssignments:', error);
      return {
        success: false,
        assignmentCount: 0,
        restaurants,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle restaurant acceptance - cancels all other pending assignments
   */
  static async handleRestaurantAcceptance(
    assignmentId: string,
    orderId: string,
    restaurantId: string
  ): Promise<boolean> {
    try {
      console.log(`Restaurant ${restaurantId} accepting assignment ${assignmentId} for order ${orderId}`);

      // Update the accepted assignment
      const { error: acceptError } = await supabase
        .from('restaurant_assignments')
        .update({
          status: 'accepted',
          responded_at: new Date().toISOString()
        })
        .eq('id', assignmentId);

      if (acceptError) {
        console.error('Error accepting assignment:', acceptError);
        return false;
      }

      // Cancel all other pending assignments for this order
      const { error: cancelError } = await supabase
        .from('restaurant_assignments')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .eq('status', 'pending')
        .neq('id', assignmentId);

      if (cancelError) {
        console.error('Error cancelling other assignments:', cancelError);
        return false;
      }

      // Update order status and restaurant
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'restaurant_accepted',
          restaurant_id: restaurantId
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('Error updating order:', orderError);
        return false;
      }

      console.log(`Successfully processed restaurant acceptance for order ${orderId}`);
      return true;
    } catch (error) {
      console.error('Error in handleRestaurantAcceptance:', error);
      return false;
    }
  }

  /**
   * Handle restaurant rejection
   */
  static async handleRestaurantRejection(
    assignmentId: string,
    orderId: string,
    reason?: string
  ): Promise<boolean> {
    try {
      console.log(`Rejecting assignment ${assignmentId} for order ${orderId}`);

      // Update assignment to rejected
      const { error: rejectError } = await supabase
        .from('restaurant_assignments')
        .update({
          status: 'rejected',
          responded_at: new Date().toISOString(),
          response_notes: reason
        })
        .eq('id', assignmentId);

      if (rejectError) {
        console.error('Error rejecting assignment:', rejectError);
        return false;
      }

      // Check if any assignments are still pending
      const { data: pendingAssignments } = await supabase
        .from('restaurant_assignments')
        .select('id')
        .eq('order_id', orderId)
        .eq('status', 'pending');

      // If no more pending assignments, update order status
      if (!pendingAssignments?.length) {
        const { error: orderError } = await supabase
          .from('orders')
          .update({ status: 'no_restaurant_accepted' })
          .eq('id', orderId);

        if (orderError) {
          console.error('Error updating order status:', orderError);
        }
      }

      return true;
    } catch (error) {
      console.error('Error in handleRestaurantRejection:', error);
      return false;
    }
  }
}
