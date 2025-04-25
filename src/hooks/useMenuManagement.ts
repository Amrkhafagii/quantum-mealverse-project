
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { MenuItem, MenuCategory, NutritionalInfo, calculateHealthScore } from '@/types/menu';
import { 
  getMenuItems, 
  saveMenuItem, 
  deleteMenuItem,
  getMenuCategories,
  saveMenuCategory,
  deleteMenuCategory
} from '@/services/restaurant/menuService';

const INITIAL_MENU_ITEM: MenuItem = {
  id: '',
  restaurant_id: '',
  name: '',
  description: '',
  price: 0,
  category: '',
  is_available: true,
  preparation_time: 15,
  nutritional_info: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  }
};

const INITIAL_CATEGORY: MenuCategory = {
  id: '',
  name: '',
  restaurant_id: '',
};

export const useMenuManagement = (restaurantId: string) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchMenuItems = async (categoryFilter?: string) => {
    setIsLoading(true);
    try {
      const items = await getMenuItems(restaurantId, categoryFilter);
      setMenuItems(items);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSaveMenuItem = async (item: MenuItem) => {
    setIsLoading(true);
    try {
      // Ensure restaurant_id is set
      const itemToSave = {
        ...item,
        restaurant_id: restaurantId,
      };
      
      // Calculate health score if nutritional info is provided
      if (itemToSave.nutritional_info) {
        itemToSave.nutritional_info.health_score = calculateHealthScore(itemToSave.nutritional_info);
      }
      
      const savedItem = await saveMenuItem(itemToSave);
      
      if (savedItem) {
        toast({
          title: "Success",
          description: `Menu item ${item.id ? 'updated' : 'created'} successfully`,
        });
        
        // Refresh menu items
        fetchMenuItems();
        setSelectedItem(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${item.id ? 'update' : 'create'} menu item`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    setIsLoading(true);
    try {
      const success = await deleteMenuItem(itemId, restaurantId);
      
      if (success) {
        toast({
          title: "Success",
          description: "Menu item deleted successfully",
        });
        
        // Refresh menu items
        fetchMenuItems();
        setSelectedItem(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCategory = async (category: MenuCategory) => {
    setIsLoading(true);
    try {
      // Ensure restaurant_id is set
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
        
        // Refresh categories
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
        
        // Refresh categories
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

  const createNewMenuItem = () => {
    setSelectedItem({
      ...INITIAL_MENU_ITEM,
      restaurant_id: restaurantId,
    });
  };

  const createNewCategory = () => {
    setSelectedCategory({
      ...INITIAL_CATEGORY,
      restaurant_id: restaurantId,
    });
  };

  const editMenuItem = (item: MenuItem) => {
    setSelectedItem(item);
  };

  const editCategory = (category: MenuCategory) => {
    setSelectedCategory(category);
  };

  return {
    menuItems,
    categories,
    selectedItem,
    selectedCategory,
    isLoading,
    fetchMenuItems,
    fetchCategories,
    handleSaveMenuItem,
    handleDeleteMenuItem,
    handleSaveCategory,
    handleDeleteCategory,
    createNewMenuItem,
    createNewCategory,
    editMenuItem,
    editCategory,
    setSelectedItem,
    setSelectedCategory,
    INITIAL_MENU_ITEM,
    INITIAL_CATEGORY
  };
};
