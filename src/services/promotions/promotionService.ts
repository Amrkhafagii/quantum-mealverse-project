
import { supabase } from '@/integrations/supabase/client';
import type { RestaurantPromotion } from '@/types/notifications';

export class PromotionService {
  // Get active promotions for a restaurant
  async getActivePromotions(restaurantId: string): Promise<RestaurantPromotion[]> {
    const { data, error } = await supabase
      .from('restaurant_promotions')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .lte('start_date', new Date().toISOString())
      .gte('end_date', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(promotion => ({
      ...promotion,
      promotion_type: promotion.promotion_type as RestaurantPromotion['promotion_type'],
      applicable_items: Array.isArray(promotion.applicable_items) ? promotion.applicable_items : []
    }));
  }

  // Get all promotions for a restaurant
  async getAllPromotions(restaurantId: string): Promise<RestaurantPromotion[]> {
    const { data, error } = await supabase
      .from('restaurant_promotions')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(promotion => ({
      ...promotion,
      promotion_type: promotion.promotion_type as RestaurantPromotion['promotion_type'],
      applicable_items: Array.isArray(promotion.applicable_items) ? promotion.applicable_items : []
    }));
  }

  // Create a new promotion
  async createPromotion(
    promotion: Omit<RestaurantPromotion, 'id' | 'created_at' | 'updated_at' | 'usage_count'>
  ): Promise<RestaurantPromotion> {
    const { data, error } = await supabase
      .from('restaurant_promotions')
      .insert({
        ...promotion,
        usage_count: 0,
        applicable_items: promotion.applicable_items || []
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      promotion_type: data.promotion_type as RestaurantPromotion['promotion_type'],
      applicable_items: Array.isArray(data.applicable_items) ? data.applicable_items : []
    };
  }

  // Update a promotion
  async updatePromotion(
    promotionId: string,
    updates: Partial<RestaurantPromotion>
  ): Promise<RestaurantPromotion> {
    const { data, error } = await supabase
      .from('restaurant_promotions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', promotionId)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      promotion_type: data.promotion_type as RestaurantPromotion['promotion_type'],
      applicable_items: Array.isArray(data.applicable_items) ? data.applicable_items : []
    };
  }

  // Delete a promotion
  async deletePromotion(promotionId: string): Promise<void> {
    const { error } = await supabase
      .from('restaurant_promotions')
      .delete()
      .eq('id', promotionId);

    if (error) throw error;
  }

  // Toggle promotion active status
  async togglePromotionStatus(promotionId: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('restaurant_promotions')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', promotionId);

    if (error) throw error;
  }

  // Get promotion usage statistics
  async getPromotionUsage(promotionId: string): Promise<{
    totalUsage: number;
    recentUsage: any[];
  }> {
    const { data, error } = await supabase
      .from('promotion_usage')
      .select(`
        *,
        orders(customer_name, total, created_at)
      `)
      .eq('promotion_id', promotionId)
      .order('used_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return {
      totalUsage: data?.length || 0,
      recentUsage: data || []
    };
  }
}

export const promotionService = new PromotionService();
