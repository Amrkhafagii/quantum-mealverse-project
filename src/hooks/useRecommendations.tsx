
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { MealType } from '@/types/meal';

// Allowable meal recommendation types
type RecommendationType = 'personalized' | 'trending' | 'dietary' | 'fitness';

export const useRecommendations = (type: RecommendationType = 'personalized') => {
  const { user } = useAuth();
  const [userPreferences, setUserPreferences] = useState<any>(null);

  // Fetch user preferences for meal recs
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user?.id) return;
      
      try {
        const { data: fitnessProfile } = await supabase
          .from('fitness_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        const { data: recentOrders } = await supabase
          .from('orders')
          .select('id')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        let orderItems = [];
        if (recentOrders?.length) {
          const orderIds = recentOrders.map(order => order.id);
          const { data: items } = await supabase
            .from('order_items')
            .select('meal_id, price, quantity')
            .in('order_id', orderIds);
          orderItems = items || [];
        }
        setUserPreferences({
          fitnessProfile,
          recentOrders,
          orderItems,
        });
      } catch (err) {
        console.error("Error fetching meal user prefs", err);
      }
    };
    fetchUserPreferences();
  }, [user?.id]);

  // Main meal recommendations query
  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ['meal-recommendations', type, user?.id, userPreferences],
    queryFn: async () => {
      let recommendedItems: MealType[] = [];
      // Get 'menu_items' sample
      const { data: menuItemsRaw, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .limit(20);
      if (error || !menuItemsRaw) return [];

      // Type conversion: map menu items to MealType (as used in CustomerMealCard)
      const allItems = menuItemsRaw.map(item => {
        // Parse/normalize nutritional info
        let calories = 0, protein = 0, carbs = 0, fat = 0;
        if (
          typeof item.nutritional_info === 'object' &&
          item.nutritional_info !== null
        ) {
          const n = item.nutritional_info;
          calories = Number(n.calories) || 0;
          protein = Number(n.protein) || 0;
          carbs = Number(n.carbs) || 0;
          fat = Number(n.fat) || 0;
        }
        // Demo dietary tags (mock logic)
        const mockDietaryTags = [];
        if (item.id && item.id.length > 0) {
          if (item.id.charCodeAt(0) % 2 === 0) mockDietaryTags.push('vegetarian');
          if (item.id.length > 1 && item.id.charCodeAt(1) % 3 === 0) mockDietaryTags.push('gluten-free');
          if (item.id.length > 2 && item.id.charCodeAt(2) % 4 === 0) mockDietaryTags.push('dairy-free');
          if (item.id.length > 3 && item.id.charCodeAt(3) % 5 === 0) mockDietaryTags.push('vegan');
          if (item.id.length > 4 && item.id.charCodeAt(4) % 6 === 0) mockDietaryTags.push('keto');
          if (item.id.length > 5 && item.id.charCodeAt(5) % 7 === 0) mockDietaryTags.push('high-protein');
        }
        return {
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          calories,
          protein,
          carbs,
          fat,
          image_url: item.image_url || `https://picsum.photos/seed/${item.id}/300/200`,
          is_active: item.is_available,
          restaurant_id: item.restaurant_id,
          created_at: item.created_at,
          updated_at: item.updated_at,
          dietary_tags: mockDietaryTags,
        } as MealType;
      });

      // Recommendation logic (simple demo)
      switch (type) {
        case 'dietary':
          recommendedItems = allItems.filter(item =>
            (item.dietary_tags || []).some(tag =>
              ['vegan', 'vegetarian', 'gluten-free', 'dairy-free'].includes(tag)
            )
          );
          break;
        case 'fitness':
          if (
            userPreferences?.fitnessProfile?.fitness_goals?.includes('lose_weight')
          ) {
            recommendedItems = [...allItems]
              .filter(item => item.calories < 500)
              .sort((a, b) => a.calories - b.calories);
          } else {
            recommendedItems = [...allItems]
              .filter(item => item.protein > 20)
              .sort((a, b) => b.protein - a.protein);
          }
          break;
        case 'trending':
          recommendedItems = [...allItems].sort(() => 0.5 - Math.random());
          break;
        case 'personalized':
        default:
          recommendedItems = [...allItems].sort(() => 0.5 - Math.random());
          break;
      }
      // Return top 4 recs
      return recommendedItems.slice(0, 4);
    },
    enabled: !!user?.id,
  });

  return {
    recommendations: recommendations ?? [],
    isLoading,
    error
  };
};
