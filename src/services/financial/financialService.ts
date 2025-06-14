
import { supabase } from '@/integrations/supabase/client';

// Simple financial service with type safety workarounds
export const getDeliveryEarnings = async (deliveryUserId: string) => {
  try {
    // @ts-expect-error - Working around deep type instantiation issue
    const { data, error } = await supabase
      .from('delivery_earnings')
      .select('*')
      .eq('delivery_user_id', deliveryUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching delivery earnings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getDeliveryEarnings:', error);
    return [];
  }
};

export const getTotalEarnings = async (deliveryUserId: string) => {
  try {
    // @ts-expect-error - Working around deep type instantiation issue
    const { data, error } = await supabase
      .from('delivery_earnings')
      .select('total_amount')
      .eq('delivery_user_id', deliveryUserId);

    if (error) {
      console.error('Error fetching total earnings:', error);
      return 0;
    }

    const total = (data || []).reduce((sum: number, earning: any) => {
      return sum + (earning.total_amount || 0);
    }, 0);

    return total;
  } catch (error) {
    console.error('Error in getTotalEarnings:', error);
    return 0;
  }
};

export const getEarningsAnalytics = async (deliveryUserId: string, period: 'week' | 'month' | 'year' = 'month') => {
  try {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // @ts-expect-error - Working around deep type instantiation issue
    const { data, error } = await supabase
      .from('delivery_earnings')
      .select('*')
      .eq('delivery_user_id', deliveryUserId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching earnings analytics:', error);
      return { total: 0, count: 0, average: 0 };
    }

    const earnings = data || [];
    const total = earnings.reduce((sum: number, earning: any) => sum + (earning.total_amount || 0), 0);
    const count = earnings.length;
    const average = count > 0 ? total / count : 0;

    return { total, count, average };
  } catch (error) {
    console.error('Error in getEarningsAnalytics:', error);
    return { total: 0, count: 0, average: 0 };
  }
};
