import { supabase } from '@/integrations/supabase/client';
import { MealPricingResult, MealFoodWithPricing } from '@/types/foodPricing';
import { Meal, MealFood } from '@/types/food';
import { FoodItemService } from './foodItemService';
import { RestaurantAssignmentService } from '@/services/restaurantAssignment/restaurantAssignmentService';
import { RestaurantAssignmentOptions } from '@/types/restaurantAssignment';

export class MealPricingService {
  /**
   * Calculate total price for a meal at a specific restaurant
   */
  static async calculateMealPrice(
    meal: Meal,
    restaurantId: string
  ): Promise<MealPricingResult> {
    // First check if the restaurant can actually prepare this meal
    const canPrepare = await RestaurantAssignmentService.checkRestaurantMealCapability(restaurantId, meal);
    
    if (!canPrepare) {
      console.warn(`Restaurant ${restaurantId} cannot prepare meal ${meal.name}`);
    }

    const foodsWithPricing: MealFoodWithPricing[] = [];
    let totalPrice = 0;
    let restaurantName = '';

    // Get restaurant name
    try {
      const { data: restaurantData, error } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', restaurantId)
        .single();
      
      if (restaurantData && !error) {
        restaurantName = restaurantData.name;
      }
    } catch (error) {
      console.error('Error fetching restaurant name:', error);
    }

    for (const mealFood of meal.foods) {
      const pricing = await FoodItemService.getFoodItemPricing(
        mealFood.food.name,
        restaurantId,
        mealFood.portionSize
      );

      if (pricing && pricing.length > 0) {
        const foodPricing = pricing[0]; // Use the first (cheapest) result
        
        const foodWithPricing: MealFoodWithPricing = {
          food_name: mealFood.food.name,
          quantity: mealFood.portionSize,
          unit: foodPricing.base_unit,
          price_per_unit: foodPricing.calculated_price / mealFood.portionSize,
          total_price: foodPricing.calculated_price,
          nutritional_info: foodPricing.nutritional_info
        };

        foodsWithPricing.push(foodWithPricing);
        totalPrice += foodPricing.calculated_price;
      } else {
        // Handle case where no pricing is found
        console.warn(`No pricing found for ${mealFood.food.name} at restaurant ${restaurantId}`);
        
        const foodWithPricing: MealFoodWithPricing = {
          food_name: mealFood.food.name,
          quantity: mealFood.portionSize,
          unit: 'grams',
          price_per_unit: 0,
          total_price: 0,
          nutritional_info: {
            calories: mealFood.food.calories,
            protein: mealFood.food.protein,
            carbs: mealFood.food.carbs,
            fat: mealFood.food.fat
          }
        };

        foodsWithPricing.push(foodWithPricing);
      }
    }

    return {
      total_price: Math.round(totalPrice * 100) / 100, // Round to 2 decimal places
      foods: foodsWithPricing,
      restaurant_id: restaurantId,
      restaurant_name: restaurantName,
      can_prepare_meal: canPrepare
    };
  }

  /**
   * Calculate pricing using restaurant assignment logic
   */
  static async calculateMealPriceWithAssignment(
    meal: Meal,
    options: RestaurantAssignmentOptions = {}
  ): Promise<MealPricingResult[]> {
    try {
      // Get restaurant assignments for this meal
      const assignments = await RestaurantAssignmentService.assignRestaurantsToMeal(meal, options);
      
      const results: MealPricingResult[] = [];
      
      for (const assignment of assignments) {
        const pricing = await this.calculateMealPrice(meal, assignment.restaurant_id);
        results.push({
          ...pricing,
          assignment_details: assignment
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error calculating meal price with assignment:', error);
      throw error;
    }
  }

  /**
   * Compare meal prices across multiple restaurants
   */
  static async compareMealPricesAcrossRestaurants(
    meal: Meal,
    restaurantIds: string[]
  ): Promise<MealPricingResult[]> {
    const results: MealPricingResult[] = [];

    for (const restaurantId of restaurantIds) {
      try {
        const pricing = await this.calculateMealPrice(meal, restaurantId);
        results.push(pricing);
      } catch (error) {
        console.error(`Error calculating price for restaurant ${restaurantId}:`, error);
      }
    }

    // Sort by total price (ascending)
    return results.sort((a, b) => a.total_price - b.total_price);
  }

  /**
   * Find the cheapest restaurant for a meal
   */
  static async findCheapestRestaurantForMeal(
    meal: Meal,
    restaurantIds: string[]
  ): Promise<MealPricingResult | null> {
    const comparisons = await this.compareMealPricesAcrossRestaurants(meal, restaurantIds);
    
    if (comparisons.length === 0) return null;
    
    return comparisons[0]; // Already sorted by price
  }

  /**
   * Get price breakdown for meal components with tax
   */
  static async getMealPriceBreakdown(
    meal: Meal,
    restaurantId: string,
    taxRate: number = 0.08
  ): Promise<{
    foods: MealFoodWithPricing[];
    subtotal: number;
    tax: number;
    total: number;
  }> {
    const mealPricing = await this.calculateMealPrice(meal, restaurantId);
    const subtotal = mealPricing.total_price;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return {
      foods: mealPricing.foods,
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  }

  /**
   * Calculate pricing for multiple portion sizes
   */
  static async getMealPricingForPortions(
    meal: Meal,
    restaurantId: string,
    portionMultipliers: number[]
  ): Promise<{ multiplier: number; pricing: MealPricingResult }[]> {
    const results: { multiplier: number; pricing: MealPricingResult }[] = [];

    for (const multiplier of portionMultipliers) {
      // Create a modified meal with adjusted portion sizes
      const adjustedMeal: Meal = {
        ...meal,
        foods: meal.foods.map(mealFood => ({
          ...mealFood,
          portionSize: mealFood.portionSize * multiplier
        }))
      };

      const pricing = await this.calculateMealPrice(adjustedMeal, restaurantId);
      results.push({ multiplier, pricing });
    }

    return results;
  }
}
