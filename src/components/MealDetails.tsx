
import React, { useEffect, useState } from 'react';
import supabase from '@/services/supabaseClient';
import { Meal as MealType } from '@/types/meal';

const MealDetails: React.FC<{ id: string }> = ({ id }) => {
  const [meal, setMeal] = useState<MealType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeal = async () => {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching meal:', error);
          return;
        }

        // Convert the database object to MealType
        if (data) {
          // Parse nutritional_info if it's a string
          const nutritionalInfo = typeof data.nutritional_info === 'string' 
            ? JSON.parse(data.nutritional_info) 
            : data.nutritional_info;
          
          const mealData: MealType = {
            id: data.id,
            name: data.name,
            description: data.description,
            image_url: data.image_url,
            price: data.price,
            category: data.category,
            ingredients: data.ingredients || [],
            steps: data.steps || [],
            preparation_time: data.preparation_time || 0,
            restaurant_id: data.restaurant_id,
            is_available: data.is_available || true,
            is_active: true, // Default to true if not available in data
            nutritional_info: {
              calories: nutritionalInfo?.calories || 0,
              protein: nutritionalInfo?.protein || 0, 
              carbs: nutritionalInfo?.carbs || 0,
              fat: nutritionalInfo?.fat || 0
            },
            created_at: data.created_at,
            updated_at: data.updated_at
          };
          
          setMeal(mealData);
        }
      } catch (error) {
        console.error('Error in meal fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMeal();
    }
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!meal) {
    return <div>Meal not found</div>;
  }

  return (
    <div>
      <h1>{meal.name}</h1>
      <p>{meal.description}</p>
      <p>${meal.price.toFixed(2)}</p>
      {meal.image_url && <img src={meal.image_url} alt={meal.name} />}
      
      <h2>Nutritional Information</h2>
      <ul>
        <li>Calories: {meal.nutritional_info.calories}</li>
        <li>Protein: {meal.nutritional_info.protein}g</li>
        <li>Carbs: {meal.nutritional_info.carbs}g</li>
        <li>Fat: {meal.nutritional_info.fat}g</li>
      </ul>
    </div>
  );
};

export default MealDetails;
