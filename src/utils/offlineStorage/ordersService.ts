
import offlineStorage from './factory';
import { STORAGE_KEYS } from './types';

// Utility functions for working with active orders
export const getActiveOrders = async (): Promise<any[]> => {
  try {
    const orders = await offlineStorage.get<any[]>(STORAGE_KEYS.ACTIVE_ORDERS);
    return orders || [];
  } catch (error) {
    console.error('Error getting active orders:', error);
    return [];
  }
};

export const storeActiveOrder = async (order: any): Promise<void> => {
  try {
    const orders = await getActiveOrders();
    
    // Check if the order already exists
    const existingIndex = orders.findIndex(o => o.id === order.id);
    
    if (existingIndex >= 0) {
      // Update existing order
      orders[existingIndex] = order;
    } else {
      // Add new order
      orders.push(order);
    }
    
    await offlineStorage.set(STORAGE_KEYS.ACTIVE_ORDERS, orders);
  } catch (error) {
    console.error('Error storing active order:', error);
    throw error;
  }
};

export const getActiveOrder = async (orderId: string): Promise<any | null> => {
  try {
    const orders = await getActiveOrders();
    return orders.find(order => order.id === orderId) || null;
  } catch (error) {
    console.error('Error getting active order:', error);
    return null;
  }
};
