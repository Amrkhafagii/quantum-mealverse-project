
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { MenuItem, NutritionalInfo, calculateHealthScore } from '@/types/menu';
import { getMenuItems, saveMenuItem, deleteMenuItem } from '@/services/restaurant/menuService';

export const useMenuManagement = (restaurantId: string) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
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

  const handleSaveMenuItem = async (item: MenuItem) => {
    setIsLoading(true);
    try {
      const itemToSave = {
        ...item,
        restaurant_id: restaurantId,
      };
      
      const savedItem = await saveMenuItem(itemToSave);
      
      if (savedItem) {
        toast({
          title: "Success",
          description: `Menu item ${item.id ? 'updated' : 'created'} successfully`,
        });
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

  const editMenuItem = (item: MenuItem) => {
    setSelectedItem(item);
  };

  const getHealthScore = (nutritionalInfo: NutritionalInfo): number => {
    // Create a mock MenuItem to calculate health score
    const mockItem: MenuItem = {
      id: '',
      name: '',
      price: 0,
      restaurant_id: '',
      nutritional_info: nutritionalInfo
    };
    
    return calculateHealthScore(mockItem);
  };

  return {
    menuItems,
    selectedItem,
    isLoading,
    fetchMenuItems,
    handleSaveMenuItem,
    handleDeleteMenuItem,
    editMenuItem,
    setSelectedItem,
    getHealthScore
  };
};
