
import { supabase } from '@/integrations/supabase/client';
import { Meal, MealFood } from '@/types/food';
import { FoodItemService, MealPricingService } from '@/services/foodPricing';

export interface FoodPrice {
  id: string;
  food_name: string;
  price_per_100g: number;
  restaurant_id: string;
  is_active: boolean;
}

export interface MealPricing {
  totalPrice: number;
  itemPrices: Array<{
    foodName: string;
    portionSize: number;
    pricePerGram: number;
    itemTotal: number;
  }>;
  restaurantId: string;
}

/**
 * Gets pricing for food items from the new food pricing system
 */
export const getFoodPricing = async (foodNames: string[], restaurantId?: string): Promise<FoodPrice[]> => {
  try {
    const prices: FoodPrice[] = [];

    for (const foodName of foodNames) {
      const pricingData = await FoodItemService.getFoodItemPricing(
        foodName,
        restaurantId,
        100 // Get price per 100 units
      );

      if (pricingData.length > 0) {
        const pricing = pricingData[0]; // Use the first (cheapest) result
        prices.push({
          id: pricing.food_item_id,
          food_name: pricing.food_name,
          price_per_100g: pricing.price_per_unit * 100, // Convert to price per 100g
          restaurant_id: pricing.restaurant_id,
          is_active: true
        });
      }
    }

    return prices;
  } catch (error) {
    console.error('Failed to fetch food pricing:', error);
    return [];
  }
};

/**
 * Calculates the total price for a meal using the new pricing system
 */
export const calculateMealPricing = async (meal: Meal, restaurantId?: string): Promise<MealPricing> => {
  try {
    if (!restaurantId) {
      // If no restaurant specified, find the cheapest option
      const { data: restaurants } = await supabase
        .from('restaurants')
        .select('id')
        .eq('is_active', true)
        .limit(5);

      if (restaurants && restaurants.length > 0) {
        const restaurantIds = restaurants.map(r => r.id);
        const cheapestOption = await MealPricingService.findCheapestRestaurantForMeal(meal, restaurantIds);
        
        if (cheapestOption) {
          return {
            totalPrice: cheapestOption.total_price,
            itemPrices: cheapestOption.foods.map(food => ({
              foodName: food.food_name,
              portionSize: food.quantity,
              pricePerGram: food.price_per_unit,
              itemTotal: food.total_price
            })),
            restaurantId: cheapestOption.restaurant_id
          };
        }
      }
    }

    // Calculate pricing for specific restaurant
    const mealPricing = await MealPricingService.calculateMealPrice(meal, restaurantId!);
    
    return {
      totalPrice: mealPricing.total_price,
      itemPrices: mealPricing.foods.map(food => ({
        foodName: food.food_name,
        portionSize: food.quantity,
        pricePerGram: food.price_per_unit,
        itemTotal: food.total_price
      })),
      restaurantId: mealPricing.restaurant_id
    };
  } catch (error) {
    console.error('Failed to calculate meal pricing:', error);
    
    // Return fallback structure
    return {
      totalPrice: 0,
      itemPrices: meal.foods.map(mealFood => ({
        foodName: mealFood.food.name,
        portionSize: mealFood.portionSize,
        pricePerGram: 0,
        itemTotal: 0
      })),
      restaurantId: restaurantId || ''
    };
  }
};

/**
 * Finds the closest matching food name for pricing
 */
export const findBestPriceMatch = (foodName: string, availablePrices: FoodPrice[]): FoodPrice | null => {
  // First try exact match
  const exactMatch = availablePrices.find(price => 
    price.food_name.toLowerCase() === foodName.toLowerCase()
  );
  if (exactMatch) return exactMatch;

  // Then try partial matches
  const partialMatch = availablePrices.find(price => 
    foodName.toLowerCase().includes(price.food_name.toLowerCase()) ||
    price.food_name.toLowerCase().includes(foodName.toLowerCase())
  );
  if (partialMatch) return partialMatch;

  // No match found
  return null;
};

/**
 * Stores meal plan cart item for later retrieval
 */
export const storeMealPlanCartItem = async (
  meal: Meal, 
  pricing: MealPricing, 
  userId: string
): Promise<string | null> => {
  try {
    // Convert meal to JSON-serializable format
    const mealData = JSON.parse(JSON.stringify(meal));
    
    const { data, error } = await supabase
      .from('meal_plan_cart_items')
      .insert({
        meal_plan_data: mealData,
        total_price: pricing.totalPrice,
        restaurant_id: pricing.restaurantId,
        user_id: userId
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error storing meal plan cart item:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Failed to store meal plan cart item:', error);
    return null;
  }
};
