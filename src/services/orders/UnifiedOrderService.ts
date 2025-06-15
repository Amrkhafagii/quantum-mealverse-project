
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/types/cart';
import { Order } from '@/types/order';
import { OrderRepository } from '@/repositories/OrderRepository';
import { OrderDataValidator } from '@/validation/OrderDataValidator';
import { OrderErrorService } from '@/services/errors/OrderErrorService';

export interface CreateOrderRequest {
  customerData: {
    id?: string;
    name: string;
    email: string;
    phone: string;
  };
  deliveryData: {
    address: string;
    city: string;
    latitude?: number;
    longitude?: number;
    method: 'delivery' | 'pickup';
    instructions?: string;
  };
  paymentData: {
    method: 'cash' | 'visa';
    total: number;
    subtotal: number;
  };
  items: CartItem[];
}

export interface OrderCreationResult {
  success: boolean;
  orderId?: string;
  order?: Order;
  error?: string;
  errorCode?: string;
}

export class UnifiedOrderService {
  private orderRepository: OrderRepository;
  private validator: OrderDataValidator;
  private errorService: OrderErrorService;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.validator = new OrderDataValidator();
    this.errorService = new OrderErrorService();
  }

  async createOrder(request: CreateOrderRequest): Promise<OrderCreationResult> {
    try {
      console.log('UnifiedOrderService: Starting order creation process');

      // Validate the order request
      const validationResult = await this.validator.validateOrderRequest(request);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.errors.join(', '),
          errorCode: 'VALIDATION_FAILED'
        };
      }

      // Start database transaction
      const { data, error } = await supabase.rpc('begin_transaction');
      if (error) {
        throw new Error(`Transaction start failed: ${error.message}`);
      }

      try {
        // Create the order
        const order = await this.orderRepository.createOrder({
          customer_id: request.customerData.id || null,
          customer_name: request.customerData.name,
          customer_email: request.customerData.email,
          customer_phone: request.customerData.phone,
          delivery_address: request.deliveryData.address,
          city: request.deliveryData.city,
          latitude: request.deliveryData.latitude,
          longitude: request.deliveryData.longitude,
          delivery_method: request.deliveryData.method,
          payment_method: request.paymentData.method,
          total: request.paymentData.total,
          subtotal: request.paymentData.subtotal,
          delivery_fee: request.paymentData.total - request.paymentData.subtotal,
          status: 'pending',
          notes: request.deliveryData.instructions,
          assignment_source: 'nutrition_generation'
        });

        if (!order) {
          throw new Error('Failed to create order');
        }

        // Create order items
        const orderItems = await this.orderRepository.createOrderItems(order.id!, request.items);
        if (!orderItems) {
          throw new Error('Failed to create order items');
        }

        // Commit transaction
        await supabase.rpc('commit_transaction');

        console.log('UnifiedOrderService: Order created successfully', order.id);

        return {
          success: true,
          orderId: order.id,
          order: { ...order, order_items: orderItems }
        };

      } catch (transactionError) {
        // Rollback transaction
        await supabase.rpc('rollback_transaction');
        throw transactionError;
      }

    } catch (error) {
      console.error('UnifiedOrderService: Order creation failed', error);
      
      const handledError = this.errorService.handleOrderError(error);
      return {
        success: false,
        error: handledError.message,
        errorCode: handledError.code
      };
    }
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      return await this.orderRepository.getOrderById(orderId);
    } catch (error) {
      console.error('UnifiedOrderService: Failed to get order', error);
      return null;
    }
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      return await this.orderRepository.getUserOrders(userId);
    } catch (error) {
      console.error('UnifiedOrderService: Failed to get user orders', error);
      return [];
    }
  }

  async updateOrderStatus(orderId: string, status: string, metadata?: any): Promise<boolean> {
    try {
      return await this.orderRepository.updateOrderStatus(orderId, status, metadata);
    } catch (error) {
      console.error('UnifiedOrderService: Failed to update order status', error);
      return false;
    }
  }
}

export const unifiedOrderService = new UnifiedOrderService();
