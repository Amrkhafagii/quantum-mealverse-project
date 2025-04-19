
import { supabase } from '@/integrations/supabase/client';
import { DeliveryFormValues } from '@/components/checkout/DeliveryForm';
import { CartItem } from '@/types/cart';
import { Order } from '@/types/order';

export const saveDeliveryInfo = async (
  userId: string, 
  data: DeliveryFormValues, 
  hasDeliveryInfo: boolean
) => {
  const deliveryInfoData = {
    user_id: userId,
    full_name: data.fullName,
    phone: data.phone,
    address: data.address,
    city: data.city,
    latitude: data.latitude,
    longitude: data.longitude
  };

  console.log("Saving delivery info with data:", deliveryInfoData);
  console.log("User has delivery info:", hasDeliveryInfo);

  try {
    if (hasDeliveryInfo) {
      const { data: updateResult, error: updateError } = await supabase
        .from('delivery_info')
        .update(deliveryInfoData)
        .eq('user_id', userId);
        
      if (updateError) {
        console.error("Error updating delivery info:", updateError);
        throw updateError;
      }
      
      console.log("Delivery info updated successfully:", updateResult);
    } else {
      const { data: insertResult, error: insertError } = await supabase
        .from('delivery_info')
        .insert(deliveryInfoData);
        
      if (insertError) {
        console.error("Error inserting delivery info:", insertError);
        throw insertError;
      }
      
      console.log("Delivery info inserted successfully:", insertResult);
    }
  } catch (error) {
    console.error("Delivery info operation failed:", error);
    throw error;
  }
};

export const createOrder = async (
  userId: string,
  data: DeliveryFormValues,
  items: CartItem[],
  totalAmount: number
) => {
  console.log("Creating order with user ID:", userId);
  console.log("Delivery method:", data.deliveryMethod);
  
  const deliveryFee = data.deliveryMethod === "delivery" ? 50 : 0;
  const finalTotal = totalAmount + deliveryFee;
  
  const orderData: Omit<Order, 'id'> = {
    user_id: userId,
    customer_name: data.fullName,
    customer_email: data.email,
    customer_phone: data.phone,
    delivery_address: data.address,
    city: data.city,
    notes: data.notes,
    delivery_method: data.deliveryMethod,
    payment_method: data.paymentMethod,
    delivery_fee: deliveryFee,
    subtotal: totalAmount,
    total: finalTotal,
    status: "pending",
    latitude: data.latitude,
    longitude: data.longitude
  };
  
  console.log("Order data being submitted:", orderData);
  
  try {
    // Fix: Select specific columns from orders table to avoid ambiguity
    const { data: insertedOrder, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select('id, status, total')
      .single();
      
    if (orderError) {
      console.error("Error creating order:", orderError);
      console.error("Error details:", JSON.stringify(orderError, null, 2));
      throw orderError;
    }
    
    console.log("Order created successfully:", insertedOrder);
    return insertedOrder;
  } catch (error) {
    console.error("Order creation failed:", error);
    if (error.code) {
      console.error(`Database error code: ${error.code}`);
    }
    if (error.details) {
      console.error(`Error details: ${error.details}`);
    }
    throw error;
  }
};

export const createOrderItems = async (orderId: string, items: CartItem[]) => {
  console.log("Creating order items for order ID:", orderId);
  console.log("Items to be added:", items.length);
  
  const orderItems = items.map(item => ({
    order_id: orderId,
    meal_id: item.meal.id,
    quantity: item.quantity,
    price: item.meal.price,
    name: item.meal.name
  }));
  
  console.log("Prepared order items data:", orderItems);
  
  try {
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
      
    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      console.error("Error details:", JSON.stringify(itemsError, null, 2));
      throw itemsError;
    }
    
    console.log("Order items created successfully:", itemsData);
    return itemsData;
  } catch (error) {
    console.error("Order items creation failed:", error);
    throw error;
  }
};

export const saveUserLocation = async (
  userId: string,
  latitude: number,
  longitude: number
) => {
  console.log("Saving user location:", { userId, latitude, longitude });
  
  try {
    const { data: locationData, error: locationError } = await supabase
      .from('user_locations')
      .insert({
        user_id: userId,
        latitude,
        longitude,
        source: 'checkout'
      });
      
    if (locationError) {
      console.error("Error saving user location:", locationError);
      console.error("Error details:", JSON.stringify(locationError, null, 2));
      throw locationError;
    }
    
    console.log("User location saved successfully:", locationData);
    return locationData;
  } catch (error) {
    console.error("User location saving failed:", error);
    throw error;
  }
};
