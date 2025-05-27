
import { useState } from 'react';
import { RestaurantAssignmentService } from '@/services/restaurantAssignment/restaurantAssignmentService';
import { Meal } from '@/types/food';
import {
  RestaurantAssignmentDetail,
  CapableRestaurant,
  RestaurantAssignmentOptions,
  MultiRestaurantAssignmentResult
} from '@/types/restaurantAssignment';

export const useRestaurantAssignment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findCapableRestaurants = async (
    meal: Meal,
    options?: RestaurantAssignmentOptions
  ): Promise<CapableRestaurant[]> => {
    setLoading(true);
    setError(null);

    try {
      const restaurants = await RestaurantAssignmentService.findCapableRestaurantsForMeal(meal, options);
      return restaurants;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to find capable restaurants';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const assignRestaurants = async (
    meal: Meal,
    options?: RestaurantAssignmentOptions
  ): Promise<RestaurantAssignmentDetail[]> => {
    setLoading(true);
    setError(null);

    try {
      const assignments = await RestaurantAssignmentService.assignRestaurantsToMeal(meal, options);
      return assignments;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign restaurants';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const checkRestaurantCapability = async (
    restaurantId: string,
    meal: Meal
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const canPrepare = await RestaurantAssignmentService.checkRestaurantMealCapability(restaurantId, meal);
      return canPrepare;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check restaurant capability';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createMultiRestaurantAssignment = async (
    meal: Meal,
    options?: RestaurantAssignmentOptions
  ): Promise<MultiRestaurantAssignmentResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const assignment = await RestaurantAssignmentService.createMultiRestaurantAssignment(meal, options);
      return assignment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create multi-restaurant assignment';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveMealPlanAssignment = async (
    mealPlanId: string,
    assignments: RestaurantAssignmentDetail[],
    strategy: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await RestaurantAssignmentService.saveMealPlanAssignment(mealPlanId, assignments, strategy);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save meal plan assignment';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    findCapableRestaurants,
    assignRestaurants,
    checkRestaurantCapability,
    createMultiRestaurantAssignment,
    saveMealPlanAssignment
  };
};
