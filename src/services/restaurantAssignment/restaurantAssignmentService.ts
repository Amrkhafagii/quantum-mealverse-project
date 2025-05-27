
import { supabase } from '@/integrations/supabase/client';
import { Meal } from '@/types/food';
import {
  RestaurantFoodCapability,
  MealPlanRestaurantAssignment,
  RestaurantAssignmentDetail,
  MealFoodItem,
  CapableRestaurant,
  MultiRestaurantAssignmentResult,
  RestaurantAssignmentOptions
} from '@/types/restaurantAssignment';

export class RestaurantAssignmentService {
  /**
   * Find restaurants capable of preparing a complete meal
   */
  static async findCapableRestaurantsForMeal(
    meal: Meal,
    options: RestaurantAssignmentOptions = {}
  ): Promise<CapableRestaurant[]> {
    const {
      max_distance_km = 50,
      customer_latitude,
      customer_longitude
    } = options;

    // Convert meal foods to the format expected by the database function
    const foodItems = meal.foods.map(mealFood => ({
      food_name: mealFood.food.name,
      quantity: mealFood.portionSize
    }));

    try {
      const { data, error } = await supabase.rpc('find_capable_restaurants_for_meal', {
        p_food_items: foodItems,
        p_max_distance_km: max_distance_km,
        p_customer_lat: customer_latitude || null,
        p_customer_lng: customer_longitude || null
      });

      if (error) {
        console.error('Error finding capable restaurants:', error);
        throw error;
      }

      return (data || []).map((restaurant: any) => ({
        restaurant_id: restaurant.restaurant_id,
        restaurant_name: restaurant.restaurant_name,
        distance_km: restaurant.distance_km,
        estimated_prep_time: restaurant.estimated_prep_time,
        can_prepare_complete_meal: restaurant.can_prepare_complete_meal
      }));
    } catch (error) {
      console.error('Error in findCapableRestaurantsForMeal:', error);
      throw error;
    }
  }

  /**
   * Check if a specific restaurant can prepare all foods in a meal
   */
  static async checkRestaurantMealCapability(
    restaurantId: string,
    meal: Meal
  ): Promise<boolean> {
    const foodItems = meal.foods.map(mealFood => ({
      food_name: mealFood.food.name,
      quantity: mealFood.portionSize
    }));

    try {
      const { data, error } = await supabase.rpc('check_restaurant_meal_capability', {
        p_restaurant_id: restaurantId,
        p_food_items: foodItems
      });

      if (error) {
        console.error('Error checking restaurant capability:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error in checkRestaurantMealCapability:', error);
      return false;
    }
  }

  /**
   * Create a multi-restaurant assignment for a meal when no single restaurant can handle it
   */
  static async createMultiRestaurantAssignment(
    meal: Meal,
    options: RestaurantAssignmentOptions = {}
  ): Promise<MultiRestaurantAssignmentResult> {
    const {
      customer_latitude,
      customer_longitude
    } = options;

    const foodItems = meal.foods.map(mealFood => ({
      food_name: mealFood.food.name,
      quantity: mealFood.portionSize
    }));

    try {
      const { data, error } = await supabase.rpc('create_multi_restaurant_assignment', {
        p_food_items: foodItems,
        p_customer_lat: customer_latitude || null,
        p_customer_lng: customer_longitude || null
      });

      if (error) {
        console.error('Error creating multi-restaurant assignment:', error);
        throw error;
      }

      // Cast the JSON response to proper types
      const result = data as any;
      return {
        assignments: result.assignments || [],
        total_price: result.total_price || 0,
        strategy: result.strategy || 'multi_restaurant'
      };
    } catch (error) {
      console.error('Error in createMultiRestaurantAssignment:', error);
      throw error;
    }
  }

  /**
   * Get restaurant food capabilities for a specific restaurant
   */
  static async getRestaurantCapabilities(restaurantId: string): Promise<RestaurantFoodCapability[]> {
    try {
      const { data, error } = await supabase
        .from('restaurant_food_capabilities')
        .select(`
          *,
          food_items (
            name,
            category
          )
        `)
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true);

      if (error) {
        console.error('Error fetching restaurant capabilities:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRestaurantCapabilities:', error);
      return [];
    }
  }

  /**
   * Assign restaurants to a meal plan with the optimal strategy
   */
  static async assignRestaurantsToMeal(
    meal: Meal,
    options: RestaurantAssignmentOptions = {}
  ): Promise<RestaurantAssignmentDetail[]> {
    const {
      strategy = 'single_restaurant',
      prefer_single_restaurant = true
    } = options;

    console.log('Assigning restaurants to meal:', meal.name, 'with strategy:', strategy);

    try {
      // First, try to find restaurants that can prepare the complete meal
      const capableRestaurants = await this.findCapableRestaurantsForMeal(meal, options);
      
      // Filter restaurants that can prepare the complete meal
      const completeCapableRestaurants = capableRestaurants.filter(r => r.can_prepare_complete_meal);

      if (completeCapableRestaurants.length > 0 && (strategy === 'single_restaurant' || prefer_single_restaurant)) {
        // Use the best single restaurant
        const bestRestaurant = completeCapableRestaurants[0];
        
        // Calculate pricing for this restaurant
        const { MealPricingService } = await import('@/services/foodPricing/mealPricingService');
        const pricing = await MealPricingService.calculateMealPrice(meal, bestRestaurant.restaurant_id);

        return [{
          restaurant_id: bestRestaurant.restaurant_id,
          restaurant_name: bestRestaurant.restaurant_name,
          food_items: meal.foods.map(mealFood => ({
            food_name: mealFood.food.name,
            quantity: mealFood.portionSize,
            unit: 'grams'
          })),
          subtotal: pricing.total_price,
          estimated_prep_time: bestRestaurant.estimated_prep_time,
          distance_km: bestRestaurant.distance_km
        }];
      }

      // If no single restaurant can handle it, or strategy is multi-restaurant
      if (strategy === 'multi_restaurant' || completeCapableRestaurants.length === 0) {
        const multiAssignment = await this.createMultiRestaurantAssignment(meal, options);
        return multiAssignment.assignments;
      }

      // Fallback to cheapest strategy
      if (strategy === 'cheapest') {
        // For cheapest, we need to compare single vs multi-restaurant costs
        let bestOption: RestaurantAssignmentDetail[] = [];
        let bestPrice = Infinity;

        // Check single restaurant options
        for (const restaurant of completeCapableRestaurants) {
          const { MealPricingService } = await import('@/services/foodPricing/mealPricingService');
          const pricing = await MealPricingService.calculateMealPrice(meal, restaurant.restaurant_id);
          
          if (pricing.total_price < bestPrice) {
            bestPrice = pricing.total_price;
            bestOption = [{
              restaurant_id: restaurant.restaurant_id,
              restaurant_name: restaurant.restaurant_name,
              food_items: meal.foods.map(mealFood => ({
                food_name: mealFood.food.name,
                quantity: mealFood.portionSize,
                unit: 'grams'
              })),
              subtotal: pricing.total_price,
              estimated_prep_time: restaurant.estimated_prep_time,
              distance_km: restaurant.distance_km
            }];
          }
        }

        // Check multi-restaurant option
        const multiAssignment = await this.createMultiRestaurantAssignment(meal, options);
        if (multiAssignment.total_price < bestPrice) {
          bestOption = multiAssignment.assignments;
        }

        return bestOption;
      }

      throw new Error('No restaurants found that can prepare this meal');
    } catch (error) {
      console.error('Error in assignRestaurantsToMeal:', error);
      throw error;
    }
  }

  /**
   * Save meal plan restaurant assignment to database
   */
  static async saveMealPlanAssignment(
    mealPlanId: string,
    assignments: RestaurantAssignmentDetail[],
    strategy: string
  ): Promise<MealPlanRestaurantAssignment | null> {
    const totalPrice = assignments.reduce((sum, assignment) => sum + assignment.subtotal, 0);

    try {
      const { data, error } = await supabase
        .from('meal_plan_restaurant_assignments')
        .insert({
          meal_plan_id: mealPlanId,
          restaurant_assignments: assignments as any, // Cast to Json type
          total_price: totalPrice,
          assignment_strategy: strategy
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving meal plan assignment:', error);
        throw error;
      }

      // Cast the response to proper type
      return {
        ...data,
        restaurant_assignments: data.restaurant_assignments as RestaurantAssignmentDetail[]
      };
    } catch (error) {
      console.error('Error in saveMealPlanAssignment:', error);
      return null;
    }
  }

  /**
   * Get existing meal plan assignment
   */
  static async getMealPlanAssignment(mealPlanId: string): Promise<MealPlanRestaurantAssignment | null> {
    try {
      const { data, error } = await supabase
        .from('meal_plan_restaurant_assignments')
        .select('*')
        .eq('meal_plan_id', mealPlanId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching meal plan assignment:', error);
        return null;
      }

      if (!data) return null;

      // Cast the response to proper type
      return {
        ...data,
        restaurant_assignments: data.restaurant_assignments as RestaurantAssignmentDetail[]
      };
    } catch (error) {
      console.error('Error in getMealPlanAssignment:', error);
      return null;
    }
  }

  /**
   * Update restaurant food capabilities
   */
  static async updateRestaurantCapabilities(
    restaurantId: string,
    capabilities: Partial<RestaurantFoodCapability>[]
  ): Promise<boolean> {
    try {
      for (const capability of capabilities) {
        // Ensure required fields are present
        if (!capability.food_item_id) {
          console.error('Missing food_item_id for capability update');
          continue;
        }

        const { error } = await supabase
          .from('restaurant_food_capabilities')
          .upsert({
            restaurant_id: restaurantId,
            food_item_id: capability.food_item_id,
            is_available: capability.is_available ?? true,
            preparation_time_minutes: capability.preparation_time_minutes,
            minimum_quantity_grams: capability.minimum_quantity_grams,
            maximum_quantity_grams: capability.maximum_quantity_grams,
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error updating restaurant capability:', error);
          throw error;
        }
      }

      return true;
    } catch (error) {
      console.error('Error in updateRestaurantCapabilities:', error);
      return false;
    }
  }
}
