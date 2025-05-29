
import { Meal } from '@/types/food';
import { CartItem } from '@/contexts/CartContext';
import { MealPricingService } from '@/services/foodPricing/mealPricingService';
import { RestaurantAssignmentOptions, RestaurantAssignmentDetail } from '@/types/restaurantAssignment';
import { supabase } from '@/integrations/supabase/client';

/**
 * Enhanced meal to cart conversion with simplified restaurant assignment (location-based only)
 */
export const convertMealToCartItemWithAssignment = async (
  meal: Meal, 
  userId: string, 
  options: RestaurantAssignmentOptions = {}
): Promise<CartItem[]> => {
  console.log('Converting meal to cart items with location-based assignment:', meal.name);

  try {
    // Get nearest restaurants by location only - no capability filtering
    const nearestRestaurants = await findNearestRestaurantsByLocation(options);
    
    if (nearestRestaurants.length === 0) {
      throw new Error('No restaurants found in your area');
    }

    const cartItems: CartItem[] = [];

    // Create a single assignment to the nearest restaurant
    const nearestRestaurant = nearestRestaurants[0];
    
    // Calculate estimated pricing for this restaurant
    const pricing = await MealPricingService.calculateMealPrice(meal, nearestRestaurant.restaurant_id);
    
    // Create description from food items
    const foodDescriptions = meal.foods.map(mealFood => 
      `${mealFood.food.name} (${mealFood.portionSize}g)`
    );
    
    const description = `${foodDescriptions.join(', ')} - Will be prepared by nearest restaurant`;
    
    // Generate unique ID for this assignment
    const cartItemId = `${meal.id}-${nearestRestaurant.restaurant_id}`;

    const assignment: RestaurantAssignmentDetail = {
      restaurant_id: nearestRestaurant.restaurant_id,
      restaurant_name: nearestRestaurant.restaurant_name,
      food_items: meal.foods.map(mealFood => ({
        food_name: mealFood.food.name,
        quantity: mealFood.portionSize,
        unit: 'g',
        price_per_unit: pricing.totalPrice / meal.foods.reduce((sum, f) => sum + f.portionSize, 0),
        total_price: pricing.totalPrice
      })),
      subtotal: pricing.totalPrice,
      estimated_prep_time: 30, // Default estimated prep time
      distance_km: nearestRestaurant.distance_km
    };

    const cartItem: CartItem = {
      id: cartItemId,
      name: meal.name,
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
      distance_km: assignment.distance_km,
      assignment_source: 'nutrition_generation'
    };

    cartItems.push(cartItem);

    // Save the assignment to database for later reference
    const mealPlanId = `meal-${meal.id}-${userId}`;
    await saveMealPlanAssignmentSimplified(
      mealPlanId,
      [assignment],
      'single_restaurant'
    );

    console.log(`Created cart item with location-based assignment:`, {
      mealName: meal.name,
      totalPrice: cartItem.price,
      restaurantName: assignment.restaurant_name,
      distance: assignment.distance_km
    });

    return cartItems;
  } catch (error) {
    console.error('Error converting meal to cart items with location-based assignment:', error);
    throw error;
  }
};

/**
 * Find nearest restaurants by location only (no capability filtering)
 */
const findNearestRestaurantsByLocation = async (
  options: RestaurantAssignmentOptions = {}
): Promise<Array<{
  restaurant_id: string;
  restaurant_name: string;
  distance_km: number;
}>> => {
  try {
    const maxDistance = options.max_distance_km || 50; // Default 50km radius
    const customerLat = options.customer_latitude;
    const customerLng = options.customer_longitude;

    // If no customer location provided, get some default restaurants
    if (!customerLat || !customerLng) {
      console.log('No customer location provided, getting default restaurants');
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select('id, name, latitude, longitude')
        .eq('is_active', true)
        .limit(5);

      if (error) {
        console.error('Error fetching default restaurants:', error);
        throw error;
      }

      return (restaurants || []).map(restaurant => ({
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.name,
        distance_km: 5.0 // Default distance for restaurants without location context
      }));
    }

    // Use RPC function to find nearest restaurants by location
    const { data: nearestRestaurants, error } = await supabase.rpc('find_nearest_restaurant', {
      order_lat: customerLat,
      order_lng: customerLng,
      max_distance_km: maxDistance
    });

    if (error) {
      console.error('Error finding nearest restaurants:', error);
      throw error;
    }

    if (!nearestRestaurants || nearestRestaurants.length === 0) {
      throw new Error(`No restaurants found within ${maxDistance}km of your location`);
    }

    return nearestRestaurants.map((restaurant: any) => ({
      restaurant_id: restaurant.restaurant_id,
      restaurant_name: restaurant.restaurant_name || 'Restaurant',
      distance_km: restaurant.distance_km || 0
    }));
  } catch (error) {
    console.error('Error in findNearestRestaurantsByLocation:', error);
    throw error;
  }
};

/**
 * Simplified meal plan assignment saving (no capability validation)
 */
const saveMealPlanAssignmentSimplified = async (
  mealPlanId: string,
  assignments: RestaurantAssignmentDetail[],
  strategy: string
): Promise<any> => {
  try {
    const totalPrice = assignments.reduce((sum, assignment) => sum + assignment.subtotal, 0);

    const { data, error } = await supabase
      .from('meal_plan_restaurant_assignments')
      .insert({
        meal_plan_id: mealPlanId,
        restaurant_assignments: assignments,
        total_price: totalPrice,
        assignment_strategy: strategy,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving meal plan assignment:', error);
      // Don't throw here - assignment saving is not critical for cart functionality
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in saveMealPlanAssignmentSimplified:', error);
    return null;
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
 * Validates that a meal can be converted to cart items (simplified - no capability checks)
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

  // Check if restaurants are available in the area (no capability validation)
  try {
    const nearestRestaurants = await findNearestRestaurantsByLocation(options);
    
    if (nearestRestaurants.length === 0) {
      errors.push('No restaurants found in your area');
    } else {
      if (nearestRestaurants[0].distance_km > 20) {
        warnings.push('Nearest restaurant is far from your location, which may increase delivery time.');
      }
      
      warnings.push('Order will be assigned to nearest restaurant. Restaurant may decline if they cannot prepare specific items.');
    }
  } catch (error) {
    errors.push('Failed to check restaurant availability in your area');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
