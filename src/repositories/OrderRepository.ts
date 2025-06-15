
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from '@/types/order';
import { CartItem } from '@/types/cart';

export interface CreateOrderData {
  customer_id: string; // Made required to match Supabase schema
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  delivery_method: string;
  payment_method: string;
  total: number;
  subtotal: number;
  delivery_fee: number;
  status: string;
  notes?: string | null;
  assignment_source: string;
}

export class OrderRepository {
  async createOrder(orderData: CreateOrderData): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) {
        console.error('OrderRepository: Error creating order', error);
        throw new Error(`Failed to create order: ${error.message}`);
      }

      return this.mapOrderFromDB(data);
    } catch (error) {
      console.error('OrderRepository: createOrder failed', error);
      throw error;
    }
  }

  async createOrderItems(orderId: string, items: CartItem[]): Promise<OrderItem[] | null> {
    try {
      const orderItems = items.map(item => ({
        order_id: orderId,
        meal_id: item.meal_id || null,
        menu_item_id: item.menu_item_id || null,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        source_type: item.source_type || 'nutrition_generation'
      }));

      const { data, error } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select();

      if (error) {
        console.error('OrderRepository: Error creating order items', error);
        throw new Error(`Failed to create order items: ${error.message}`);
      }

      return data.map(item => this.mapOrderItemFromDB(item));
    } catch (error) {
      console.error('OrderRepository: createOrderItems failed', error);
      throw error;
    }
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('OrderRepository: Error fetching order', error);
        return null;
      }

      return this.mapOrderFromDB(data);
    } catch (error) {
      console.error('OrderRepository: getOrderById failed', error);
      return null;
    }
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('customer_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('OrderRepository: Error fetching user orders', error);
        return [];
      }

      return (data || []).map(order => this.mapOrderFromDB(order));
    } catch (error) {
      console.error('OrderRepository: getUserOrders failed', error);
      return [];
    }
  }

  async updateOrderStatus(orderId: string, status: string, metadata?: any): Promise<boolean> {
    try {
      const updateData: any = { status };
      if (metadata) {
        updateData.updated_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        console.error('OrderRepository: Error updating order status', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('OrderRepository: updateOrderStatus failed', error);
      return false;
    }
  }

  private mapOrderFromDB(data: any): Order {
    return {
      id: data.id,
      customer_id: data.customer_id,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      delivery_address: data.delivery_address,
      city: data.city,
      notes: data.notes,
      delivery_method: data.delivery_method,
      payment_method: data.payment_method,
      delivery_fee: data.delivery_fee,
      subtotal: data.subtotal,
      total: data.total,
      status: data.status,
      latitude: data.latitude,
      longitude: data.longitude,
      created_at: data.created_at,
      updated_at: data.updated_at,
      restaurant_id: data.restaurant_id,
      assignment_source: data.assignment_source,
      is_mixed_order: data.is_mixed_order,
      order_items: data.order_items ? data.order_items.map((item: any) => this.mapOrderItemFromDB(item)) : undefined
    };
  }

  private mapOrderItemFromDB(data: any): OrderItem {
    return {
      id: data.id,
      meal_id: data.meal_id,
      menu_item_id: data.menu_item_id,
      name: data.name,
      price: data.price,
      quantity: data.quantity,
      created_at: data.created_at,
      source_type: data.source_type
    };
  }
}
