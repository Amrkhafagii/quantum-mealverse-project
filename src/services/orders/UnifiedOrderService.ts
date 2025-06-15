
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/types/cart';
import { Order } from '@/types/order';
import { MultiRestaurantAssignmentService } from '../assignments/MultiRestaurantAssignmentService';

export interface CustomerData {
  id?: string;
  name: string;
  email: string;
  phone: string;
}

export interface DeliveryData {
  address: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  method: string;
  instructions?: string;
}

export interface PaymentData {
  method: string;
  total: number;
  subtotal: number;
}

export interface CreateOrderRequest {
  customerData: CustomerData;
  deliveryData: DeliveryData;
  paymentData: PaymentData;
  items: CartItem[];
}

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  order?: Order;
  error?: string;
  assignmentInfo?: {
    restaurantCount: number;
    restaurants: string[];
  };
}

export class UnifiedOrderService {
  /**
   * Create a new order with multi-restaurant assignment
   */
  static async createOrder(request: CreateOrderRequest): Promise<CreateOrderResult> {
    try {
      console.log('UnifiedOrderService: Creating order with multi-restaurant assignment');

      // Generate order ID
      const { data: orderIdResult, error: orderIdError } = await supabase
        .rpc('generate_order_id');

      if (orderIdError || !orderIdResult) {
        console.error('Error generating order ID:', orderIdError);
        return { success: false, error: 'Failed to generate order ID' };
      }

      // Create the order
      const orderData = {
        customer_id: request.customerData.id,
        customer_name: request.customerData.name,
        customer_email: request.customerData.email,
        customer_phone: request.customerData.phone,
        delivery_address: request.deliveryData.address,
        city: request.deliveryData.city,
        latitude: request.deliveryData.latitude,
        longitude: request.deliveryData.longitude,
        delivery_method: request.deliveryData.method,
        payment_method: request.paymentData.method,
        notes: request.deliveryData.instructions,
        subtotal: request.paymentData.subtotal,
        delivery_fee: request.paymentData.total - request.paymentData.subtotal,
        total: request.paymentData.total,
        status: 'pending',
        formatted_order_id: orderIdResult,
        assignment_source: 'unified_service'
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError || !order) {
        console.error('Error creating order:', orderError);
        return { success: false, error: 'Failed to create order' };
      }

      console.log('Order created with ID:', order.id);

      // Create order items
      const orderItems = request.items.map(item => ({
        order_id: order.id,
        meal_id: item.meal_id || null,
        menu_item_id: item.menu_item_id || null,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        source_type: item.source_type || 'nutrition_generation'
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // Continue with assignment even if items fail
      }

      // Find nearby restaurants and create assignments
      let assignmentInfo = undefined;
      if (request.deliveryData.latitude && request.deliveryData.longitude) {
        console.log('Finding nearby restaurants for multi-assignment');
        
        const nearbyRestaurants = await MultiRestaurantAssignmentService.findNearbyRestaurants(
          request.deliveryData.latitude,
          request.deliveryData.longitude,
          15 // 15km radius
        );

        if (nearbyRestaurants.length > 0) {
          const assignmentResult = await MultiRestaurantAssignmentService.createMultipleAssignments(
            order.id,
            nearbyRestaurants,
            15 // 15 minutes expiration
          );

          if (assignmentResult.success) {
            assignmentInfo = {
              restaurantCount: assignmentResult.assignmentCount,
              restaurants: nearbyRestaurants.map(r => r.name)
            };

            // Update order status to awaiting restaurant
            await supabase
              .from('orders')
              .update({ status: 'awaiting_restaurant' })
              .eq('id', order.id);

            console.log(`Created ${assignmentResult.assignmentCount} restaurant assignments`);
          } else {
            console.warn('Failed to create restaurant assignments:', assignmentResult.error);
          }
        } else {
          console.warn('No nearby restaurants found for order');
          
          // Update order status to indicate no restaurants available
          await supabase
            .from('orders')
            .update({ status: 'no_restaurant_available' })
            .eq('id', order.id);
        }
      }

      return {
        success: true,
        orderId: order.id,
        order: order as Order,
        assignmentInfo
      };
    } catch (error) {
      console.error('Error in UnifiedOrderService.createOrder:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get order details with assignment status
   */
  static async getOrderWithAssignments(orderId: string): Promise<{
    order: Order | null;
    assignments: any[];
    acceptedAssignment: any | null;
  }> {
    try {
      // Get order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('id', orderId)
        .maybeSingle();

      if (orderError) {
        console.error('Error fetching order:', orderError);
        return { order: null, assignments: [], acceptedAssignment: null };
      }

      // Get all assignments for this order
      const { data: assignments, error: assignmentsError } = await supabase
        .from('restaurant_assignments')
        .select(`
          *,
          restaurants!restaurant_assignments_restaurant_id_fkey(id, name, address)
        `)
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError);
        return { order, assignments: [], acceptedAssignment: null };
      }

      // Find accepted assignment
      const acceptedAssignment = assignments?.find(a => a.status === 'accepted') || null;

      return {
        order,
        assignments: assignments || [],
        acceptedAssignment
      };
    } catch (error) {
      console.error('Error in getOrderWithAssignments:', error);
      return { order: null, assignments: [], acceptedAssignment: null };
    }
  }
}

export const unifiedOrderService = UnifiedOrderService;
