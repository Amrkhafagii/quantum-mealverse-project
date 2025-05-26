
import { supabase } from '@/integrations/supabase/client';
import { Meal, MealFood } from '@/types/food';

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
 * Gets pricing for food items from the database
 */
export const getFoodPricing = async (foodNames: string[], restaurantId?: string): Promise<FoodPrice[]> => {
  try {
    let query = supabase
      .from('food_item_prices')
      .select('*')
      .in('food_name', foodNames)
      .eq('is_active', true);

    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching food pricing:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch food pricing:', error);
    return [];
  }
};

/**
 * Calculates the total price for a meal based on food items and portions
 */
export const calculateMealPricing = async (meal: Meal, restaurantId?: string): Promise<MealPricing> => {
  const foodNames = meal.foods.map(mealFood => mealFood.food.name);
  const foodPrices = await getFoodPricing(foodNames, restaurantId);

  // Create a map for quick price lookup
  const priceMap = new Map<string, number>();
  let selectedRestaurantId = restaurantId;

  foodPrices.forEach(price => {
    priceMap.set(price.food_name, price.price_per_100g);
    if (!selectedRestaurantId) {
      selectedRestaurantId = price.restaurant_id;
    }
  });

  const itemPrices = meal.foods.map(mealFood => {
    const foodName = mealFood.food.name;
    const portionSize = mealFood.portionSize;
    const pricePerGram = (priceMap.get(foodName) || 3.50) / 100; // Convert per 100g to per gram
    const itemTotal = pricePerGram * portionSize;

    return {
      foodName,
      portionSize,
      pricePerGram,
      itemTotal: Math.round(itemTotal * 100) / 100 // Round to 2 decimal places
    };
  });

  const totalPrice = itemPrices.reduce((sum, item) => sum + item.itemTotal, 0);

  return {
    totalPrice: Math.round(totalPrice * 100) / 100,
    itemPrices,
    restaurantId: selectedRestaurantId || ''
  };
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
