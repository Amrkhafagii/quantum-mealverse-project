
import { Meal } from '@/types/food';
import { CartItem } from '@/contexts/CartContext';
import { RestaurantAssignmentService } from '@/services/restaurantAssignment/restaurantAssignmentService';
import { MealPricingService } from '@/services/foodPricing/mealPricingService';
import { RestaurantAssignmentOptions } from '@/types/restaurantAssignment';

/**
 * Enhanced meal to cart conversion with restaurant assignment
 */
export const convertMealToCartItemWithAssignment = async (
  meal: Meal, 
  userId: string, 
  options: RestaurantAssignmentOptions = {}
): Promise<CartItem[]> => {
  console.log('Converting meal to cart items with restaurant assignment:', meal.name);

  try {
    // Get restaurant assignments for this meal
    const assignments = await RestaurantAssignmentService.assignRestaurantsToMeal(meal, options);
    
    if (assignments.length === 0) {
      throw new Error('No restaurants found that can prepare this meal');
    }

    const cartItems: CartItem[] = [];

    // Create cart items for each restaurant assignment
    for (const assignment of assignments) {
      // Calculate accurate pricing for this restaurant
      const pricing = await MealPricingService.calculateMealPrice(meal, assignment.restaurant_id);
      
      // Create description from food items for this restaurant
      const foodDescriptions = assignment.food_items.map(food => 
        `${food.food_name} (${food.quantity}g)`
      );
      
      const description = `${foodDescriptions.join(', ')} - Prepared by ${assignment.restaurant_name}`;
      
      // Generate unique ID for this assignment
      const cartItemId = `${meal.id}-${assignment.restaurant_id}`;

      const cartItem: CartItem = {
        id: cartItemId,
        name: assignments.length > 1 ? `${meal.name} - ${assignment.restaurant_name}` : meal.name,
        price: assignment.subtotal,
        quantity: 1,
        description: description,
        calories: meal.totalCalories,
        protein: meal.totalProtein,
        carbs: meal.totalCarbs,
        fat: meal.totalFat,
        restaurant_id: assignment.restaurant_id,
        dietary_tags: [],
        image_url: generateMealImageUrl(meal),
        assignment_details: assignment,
        estimated_prep_time: assignment.estimated_prep_time,
        distance_km: assignment.distance_km
      };

      cartItems.push(cartItem);
    }

    // Save the assignment to database for later reference
    const mealPlanId = `meal-${meal.id}-${userId}`;
    await RestaurantAssignmentService.saveMealPlanAssignment(
      mealPlanId,
      assignments,
      options.strategy || (assignments.length > 1 ? 'multi_restaurant' : 'single_restaurant')
    );

    console.log(`Created ${cartItems.length} cart items for meal assignment:`, {
      mealName: meal.name,
      totalPrice: cartItems.reduce((sum, item) => sum + item.price, 0),
      restaurants: assignments.map(a => a.restaurant_name)
    });

    return cartItems;
  } catch (error) {
    console.error('Error converting meal to cart items with assignment:', error);
    throw error;
  }
};

/**
 * Check restaurant availability for multiple meals
 */
export const checkMealsRestaurantAvailability = async (
  meals: Meal[],
  options: RestaurantAssignmentOptions = {}
): Promise<{ [mealId: string]: boolean }> => {
  const availability: { [mealId: string]: boolean } = {};

  for (const meal of meals) {
    try {
      const capableRestaurants = await RestaurantAssignmentService.findCapableRestaurantsForMeal(meal, options);
      availability[meal.id] = capableRestaurants.some(r => r.can_prepare_complete_meal) || capableRestaurants.length > 0;
    } catch (error) {
      console.error(`Error checking availability for meal ${meal.name}:`, error);
      availability[meal.id] = false;
    }
  }

  return availability;
};

/**
 * Find the best restaurant assignment strategy for a list of meals
 */
export const findBestAssignmentStrategy = async (
  meals: Meal[],
  options: RestaurantAssignmentOptions = {}
): Promise<{
  strategy: 'single_restaurant' | 'multi_restaurant' | 'mixed';
  total_price: number;
  restaurant_count: number;
  assignments: { [mealId: string]: any };
}> => {
  const assignments: { [mealId: string]: any } = {};
  let totalPrice = 0;
  const restaurantIds = new Set<string>();

  for (const meal of meals) {
    const mealAssignments = await RestaurantAssignmentService.assignRestaurantsToMeal(meal, options);
    assignments[meal.id] = mealAssignments;
    
    for (const assignment of mealAssignments) {
      totalPrice += assignment.subtotal;
      restaurantIds.add(assignment.restaurant_id);
    }
  }

  const restaurantCount = restaurantIds.size;
  let strategy: 'single_restaurant' | 'multi_restaurant' | 'mixed';

  if (restaurantCount === 1) {
    strategy = 'single_restaurant';
  } else if (meals.every(meal => assignments[meal.id].length === 1)) {
    strategy = 'multi_restaurant';
  } else {
    strategy = 'mixed';
  }

  return {
    strategy,
    total_price: totalPrice,
    restaurant_count: restaurantCount,
    assignments
  };
};

/**
 * Generates a placeholder image URL for the meal based on its composition
 */
const generateMealImageUrl = (meal: Meal): string => {
  // Create a seed based on meal name for consistent images
  const seed = meal.name.toLowerCase().replace(/\s+/g, '-');
  return `https://picsum.photos/seed/${seed}/300/200`;
};

/**
 * Validates that a meal can be converted to cart items with restaurant assignment
 */
export const validateMealForCartWithAssignment = async (
  meal: Meal,
  options: RestaurantAssignmentOptions = {}
): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> => {
  const errors: string[] = [];
  const warnings: string[] = [];

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

  // Check restaurant availability
  try {
    const capableRestaurants = await RestaurantAssignmentService.findCapableRestaurantsForMeal(meal, options);
    
    if (capableRestaurants.length === 0) {
      errors.push('No restaurants found that can prepare any components of this meal');
    } else {
      const completeCapableRestaurants = capableRestaurants.filter(r => r.can_prepare_complete_meal);
      
      if (completeCapableRestaurants.length === 0) {
        warnings.push('No single restaurant can prepare the complete meal. It will be split across multiple restaurants.');
      }
      
      if (capableRestaurants.some(r => r.distance_km > 20)) {
        warnings.push('Some restaurants are far from your location, which may increase delivery time.');
      }
    }
  } catch (error) {
    errors.push('Failed to check restaurant availability');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
