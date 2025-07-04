import { supabase } from '@/integrations/supabase/client';
import { DeliveryAssignment } from '@/types/delivery-assignment';

// Get active delivery assignments for a delivery user
export const getActiveDeliveryAssignments = async (
  deliveryUserId: string
): Promise<DeliveryAssignment[]> => {
  try {
    const { data, error } = await supabase
      .from('delivery_assignments')
      .select(`
        *,
        orders:order_id (
          id,
          customer_name,
          delivery_address,
          latitude,
          longitude,
          total,
          status,
          created_at,
          restaurant:restaurants!orders_restaurant_id_fkey (
            id,
            name,
            address,
            latitude,
            longitude
          )
        )
      `)
      .eq('delivery_user_id', deliveryUserId)
      .in('status', ['assigned', 'picked_up', 'on_the_way'])
      .order('priority_score', { ascending: false });

    if (error) {
      console.error('Error fetching active assignments:', error);
      throw error;
    }

    // Transform the data to match the DeliveryAssignment type
    const assignments = (data || []).map(assignment => {
      if (!assignment.orders) {
        console.warn(`No order data found for assignment ${assignment.id}`);
        return null;
      }
      
      const order = assignment.orders as any;
      const restaurant = order.restaurant as any || {};
      
      // Calculate distance in km (if coordinates are available)
      let distance_km = undefined;
      if (
        restaurant?.latitude && 
        restaurant?.longitude && 
        order?.latitude && 
        order?.longitude
      ) {
        distance_km = calculateDistance(
          restaurant.latitude, 
          restaurant.longitude, 
          order.latitude, 
          order.longitude
        );
      }
      
      // Use estimate from assignment or calculate basic estimate
      const estimate_minutes = assignment.estimated_delivery_time ? 
        Math.ceil((new Date(assignment.estimated_delivery_time).getTime() - new Date().getTime()) / (1000 * 60)) :
        (distance_km ? Math.round(5 + (distance_km * 3)) : undefined);
      
      return {
        ...assignment,
        restaurant: restaurant ? {
          name: restaurant.name || 'Unknown Restaurant',
          address: restaurant.address || '',
          latitude: restaurant.latitude || 0,
          longitude: restaurant.longitude || 0,
        } : undefined,
        customer: {
          name: order.customer_name || 'Customer',
          address: order.delivery_address || '',
          latitude: order.latitude || 0,
          longitude: order.longitude || 0,
        },
        distance_km,
        estimate_minutes,
        status: assignment.status as DeliveryAssignment['status'],
      };
    }).filter(Boolean) as DeliveryAssignment[];

    return assignments;
  } catch (error) {
    console.error('Error in getActiveDeliveryAssignments:', error);
    throw error;
  }
};

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

// Get past delivery assignments for a delivery user
export const getPastDeliveryAssignments = async (
  deliveryUserId: string,
  page: number = 1,
  limit: number = 5
): Promise<{ assignments: DeliveryAssignment[], count: number }> => {
  try {
    // Get the count first
    const { count, error: countError } = await supabase
      .from('delivery_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('delivery_user_id', deliveryUserId)
      .in('status', ['delivered', 'cancelled']);

    if (countError) {
      console.error('Error counting past assignments:', countError);
      throw countError;
    }

    // Then get the paginated data
    const { data, error } = await supabase
      .from('delivery_assignments')
      .select(`
        *,
        orders:order_id (
          id,
          customer_name,
          delivery_address,
          total,
          created_at
        )
      `)
      .eq('delivery_user_id', deliveryUserId)
      .in('status', ['delivered', 'cancelled'])
      .order('delivery_time', { ascending: false, nullsFirst: true })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error('Error fetching past assignments:', error);
      throw error;
    }

    const assignments = (data || []).map(assignment => {
      const order = assignment.orders as any;
      return {
        ...assignment,
        customer: order ? {
          name: order.customer_name || 'Customer',
          address: order.delivery_address || '',
          latitude: 0,
          longitude: 0,
        } : undefined,
        status: assignment.status as DeliveryAssignment['status'] 
      };
    });

    return { 
      assignments, 
      count: count || 0 
    };
  } catch (error) {
    console.error('Error in getPastDeliveryAssignments:', error);
    throw error;
  }
};

// Update the status of a delivery assignment
export const updateDeliveryStatus = async (
  assignmentId: string,
  status: DeliveryAssignment['status']
): Promise<DeliveryAssignment> => {
  try {
    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    };

    // Add specific timestamp based on status
    if (status === 'picked_up') {
      updates.pickup_time = new Date().toISOString();
    } else if (status === 'delivered') {
      updates.delivery_time = new Date().toISOString();
      
      // Update driver availability when delivery is completed
      const { data: assignment } = await supabase
        .from('delivery_assignments')
        .select('delivery_user_id')
        .eq('id', assignmentId)
        .single();
        
      if (assignment?.delivery_user_id) {
        // Use raw SQL update for decrementing with type assertion
        await (supabase.rpc as any)('decrement_delivery_count', {
          user_id: assignment.delivery_user_id
        });
      }
    }

    const { data, error } = await supabase
      .from('delivery_assignments')
      .update(updates)
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating assignment status:', error);
      throw error;
    }

    return data as DeliveryAssignment;
  } catch (error) {
    console.error('Error in updateDeliveryStatus:', error);
    throw error;
  }
};
