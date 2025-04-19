
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
    city: data.city
  };

  if (hasDeliveryInfo) {
    await supabase
      .from('delivery_info')
      .update(deliveryInfoData)
      .eq('user_id', userId);
  } else {
    await supabase
      .from('delivery_info')
      .insert(deliveryInfoData);
  }
};

export const createOrder = async (
  userId: string,
  data: DeliveryFormValues,
  items: CartItem[],
  totalAmount: number
) => {
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
    status: "pending"
  };
  
  const { data: insertedOrder, error: orderError } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();
    
  if (orderError) throw orderError;
  
  return insertedOrder;
};

export const createOrderItems = async (orderId: string, items: CartItem[]) => {
  const orderItems = items.map(item => ({
    order_id: orderId,
    meal_id: item.meal.id,
    quantity: item.quantity,
    price: item.meal.price,
    name: item.meal.name
  }));
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);
    
  if (itemsError) throw itemsError;
};

export const saveUserLocation = async (
  userId: string,
  latitude: number,
  longitude: number
) => {
  await supabase
    .from('user_locations')
    .insert({
      user_id: userId,
      latitude,
      longitude,
      source: 'checkout'
    });
};
