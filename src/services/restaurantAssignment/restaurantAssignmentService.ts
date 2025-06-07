
import { supabase } from '@/integrations/supabase/client';
import { Meal } from '@/types/food';
import {
  RestaurantAssignmentDetail,
  CapableRestaurant,
  RestaurantAssignmentOptions,
  MultiRestaurantAssignmentResult
} from '@/types/restaurantAssignment';

export class RestaurantAssignmentService {
  /**
   * Assigns restaurants to a meal based on proximity only (no capability checks)
   */
  static async assignRestaurantsToMeal(
    meal: Meal,
    options: RestaurantAssignmentOptions = {}
  ): Promise<RestaurantAssignmentDetail[]> {
    console.log('Assigning restaurants to meal based on proximity:', meal.name);

    const {
      strategy = 'single_restaurant',
      max_distance_km = 50,
      customer_latitude,
      customer_longitude
    } = options;

    try {
      // Get nearby restaurants based on location only
      const nearbyRestaurants = await this.findNearbyRestaurants(
        parseFloat(customer_latitude.toString()), // Ensure double precision
        parseFloat(customer_longitude.toString()), // Ensure double precision
        max_distance_km
    );
      if (!nearbyRestaurants || nearbyRestaurants.length === 0) {
        console.log('No nearby restaurants found, getting default restaurants');
        return await this.getDefaultRestaurants(meal);
      }

      const assignments: RestaurantAssignmentDetail[] = [];

      if (strategy === 'single_restaurant') {
        // Assign to the nearest restaurant
        const nearestRestaurant = nearbyRestaurants[0];
        const assignment = this.createRestaurantAssignment(meal, nearestRestaurant);
        assignments.push(assignment);
      } else {
        // For multi-restaurant, still assign to nearest for simplicity
        const nearestRestaurant = nearbyRestaurants[0];
        const assignment = this.createRestaurantAssignment(meal, nearestRestaurant);
        assignments.push(assignment);
      }

      console.log('Restaurant assignment completed:', assignments);
      return assignments;
    } catch (error) {
      console.error('Error in assignRestaurantsToMeal:', error);
      return await this.getDefaultRestaurants(meal);
    }
  }

  /**
   * Finds nearby restaurants based on customer location
   */
  private static async findNearbyRestaurants(
    latitude?: number,
    longitude?: number,
    maxDistance: number = 50
  ): Promise<any[]> {
    try {
      if (!latitude || !longitude) {
        console.log('No customer location provided, getting default restaurants');
        // Get any available restaurants when no location is provided
        const { data: restaurants, error } = await supabase
          .from('restaurants')
          .select('id, name, address, latitude, longitude, phone')
          .eq('is_active', true)
          .limit(5);

        if (error) throw error;
        
        return (restaurants || []).map((restaurant, index) => ({
          restaurant_id: restaurant.id,
          restaurant_name: restaurant.name,
          distance_km: 5 + index, // Mock distance for restaurants without location
          address: restaurant.address,
          phone: restaurant.phone,
          latitude: restaurant.latitude,
          longitude: restaurant.longitude
        }));
      }

      // Use the RPC function to find nearest restaurants
      const { data: nearbyRestaurants, error } = await supabase.rpc('find_nearest_restaurant', {
        order_lat: latitude,
        order_lng: longitude,
        max_distance_km: maxDistance
      });

      if (error) {
        console.error('Error calling find_nearest_restaurant:', error);
        throw error;
      }

      return nearbyRestaurants || [];
    } catch (error) {
      console.error('Error finding nearby restaurants:', error);
      return [];
    }
  }

  /**
   * Gets default restaurants when location-based search fails
   */
  private static async getDefaultRestaurants(meal: Meal): Promise<RestaurantAssignmentDetail[]> {
    try {
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select('id, name, address, phone')
        .eq('is_active', true)
        .limit(1);

      if (error) throw error;

      if (!restaurants || restaurants.length === 0) {
        throw new Error('No restaurants available');
      }

      const restaurant = restaurants[0];
      const assignment = this.createRestaurantAssignment(meal, {
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.name,
        distance_km: 5, // Default distance
        address: restaurant.address,
        phone: restaurant.phone
      });

      return [assignment];
    } catch (error) {
      console.error('Error getting default restaurants:', error);
      throw new Error('No restaurants available for assignment');
    }
  }

  /**
   * Creates a restaurant assignment for a meal
   */
  private static createRestaurantAssignment(
    meal: Meal,
    restaurant: any
  ): RestaurantAssignmentDetail {
    // Calculate a simple price based on meal components
    const basePrice = Math.max(meal.totalCalories * 0.05, 8.00); // $0.05 per calorie, minimum $8
    
    const foodItems = meal.foods.map(mealFood => ({
      food_name: mealFood.food.name,
      quantity: mealFood.portionSize,
      unit: 'grams',
      price_per_unit: 0.02, // Simple pricing
      total_price: mealFood.portionSize * 0.02
    }));

    return {
      restaurant_id: restaurant.restaurant_id,
      restaurant_name: restaurant.restaurant_name,
      food_items: foodItems,
      subtotal: basePrice,
      estimated_prep_time: 20 + (meal.foods.length * 5), // 20 base + 5 per food item
      distance_km: restaurant.distance_km || 5
    };
  }

  /**
   * Legacy method - now just calls assignRestaurantsToMeal for compatibility
   */
  static async findCapableRestaurantsForMeal(
    meal: Meal,
    options: RestaurantAssignmentOptions = {}
  ): Promise<CapableRestaurant[]> {
    console.log('findCapableRestaurantsForMeal called - using proximity-based assignment');
    
    try {
      const assignments = await this.assignRestaurantsToMeal(meal, options);
      
      return assignments.map(assignment => ({
        restaurant_id: assignment.restaurant_id,
        restaurant_name: assignment.restaurant_name,
        distance_km: assignment.distance_km || 5,
        estimated_prep_time: assignment.estimated_prep_time || 30,
        can_prepare_complete_meal: true // Always true since we don't check capabilities
      }));
    } catch (error) {
      console.error('Error in findCapableRestaurantsForMeal:', error);
      return [];
    }
  }

  /**
   * Legacy method - simplified to always return true
   */
  static async checkRestaurantMealCapability(
    restaurantId: string,
    meal: Meal
  ): Promise<boolean> {
    console.log('checkRestaurantMealCapability called - always returning true for proximity-based assignment');
    return true; // Always return true since we don't check capabilities anymore
  }

  /**
   * Creates a multi-restaurant assignment (simplified to single restaurant)
   */
  static async createMultiRestaurantAssignment(
    meal: Meal,
    options: RestaurantAssignmentOptions = {}
  ): Promise<MultiRestaurantAssignmentResult> {
    const assignments = await this.assignRestaurantsToMeal(meal, {
      ...options,
      strategy: 'single_restaurant'
    });

    const totalPrice = assignments.reduce((sum, assignment) => sum + assignment.subtotal, 0);

    return {
      assignments,
      total_price: totalPrice,
      strategy: 'proximity_based'
    };
  }

  /**
   * Saves meal plan assignment to database
   */
  static async saveMealPlanAssignment(
    mealPlanId: string,
    assignments: RestaurantAssignmentDetail[],
    strategy: string
  ): Promise<boolean> {
    try {
      const totalPrice = assignments.reduce((sum, assignment) => sum + assignment.subtotal, 0);

      const { error } = await supabase
        .from('meal_plan_restaurant_assignments')
        .insert({
          meal_plan_id: mealPlanId,
          restaurant_assignments: assignments as any,
          total_price: totalPrice,
          assignment_strategy: strategy
        });

      if (error) {
        console.error('Error saving meal plan assignment:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in saveMealPlanAssignment:', error);
      return false;
    }
  }
}
