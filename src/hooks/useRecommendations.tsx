
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { MealType } from "@/types/meal";

// Allowable meal recommendation types
type RecommendationType = "personalized" | "trending" | "dietary" | "fitness";

// Strong guard for object shape for nutritional info
function isNutritionalInfoObject(
  n: unknown
): n is { calories?: any; protein?: any; carbs?: any; fat?: any } {
  return (
    typeof n === "object" &&
    n !== null &&
    !Array.isArray(n) &&
    "calories" in n &&
    "protein" in n &&
    "carbs" in n &&
    "fat" in n
  );
}

export const useRecommendations = (
  type: RecommendationType = "personalized"
) => {
  const { user } = useAuth();
  const [userPreferences, setUserPreferences] = useState<any>(null);

  // Fetch user preferences for meal recs
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user?.id) return;

      try {
        const { data: fitnessProfile } = await supabase
          .from("fitness_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        const { data: recentOrders } = await supabase
          .from("orders")
          .select("id")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);
        let orderItems = [];
        if (recentOrders?.length) {
          const orderIds = recentOrders.map((order: any) => order.id);
          const { data: items } = await supabase
            .from("order_items")
            .select("meal_id, price, quantity")
            .in("order_id", orderIds);
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
  const {
    data: recommendations,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "meal-recommendations",
      type,
      user?.id || "",
      userPreferences,
    ],
    // Add explicit types and non-recursive return to avoid excessive depth
    queryFn: async (): Promise<MealType[]> => {
      // Get 'menu_items' sample
      const { data: menuItemsRaw, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_available", true)
        .limit(20);

      if (error || !menuItemsRaw) return [];

      // Map menu items to MealType used in CustomerMealCard
      const allItems: MealType[] = menuItemsRaw.map((item: any) => {
        // Parse/normalize nutritional info
        let calories = 0,
          protein = 0,
          carbs = 0,
          fat = 0;

        let nutritionalInfo = item.nutritional_info;

        // Parse if string from db
        if (typeof nutritionalInfo === "string") {
          try {
            nutritionalInfo = JSON.parse(nutritionalInfo);
          } catch {
            nutritionalInfo = undefined;
          }
        }

        // Only pick values if it's a plain object and not an array
        if (isNutritionalInfoObject(nutritionalInfo)) {
          calories = Number(nutritionalInfo.calories) || 0;
          protein = Number(nutritionalInfo.protein) || 0;
          carbs = Number(nutritionalInfo.carbs) || 0;
          fat = Number(nutritionalInfo.fat) || 0;
        }

        // Demo dietary tags (mock logic)
        const mockDietaryTags = [];
        if (item.id && typeof item.id === "string" && item.id.length > 0) {
          if (item.id.charCodeAt(0) % 2 === 0) mockDietaryTags.push("vegetarian");
          if (
            item.id.length > 1 &&
            item.id.charCodeAt(1) % 3 === 0
          )
            mockDietaryTags.push("gluten-free");
          if (
            item.id.length > 2 &&
            item.id.charCodeAt(2) % 4 === 0
          )
            mockDietaryTags.push("dairy-free");
          if (
            item.id.length > 3 &&
            item.id.charCodeAt(3) % 5 === 0
          )
            mockDietaryTags.push("vegan");
          if (
            item.id.length > 4 &&
            item.id.charCodeAt(4) % 6 === 0
          )
            mockDietaryTags.push("keto");
          if (
            item.id.length > 5 &&
            item.id.charCodeAt(5) % 7 === 0
          )
            mockDietaryTags.push("high-protein");
        }

        return {
          id: item.id as string,
          name: item.name,
          description: item.description || "",
          price: item.price,
          calories,
          protein,
          carbs,
          fat,
          image_url:
            item.image_url || `https://picsum.photos/seed/${item.id}/300/200`,
          is_active: !!item.is_available,
          restaurant_id: item.restaurant_id,
          created_at: item.created_at,
          updated_at: item.updated_at,
          dietary_tags: mockDietaryTags,
        };
      });

      // Recommendation logic (simple demo)
      let recommendedItems: MealType[] = [];
      switch (type) {
        case "dietary":
          recommendedItems = allItems.filter((item) =>
            (item.dietary_tags || []).some((tag) =>
              [
                "vegan",
                "vegetarian",
                "gluten-free",
                "dairy-free",
              ].includes(tag)
            )
          );
          break;
        case "fitness":
          if (userPreferences?.fitnessProfile?.fitness_goals?.includes("lose_weight")) {
            recommendedItems = [...allItems]
              .filter((item) => item.calories < 500)
              .sort((a, b) => a.calories - b.calories);
          } else {
            recommendedItems = [...allItems]
              .filter((item) => item.protein > 20)
              .sort((a, b) => b.protein - a.protein);
          }
          break;
        case "trending":
          recommendedItems = [...allItems].sort(() => 0.5 - Math.random());
          break;
        case "personalized":
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
    error,
  };
};

// ... End of file

