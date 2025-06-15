
import { supabase } from '@/integrations/supabase/client';

export class DeliveryEarningsService {
  /**
   * Calculate and record earnings for a delivery assignment.
   */
  static async recordEarnings({
    deliveryUserId,
    orderId,
    assignmentId,
    baseAmount,
    bonusAmount,
    tipAmount,
  }: {
    deliveryUserId: string;
    orderId: string;
    assignmentId: string;
    baseAmount: number;
    bonusAmount?: number;
    tipAmount?: number;
  }) {
    const totalAmount = baseAmount + (bonusAmount || 0) + (tipAmount || 0);
    const { error } = await supabase.from('delivery_earnings').insert([{
      delivery_user_id: deliveryUserId,
      order_id: orderId,
      assignment_id: assignmentId,
      base_amount: baseAmount,
      bonus_amount: bonusAmount || 0,
      tip_amount: tipAmount || 0,
      total_amount: totalAmount,
      status: 'pending',
    }]);
    if (error) throw error;
    return true;
  }
}
