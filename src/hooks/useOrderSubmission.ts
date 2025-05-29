
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { DeliveryFormValues } from '@/hooks/useDeliveryForm';
import { OrderStatus } from '@/types/webhook';
import { CartItem } from '@/contexts/CartContext';
import { 
  saveDeliveryInfo, 
  createOrder, 
  createOrderItems,
  saveUserLocation 
} from '@/services/orders/orderService';
import { sendOrderToWebhook } from '@/integrations/webhook';
import { recordOrderHistory } from '@/services/orders/webhook/orderHistoryService';
import { orderAssignmentService } from '@/services/orders/orderAssignmentService';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';

export const useOrderSubmission = (
  userId: string | undefined,
  items: CartItem[],
  totalAmount: number,
  hasDeliveryInfo: boolean,
  clearCart: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isOnline } = useConnectionStatus();

  const handleSubmit = async (data: DeliveryFormValues) => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add some items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }

    if (!isOnline) {
      toast({
        title: "You are offline",
        description: "Please connect to the internet to place an order",
        variant: "destructive"
      });
      return;
    }

    if (isSubmitting) {
      console.log("Submission already in progress, ignoring duplicate submission");
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (!userId) {
        setIsSubmitting(false);
        throw new Error("You must be logged in to place an order");
      }

      console.log('Processing unified order with cart items:', {
        itemsCount: items.length,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          restaurant_id: item.restaurant_id,
          assignment_details: item.assignment_details ? 'present' : 'none'
        }))
      });

      // Save delivery information
      await saveDeliveryInfo(userId, data, hasDeliveryInfo);
      
      // Create the order with initial PENDING status
      const insertedOrder = await createOrder(userId, data, items, totalAmount, OrderStatus.PENDING);
      
      if (!insertedOrder || !insertedOrder.id) {
        throw new Error("Failed to create order - no order ID returned");
      }
      
      console.log('Unified order created successfully:', {
        orderId: insertedOrder.id,
        totalAmount: insertedOrder.total,
        itemsToProcess: items.length,
        hasRestaurantAssignments: items.some(item => item.restaurant_id)
      });
      
      // Create order items with enhanced error logging
      await createOrderItems(insertedOrder.id, items);
      
      // Handle restaurant assignments for unified checkout - ALWAYS create assignments
      await handleUnifiedRestaurantAssignment(insertedOrder.id, data, items, userId);
      
      // Always record the order creation in history
      await recordOrderHistory(
        insertedOrder.id,
        'created',
        null,
        { 
          total: insertedOrder.total,
          delivery_method: data.deliveryMethod,
          items_count: items.length,
          assignment_sources: items.map(item => ({
            item_id: item.id,
            has_restaurant_assignment: !!item.restaurant_id,
            assignment_type: item.assignment_details ? 'pre_assigned' : 'needs_assignment'
          }))
        },
        undefined,
        userId,
        'customer'
      );
      
      toast({
        title: "Order placed successfully",
        description: `Your order has been placed and is being assigned to restaurants`,
      });
      
      clearCart();
      navigate(`/order-confirmation/${insertedOrder.id}`);
    } catch (error: any) {
      console.error("Unified order submission error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        userId,
        itemsCount: items.length,
        totalAmount
      });
      setIsSubmitting(false);
      toast({
        title: "Error placing order",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  // Unified restaurant assignment handling
  const handleUnifiedRestaurantAssignment = async (
    orderId: string,
    data: DeliveryFormValues,
    items: CartItem[],
    userId: string
  ) => {
    try {
      // Check if items already have restaurant assignments (from nutrition-generated meals)
      const preAssignedItems = items.filter(item => item.restaurant_id);
      const unassignedItems = items.filter(item => !item.restaurant_id);

      console.log('Unified restaurant assignment:', {
        orderId,
        preAssignedCount: preAssignedItems.length,
        unassignedCount: unassignedItems.length
      });

      // For pre-assigned items, create restaurant assignment records for dashboard visibility
      if (preAssignedItems.length > 0) {
        console.log('Creating restaurant assignments for pre-assigned items:', preAssignedItems.map(item => ({
          name: item.name,
          restaurant_id: item.restaurant_id,
          assignment_details: !!item.assignment_details
        })));

        // Create restaurant assignment records for each pre-assigned restaurant
        const restaurantGroups = preAssignedItems.reduce((groups, item) => {
          const restaurantId = item.restaurant_id!;
          if (!groups[restaurantId]) {
            groups[restaurantId] = [];
          }
          groups[restaurantId].push(item);
          return groups;
        }, {} as { [restaurantId: string]: CartItem[] });

        // Create assignment records for each restaurant
        for (const [restaurantId, restaurantItems] of Object.entries(restaurantGroups)) {
          await orderAssignmentService.createDirectAssignment(
            orderId,
            restaurantId,
            {
              assignment_type: 'nutrition_generated',
              items: restaurantItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
              })),
              estimated_prep_time: restaurantItems[0].estimated_prep_time,
              distance_km: restaurantItems[0].distance_km
            }
          );

          // Record assignment history for pre-assigned items
          await recordOrderHistory(
            orderId,
            'restaurant_pre_assigned',
            restaurantId,
            {
              assignment_source: 'nutrition_generation',
              items_count: restaurantItems.length,
              estimated_prep_time: restaurantItems[0].estimated_prep_time,
              distance_km: restaurantItems[0].distance_km
            },
            undefined,
            userId,
            'system'
          );
        }

        // Update order status to indicate restaurant assignment
        await orderAssignmentService.updateOrderStatus(
          orderId, 
          'restaurant_assigned',
          Object.keys(restaurantGroups)[0] // Use first restaurant as primary
        );
      }

      // For unassigned items (traditional orders), use the location-based assignment
      if (unassignedItems.length > 0 && data.latitude && data.longitude && data.deliveryMethod === "delivery") {
        console.log('Processing unassigned items via location-based assignment...');
        
        await saveUserLocation(userId, data.latitude, data.longitude);
        
        // Use the webhook system for traditional restaurant assignment
        const webhookResult = await sendOrderToWebhook(
          orderId,
          data.latitude,
          data.longitude
        );
        
        if (!webhookResult.success) {
          console.error('Webhook call failed for unassigned items:', webhookResult.error);
          await recordOrderHistory(
            orderId,
            'webhook_failed',
            null,
            { 
              error: webhookResult.error,
              unassigned_items: unassignedItems.map(item => item.name)
            }
          );
        } else {
          await recordOrderHistory(
            orderId,
            'restaurant_assignment_requested',
            null,
            {
              assignment_method: 'location_based',
              unassigned_items: unassignedItems.map(item => item.name)
            }
          );
        }
      }

      // Mixed order handling: both pre-assigned and unassigned items
      if (preAssignedItems.length > 0 && unassignedItems.length > 0) {
        await recordOrderHistory(
          orderId,
          'mixed_assignment_order',
          null,
          {
            pre_assigned_count: preAssignedItems.length,
            location_assigned_count: unassignedItems.length,
            requires_multiple_restaurants: true
          }
        );
      }

    } catch (error) {
      console.error('Error in unified restaurant assignment:', error);
      await recordOrderHistory(
        orderId,
        'assignment_error',
        null,
        { error: error instanceof Error ? error.message : 'Unknown assignment error' }
      );
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
