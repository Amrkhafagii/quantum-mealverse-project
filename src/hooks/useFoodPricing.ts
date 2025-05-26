
import { useState } from 'react';
import { FoodItemService, MealPricingService } from '@/services/foodPricing';
import { FoodItem, FoodPricingQuery, MealPricingResult, DynamicPricing } from '@/types/foodPricing';
import { Meal } from '@/types/food';

export const useFoodPricing = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchFoodItems = async (searchTerm: string): Promise<FoodItem[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const items = await FoodItemService.searchFoodItems(searchTerm);
      return items;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search food items');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getFoodPricing = async (
    foodName: string, 
    restaurantId?: string, 
    portionSize: number = 100
  ): Promise<FoodPricingQuery[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const pricing = await FoodItemService.getFoodItemPricing(foodName, restaurantId, portionSize);
      return pricing;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get food pricing');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const calculateMealPrice = async (
    meal: Meal, 
    restaurantId: string
  ): Promise<MealPricingResult | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const pricing = await MealPricingService.calculateMealPrice(meal, restaurantId);
      return pricing;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate meal price');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const comparePricesAcrossRestaurants = async (
    meal: Meal, 
    restaurantIds: string[]
  ): Promise<MealPricingResult[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const comparisons = await MealPricingService.compareMealPricesAcrossRestaurants(meal, restaurantIds);
      return comparisons;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compare prices');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const calculateDynamicPricing = (
    basePrice: number,
    basePortion: number,
    requestedPortion: number
  ): DynamicPricing => {
    return FoodItemService.calculateDynamicPricing(basePrice, basePortion, requestedPortion);
  };

  const getCheapestPrice = async (
    foodName: string,
    portionSize: number = 100
  ): Promise<FoodPricingQuery | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const cheapest = await FoodItemService.getCheapestPrice(foodName, portionSize);
      return cheapest;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get cheapest price');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    searchFoodItems,
    getFoodPricing,
    calculateMealPrice,
    comparePricesAcrossRestaurants,
    calculateDynamicPricing,
    getCheapestPrice
  };
};
