
import { Meal } from '@/types/food';
import { CartItem } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { RestaurantAssignmentService } from '@/services/restaurantAssignment/restaurantAssignmentService';
import { RestaurantAssignmentDetail, RestaurantAssignmentOptions } from '@/types/restaurantAssignment';

interface MealPricingResult {
  total_price: number;
  restaurantId?: string;
  restaurant_name?: string;
  distance?: number;
}

/**
 * Converts a meal plan meal into cart items with location-based restaurant assignment
 */
export const convertMealToCartItemWithAssignment = async (
  meal: Meal, 
  userId: string,
  options: RestaurantAssignmentOptions = {}
): Promise<CartItem[]> => {
  console.log('Converting meal to cart items with location-based assignment:', meal.name);

  try {
    // Get restaurant assignment based on location only (no capability checks)
    const assignments = await RestaurantAssignmentService.assignRestaurantsToMeal(meal, {
      ...options,
      strategy: 'single_restaurant' // Always use single restaurant for simplicity
    });

    if (!assignments || assignments.length === 0) {
      console.log('No restaurants found nearby, using default restaurant');
      // Get any available restaurant as fallback
      const { data: restaurants } = await supabase
        .from('restaurants')
        .select('id, name')
        .eq('is_active', true)
        .limit(1);

      if (!restaurants || restaurants.length === 0) {
        throw new Error('No restaurants available');
      }

      // Create default assignment
      const defaultAssignment: RestaurantAssignmentDetail = {
        restaurant_id: restaurants[0].id,
        restaurant_name: restaurants[0].name,
        food_items: meal.foods.map(mealFood => ({
          food_name: mealFood.food.name,
          quantity: mealFood.portionSize
        })),
        subtotal: calculateDefaultPrice(meal),
        distance_km: 5 // Default distance
      };
      
      assignments.push(defaultAssignment);
    }

    // Calculate pricing based on assignment
    const pricing: MealPricingResult = {
      total_price: assignments[0].subtotal,
      restaurantId: assignments[0].restaurant_id,
      restaurant_name: assignments[0].restaurant_name,
      distance: assignments[0].distance_km
    };
    
    // Store the meal plan data for order processing
    const mealPlanItemId = await storeMealPlanCartItem(meal, pricing, userId, assignments);

    // Create description from food items
    const foodDescriptions = meal.foods.map(mealFood => 
      `${mealFood.food.name} (${mealFood.portionSize}g)`
    );
    
    const description = foodDescriptions.join(', ');

    // Create cart item
    const cartItem: CartItem = {
      id: mealPlanItemId || crypto.randomUUID(),
      name: meal.name,
      price: pricing.total_price,
      quantity: 1,
      description: description,
      calories: meal.totalCalories,
      protein: meal.totalProtein,
      carbs: meal.totalCarbs,
      fat: meal.totalFat,
      restaurant_id: pricing.restaurantId,
      dietary_tags: [],
      image_url: generateMealImageUrl(meal)
    };

    console.log('Created cart item with location-based assignment:', {
      mealName: cartItem.name,
      totalPrice: pricing,
      restaurantName: pricing.restaurant_name,
      distance: pricing.distance
    });

    return [cartItem];
  } catch (error) {
    console.error('Error converting meal to cart item with assignment:', error);
    throw error;
  }
};

/**
 * Calculates a default price for a meal when no restaurant pricing is available
 */
const calculateDefaultPrice = (meal: Meal): number => {
  // Simple calculation: $0.05 per calorie
  return Math.max(meal.totalCalories * 0.05, 5.00); // Minimum $5
};

/**
 * Generates a placeholder image URL for the meal based on its composition
 */
const generateMealImageUrl = (meal: Meal): string => {
  const seed = meal.name.toLowerCase().replace(/\s+/g, '-');
  return `https://picsum.photos/seed/${seed}/300/200`;
};

/**
 * Stores meal plan cart item data for order processing
 */
const storeMealPlanCartItem = async (
  meal: Meal,
  pricing: MealPricingResult,
  userId: string,
  assignments: RestaurantAssignmentDetail[]
): Promise<string> => {
  try {
    // Create a meal plan record first
    const mealPlanId = crypto.randomUUID();
    
    const { data: mealPlan, error: mealPlanError } = await supabase
      .from('meal_plans')
      .insert({
        id: mealPlanId,
        user_id: userId,
        name: meal.name,
        target_calories: meal.totalCalories,
        target_protein: meal.totalProtein,
        target_carbs: meal.totalCarbs,
        target_fat: meal.totalFat,
        is_active: true
      })
      .select()
      .single();

    if (mealPlanError) {
      console.error('Error creating meal plan:', mealPlanError);
      throw mealPlanError;
    }

    // Store the restaurant assignment
    const assignmentData = {
      meal_plan_id: mealPlanId,
      restaurant_assignments: assignments as any, // Cast to any to handle Json type
      total_price: pricing.total_price,
      assignment_strategy: 'location_based'
    };

    const { data: assignment, error: assignmentError } = await supabase
      .from('meal_plan_restaurant_assignments')
      .insert(assignmentData)
      .select()
      .single();

    if (assignmentError) {
      console.error('Error saving meal plan assignment:', assignmentError);
      // Don't throw here, continue with meal plan ID
    }

    return mealPlanId;
  } catch (error) {
    console.error('Error storing meal plan cart item:', error);
    return crypto.randomUUID(); // Return fallback ID
  }
};

/**
 * Validates that a meal can be converted to a cart item
 */
export const validateMealForCart = (meal: Meal): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!meal.name || meal.name.trim() === '') {
    errors.push('Meal must have a name');
  }

  if (!meal.foods || meal.foods.length === 0) {
    errors.push('Meal must contain at least one food item');
  }

  if (meal.foods.some(mealFood => !mealFood.portionSize || mealFood.portionSize <= 0)) {
    errors.push('All food items must have valid portion sizes');
  }

  if (meal.totalCalories <= 0) {
    errors.push('Meal must have positive calorie content');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Batch converts multiple meals to cart items with location-based assignment
 */
export const convertMealsToCartItems = async (
  meals: Meal[], 
  userId: string, 
  options: RestaurantAssignmentOptions = {}
): Promise<{ items: CartItem[]; errors: string[] }> => {
  const items: CartItem[] = [];
  const errors: string[] = [];

  for (const meal of meals) {
    const validation = validateMealForCart(meal);
    
    if (!validation.isValid) {
      errors.push(`${meal.name}: ${validation.errors.join(', ')}`);
      continue;
    }

    try {
      const cartItems = await convertMealToCartItemWithAssignment(meal, userId, options);
      items.push(...cartItems);
    } catch (error) {
      console.error(`Failed to convert meal ${meal.name}:`, error);
      errors.push(`Failed to convert ${meal.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return { items, errors };
};
