
import { supabase } from '@/integrations/supabase/client';
import { OrderReprocessService } from './orderReprocessService';

export class OrderFixService {
  /**
   * Clean up broken assignments with NULL restaurant_id
   */
  static async cleanupBrokenAssignments(orderId?: string): Promise<number> {
    try {
      console.log('Cleaning up broken assignments with NULL restaurant_id...');
      
      let query = supabase
        .from('restaurant_assignments')
        .delete()
        .is('restaurant_id', null);
      
      if (orderId) {
        query = query.eq('order_id', orderId);
      }
      
      const { data, error } = await query.select('id');
      
      if (error) {
        console.error('Error cleaning up broken assignments:', error);
        return 0;
      }
      
      const deletedCount = data?.length || 0;
      console.log(`Deleted ${deletedCount} broken assignments`);
      return deletedCount;
    } catch (error) {
      console.error('Error in cleanupBrokenAssignments:', error);
      return 0;
    }
  }
  
  /**
   * Fix a specific order by cleaning up and reprocessing
   */
  static async fixOrder(orderId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`Fixing order ${orderId}...`);
      
      // Step 1: Clean up broken assignments for this order
      const deletedCount = await this.cleanupBrokenAssignments(orderId);
      console.log(`Cleaned up ${deletedCount} broken assignments for order ${orderId}`);
      
      // Step 2: Reprocess the order
      const reprocessResult = await OrderReprocessService.reprocessOrder(orderId);
      
      if (reprocessResult.success) {
        return {
          success: true,
          message: `Order ${orderId} fixed successfully. Deleted ${deletedCount} broken assignments and sent for reprocessing.`
        };
      } else {
        return {
          success: false,
          message: `Failed to reprocess order ${orderId}: ${reprocessResult.message}`
        };
      }
    } catch (error) {
      console.error(`Error fixing order ${orderId}:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Get orders with broken assignments
   */
  static async getBrokenAssignments(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('restaurant_assignments')
        .select(`
          id,
          order_id,
          restaurant_id,
          status,
          created_at,
          orders!restaurant_assignments_order_id_fkey(
            customer_name,
            total,
            status
          )
        `)
        .is('restaurant_id', null)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching broken assignments:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getBrokenAssignments:', error);
      return [];
    }
  }
}
