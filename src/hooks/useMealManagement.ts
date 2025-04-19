
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MealType } from '@/types/meal';

const initialFormState: MealType = {
  id: '',
  name: '',
  description: '',
  price: 0,
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  restaurant_id: ''
};

export const useMealManagement = (fetchMeals: () => Promise<void>) => {
  const [editingMeal, setEditingMeal] = useState<MealType | null>(null);
  const [formData, setFormData] = useState<MealType>(initialFormState);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;
    
    if (['price', 'calories', 'protein', 'carbs', 'fat'].includes(name)) {
      processedValue = parseFloat(value) || 0;
    }
    
    setFormData({
      ...formData,
      [name]: processedValue
    });
  };

  const handleEditMeal = (meal: MealType) => {
    setEditingMeal(meal);
    setFormData({
      id: meal.id,
      name: meal.name,
      description: meal.description,
      price: meal.price,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      restaurant_id: meal.restaurant_id,
      image_url: meal.image_url
    });
  };

  const handleSaveMeal = async () => {
    if (!editingMeal) return;
    
    try {
      const { error } = await supabase
        .from('meals')
        .update(formData)
        .eq('id', editingMeal.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `${formData.name} has been updated`,
      });
      
      setEditingMeal(null);
      fetchMeals();
    } catch (error: any) {
      toast({
        title: "Error updating meal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteMeal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this meal?")) return;
    
    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Meal has been deleted",
      });
      
      fetchMeals();
    } catch (error: any) {
      toast({
        title: "Error deleting meal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!editingMeal) return;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${editingMeal.id}.${fileExt}`;
      const filePath = `meals/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('meals')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('meals')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('meals')
        .update({ image_url: publicUrl })
        .eq('id', editingMeal.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });

      fetchMeals();
    } catch (error: any) {
      toast({
        title: "Error uploading image",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    editingMeal,
    formData,
    setEditingMeal,
    setFormData,
    handleInputChange,
    handleEditMeal,
    handleSaveMeal,
    handleDeleteMeal,
    handleImageUpload,
  };
};
