
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { MenuCategory } from '@/types/menu';
import { getMenuCategories, saveMenuCategory, deleteMenuCategory } from '@/services/restaurant/menuService';

export const useCategories = (restaurantId: string) => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const fetchedCategories = await getMenuCategories(restaurantId);
      setCategories(fetchedCategories);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCategory = async (category: MenuCategory) => {
    setIsLoading(true);
    try {
      const categoryToSave = {
        ...category,
        restaurant_id: restaurantId,
      };
      
      const savedCategory = await saveMenuCategory(categoryToSave);
      
      if (savedCategory) {
        toast({
          title: "Success",
          description: `Category ${category.id ? 'updated' : 'created'} successfully`,
        });
        fetchCategories();
        setSelectedCategory(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${category.id ? 'update' : 'create'} category`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    setIsLoading(true);
    try {
      const success = await deleteMenuCategory(categoryId, restaurantId);
      
      if (success) {
        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
        fetchCategories();
        setSelectedCategory(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    categories,
    selectedCategory,
    isLoading,
    fetchCategories,
    handleSaveCategory,
    handleDeleteCategory,
    setSelectedCategory
  };
};
