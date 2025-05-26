
import { supabase } from '@/integrations/supabase/client';
import { MealPricingResult, MealFoodWithPricing } from '@/types/foodPricing';
import { Meal, MealFood } from '@/types/food';
import { FoodItemService } from './foodItemService';

export class MealPricingService {
  /**
   * Calculate total price for a meal at a specific restaurant
   */
  static async calculateMealPrice(
    meal: Meal,
    restaurantId: string
  ): Promise<MealPricingResult> {
    const foodsWithPricing: MealFoodWithPricing[] = [];
    let totalPrice = 0;
    let restaurantName = '';

    // Get restaurant name using raw SQL
    try {
      const { data: restaurantData, error } = await supabase
        .rpc('execute_sql', { 
          sql: `SELECT name FROM restaurants WHERE id = '${restaurantId}'` 
        });
      
      if (restaurantData && restaurantData.length > 0) {
        restaurantName = restaurantData[0].name;
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

      if (pricing.length > 0) {
        const foodPricing = pricing[0]; // Use the first (cheapest) result
        
        const foodWithPricing: MealFoodWithPricing = {
          food_name: mealFood.food.name,
          quantity: mealFood.portionSize,
          unit: foodPricing.base_unit,
          price_per_unit: foodPricing.price_per_unit,
          total_price: foodPricing.total_price,
          nutritional_info: foodPricing.nutritional_info
        };

        foodsWithPricing.push(foodWithPricing);
        totalPrice += foodPricing.total_price;
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
      restaurant_name: restaurantName
    };
  }

  /**
   * Calculate meal price using raw SQL
   */
  static async calculateMealPriceDB(
    mealFoods: Array<{ food_name: string; quantity: number; unit: string }>,
    restaurantId: string
  ): Promise<number> {
    try {
      let totalPrice = 0;

      for (const mealFood of mealFoods) {
        const sql = `
          SELECT fip.price_per_unit
          FROM food_items fi
          JOIN food_item_prices fip ON fi.id = fip.food_item_id
          WHERE fi.name ILIKE '%${mealFood.food_name}%'
            AND fip.restaurant_id = '${restaurantId}'
            AND fip.is_active = true
          ORDER BY fip.price_per_unit ASC
          LIMIT 1
        `;

        const { data, error } = await supabase.rpc('execute_sql', { sql });

        if (error) {
          console.error('Error calculating meal price:', error);
          continue;
        }

        if (data && data.length > 0) {
          const pricePerUnit = parseFloat(data[0].price_per_unit);
          totalPrice += pricePerUnit * mealFood.quantity;
        }
      }

      return totalPrice;
    } catch (error) {
      console.error('Error in calculateMealPriceDB:', error);
      return 0;
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
   * Calculate dynamic pricing based on portion size
   */
  static calculatePortionPrice(
    basePricePerUnit: number,
    baseQuantity: number,
    requestedQuantity: number
  ): number {
    return (basePricePerUnit * requestedQuantity) / baseQuantity;
  }

  /**
   * Get price breakdown for meal components
   */
  static async getMealPriceBreakdown(
    meal: Meal,
    restaurantId: string
  ): Promise<{
    foods: MealFoodWithPricing[];
    subtotal: number;
    tax: number;
    total: number;
  }> {
    const mealPricing = await this.calculateMealPrice(meal, restaurantId);
    const subtotal = mealPricing.total_price;
    const tax = subtotal * 0.08; // 8% tax rate
    const total = subtotal + tax;

    return {
      foods: mealPricing.foods,
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  }
}
