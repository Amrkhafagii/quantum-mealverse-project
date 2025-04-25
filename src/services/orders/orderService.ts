
export const createOrderItems = async (orderId: string, items: CartItem[]) => {
  const orderItems = items.map(item => ({
    order_id: orderId,
    meal_id: item.meal.id,
    quantity: item.quantity,
    price: item.meal.price,
    name: item.meal.name
  }));
  
  try {
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
      
    if (itemsError) throw itemsError;
    
    // Record the items in order history
    await recordOrderHistory(
      orderId,
      OrderStatus.PENDING,
      null,
      { items_count: items.length }
    );
  } catch (error) {
    throw error;
  }
};
