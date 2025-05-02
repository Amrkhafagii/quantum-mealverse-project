
import { supabase } from '@/integrations/supabase/client';
import { DeliveryEarning } from '@/types/delivery';

// Get earnings for a delivery user based on time period
export const getDeliveryEarnings = async (
  deliveryUserId: string,
  period: 'week' | 'month' | 'year' = 'week'
): Promise<DeliveryEarning[]> => {
  try {
    // Calculate the start date based on the period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }
    
    const startDateString = startDate.toISOString();
    
    const { data, error } = await supabase
      .from('delivery_earnings')
      .select('*')
      .eq('delivery_user_id', deliveryUserId)
      .gte('created_at', startDateString)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching earnings:', error);
      throw error;
    }

    return data as DeliveryEarning[];
  } catch (error) {
    console.error('Error in getDeliveryEarnings:', error);
    throw error;
  }
};

// Get earnings summary by period
export const getEarningsSummary = async (
  deliveryUserId: string,
  period: 'week' | 'month' | 'year' = 'week'
): Promise<{
  totalEarnings: number;
  totalDeliveries: number;
  averagePerDelivery: number;
  totalTips: number;
}> => {
  try {
    const earnings = await getDeliveryEarnings(deliveryUserId, period);
    
    const totalEarnings = earnings.reduce((sum, earning) => sum + earning.total_amount, 0);
    const totalDeliveries = earnings.length;
    const averagePerDelivery = totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0;
    const totalTips = earnings.reduce((sum, earning) => sum + earning.tip_amount, 0);
    
    return {
      totalEarnings,
      totalDeliveries,
      averagePerDelivery,
      totalTips
    };
  } catch (error) {
    console.error('Error in getEarningsSummary:', error);
    throw error;
  }
};

// Record a new earning for a completed delivery
export const recordDeliveryEarning = async (
  deliveryUserId: string,
  orderId: string | undefined,
  baseAmount: number,
  tipAmount: number = 0,
  bonusAmount: number = 0
): Promise<DeliveryEarning> => {
  try {
    const { data, error } = await supabase
      .from('delivery_earnings')
      .insert({
        delivery_user_id: deliveryUserId,
        order_id: orderId,
        base_amount: baseAmount,
        tip_amount: tipAmount,
        bonus_amount: bonusAmount,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording earnings:', error);
      throw error;
    }

    return data as DeliveryEarning;
  } catch (error) {
    console.error('Error in recordDeliveryEarning:', error);
    throw error;
  }
};
