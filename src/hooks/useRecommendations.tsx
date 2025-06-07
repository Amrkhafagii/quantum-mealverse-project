import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { MealType } from '@/types/meal';

type RecommendationType = 'personalized' | 'trending' | 'dietary' | 'fitness';

export const useRecommendations = (type: RecommendationType = 'personalized') => {
  const { user } = useAuth();
  const [userPreferences, setUserPreferences] = useState<any>(null);

  // Fetch user preferences from fitness profile and order history
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user?.id) return;
      
      try {
        // Get fitness profile
        const { data: fitnessProfile } = await supabase
          .from('fitness_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        // Get recent orders to understand preferences
        const { data: recentOrders } = await supabase
          .from('orders')
          .select('id')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        // Get order items from recent orders
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
          orderItems
        });
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      }
    };
    
    fetchUserPreferences();
  }, [user?.id]);
  
  // Get recommendations based on type
  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ['recommendations', type, user?.id, userPreferences],
    queryFn: async () => {
      // We'd normally call a sophisticated backend recommendation algorithm
      // For now, we'll simulate different recommendations based on the type
      
      try {
        let recommendedItems: MealType[] = [];
        
        // Get a pool of menu items to recommend from
        const { data: menuItems, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('is_available', true)
          .limit(20);
          
        if (error) throw error;
        
        // Transform menu items to MealType
        const allItems = menuItems.map(item => {
          let nutritionalInfo = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          };
          
          try {
            if (item.nutritional_info && 
                typeof item.nutritional_info === 'object' && 
                !Array.isArray(item.nutritional_info)) {
              nutritionalInfo = {
                calories: Number(item.nutritional_info.calories) || 0,
                protein: Number(item.nutritional_info.protein) || 0,
                carbs: Number(item.nutritional_info.carbs) || 0,
                fat: Number(item.nutritional_info.fat) || 0
              };
            }
          } catch (e) {
            console.error("Error parsing nutritional info:", e);
          }
          
          // Generate mock dietary tags for demonstration
          const mockDietaryTags = [];
          if (item.id.charCodeAt(0) % 2 === 0) mockDietaryTags.push('vegetarian');
          if (item.id.charCodeAt(1) % 3 === 0) mockDietaryTags.push('gluten-free');
          if (item.id.charCodeAt(2) % 4 === 0) mockDietaryTags.push('dairy-free');
          if (item.id.charCodeAt(3) % 5 === 0) mockDietaryTags.push('vegan');
          if (item.id.charCodeAt(4) % 6 === 0) mockDietaryTags.push('keto');
          if (item.id.charCodeAt(5) % 7 === 0) mockDietaryTags.push('high-protein');
          
          return {
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            calories: nutritionalInfo.calories,
            protein: nutritionalInfo.protein,
            carbs: nutritionalInfo.carbs,
            fat: nutritionalInfo.fat,
            image_url: item.image_url || `https://picsum.photos/seed/${item.id}/300/200`,
            is_active: item.is_available,
            restaurant_id: item.restaurant_id,
            created_at: item.created_at,
            updated_at: item.updated_at,
            dietary_tags: mockDietaryTags
          } as MealType;
        });
        
        // Apply recommendation logic based on type
        switch (type) {
          case 'personalized':
            // If user has preferences, customize recommendations
            if (userPreferences?.fitnessProfile) {
              const profile = userPreferences.fitnessProfile;
              
              // If user has dietary restrictions, filter items accordingly
              if (profile.dietary_restrictions?.length) {
                const restrictions = profile.dietary_restrictions;
                recommendedItems = allItems.filter(item => {
                  // Keep items that match the user's dietary needs
                  // This is a simplified example - in a real app you'd have more logic
                  const itemTags = item.dietary_tags || [];
                  return restrictions.every((restriction: string) => itemTags.includes(restriction));
                });
              }
              
              // If user has fitness goals, prioritize items that match those goals
              if (profile.fitness_goals?.includes('lose_weight')) {
                // Sort by lowest calories first
                recommendedItems = [...allItems].sort((a, b) => a.calories - b.calories);
              } else if (profile.fitness_goals?.includes('build_muscle')) {
                // Sort by highest protein first
                recommendedItems = [...allItems].sort((a, b) => b.protein - a.protein);
              }
            } else {
              // Default to popular items if no personalization data
              recommendedItems = [...allItems].sort(() => 0.5 - Math.random());
            }
            break;
            
          case 'trending':
            // In a real app, we'd sort by most ordered items
            // For demo, just shuffle the items
            recommendedItems = [...allItems].sort(() => 0.5 - Math.random());
            break;
            
          case 'dietary':
            // Focus on vegan, gluten-free, etc.
            recommendedItems = allItems.filter(item => 
              (item.dietary_tags || []).some(tag => 
                ['vegan', 'vegetarian', 'gluten-free', 'dairy-free'].includes(tag)
              )
            );
            break;
            
          case 'fitness':
            // Focus on high protein, low calorie options
            if (userPreferences?.fitnessProfile?.fitness_goals?.includes('lose_weight')) {
              // Low calorie options
              recommendedItems = [...allItems]
                .filter(item => item.calories < 500)
                .sort((a, b) => a.calories - b.calories);
            } else {
              // High protein options
              recommendedItems = [...allItems]
                .filter(item => item.protein > 20)
                .sort((a, b) => b.protein - a.protein);
            }
            break;
        }
        
        // Return top 4 recommendations
        return recommendedItems.slice(0, 4);
      } catch (error) {
        console.error('Error getting recommendations:', error);
        return [];
      }
    },
    enabled: !!user?.id
  });
  
  return {
    recommendations,
    isLoading,
    error
  };
};
