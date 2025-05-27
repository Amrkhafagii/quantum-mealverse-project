
import { supabase } from '@/integrations/supabase/client';
import type { DeliveryRating } from '@/types/delivery-features';

class DeliveryRatingService {
  async createRating(
    assignmentId: string,
    orderId: string,
    customerId: string,
    deliveryUserId: string,
    rating: number,
    comment?: string,
    ratingCategories?: Record<string, number>
  ): Promise<DeliveryRating | null> {
    try {
      const { data, error } = await supabase
        .from('delivery_ratings')
        .insert({
          delivery_assignment_id: assignmentId,
          order_id: orderId,
          customer_id: customerId,
          delivery_user_id: deliveryUserId,
          rating,
          comment,
          rating_categories: ratingCategories || {}
        })
        .select()
        .single();

      if (error) throw error;

      // Update delivery user's average rating
      await this.updateDeliveryUserRating(deliveryUserId);

      return {
        ...data,
        rating_categories: typeof data.rating_categories === 'string' 
          ? JSON.parse(data.rating_categories) 
          : (data.rating_categories as Record<string, number>)
      };
    } catch (error) {
      console.error('Error creating delivery rating:', error);
      return null;
    }
  }

  private async updateDeliveryUserRating(deliveryUserId: string): Promise<void> {
    try {
      // Calculate new average rating
      const { data: ratings } = await supabase
        .from('delivery_ratings')
        .select('rating')
        .eq('delivery_user_id', deliveryUserId);

      if (!ratings || ratings.length === 0) return;

      const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

      // Update delivery user record
      await supabase
        .from('delivery_users')
        .update({ 
          average_rating: Number(averageRating.toFixed(2)),
          total_deliveries: ratings.length
        })
        .eq('id', deliveryUserId);
    } catch (error) {
      console.error('Error updating delivery user rating:', error);
    }
  }

  async getRating(assignmentId: string): Promise<DeliveryRating | null> {
    try {
      const { data, error } = await supabase
        .from('delivery_ratings')
        .select('*')
        .eq('delivery_assignment_id', assignmentId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;

      return {
        ...data,
        rating_categories: typeof data.rating_categories === 'string' 
          ? JSON.parse(data.rating_categories) 
          : (data.rating_categories as Record<string, number>)
      };
    } catch (error) {
      console.error('Error fetching rating:', error);
      return null;
    }
  }

  async getDeliveryUserRatings(deliveryUserId: string, limit = 50): Promise<DeliveryRating[]> {
    try {
      const { data, error } = await supabase
        .from('delivery_ratings')
        .select('*')
        .eq('delivery_user_id', deliveryUserId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return (data || []).map(item => ({
        ...item,
        rating_categories: typeof item.rating_categories === 'string' 
          ? JSON.parse(item.rating_categories) 
          : (item.rating_categories as Record<string, number>)
      }));
    } catch (error) {
      console.error('Error fetching delivery user ratings:', error);
      return [];
    }
  }

  async canRateDelivery(assignmentId: string, customerId: string): Promise<boolean> {
    try {
      // Check if customer already rated this delivery
      const { data: existingRating } = await supabase
        .from('delivery_ratings')
        .select('id')
        .eq('delivery_assignment_id', assignmentId)
        .eq('customer_id', customerId)
        .single();

      if (existingRating) return false;

      // Check if delivery is completed
      const { data: assignment } = await supabase
        .from('delivery_assignments')
        .select('status')
        .eq('id', assignmentId)
        .single();

      return assignment?.status === 'delivered';
    } catch (error) {
      console.error('Error checking rating eligibility:', error);
      return false;
    }
  }
}

export const deliveryRatingService = new DeliveryRatingService();
