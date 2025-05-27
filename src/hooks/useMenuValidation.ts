
import { useState, useEffect } from 'react';
import { MenuValidationService } from '@/services/validation/menuValidationService';
import { useToast } from '@/hooks/use-toast';

export const useMenuValidation = () => {
  const [hasMenuData, setHasMenuData] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkMenuData();
  }, []);

  const checkMenuData = async () => {
    try {
      setIsLoading(true);
      const hasData = await MenuValidationService.hasMenuData();
      setHasMenuData(hasData);
      
      if (!hasData) {
        toast({
          title: "Menu data missing",
          description: "The restaurant menu is currently being updated. Please try again later.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error checking menu data:', error);
      setHasMenuData(false);
    } finally {
      setIsLoading(false);
    }
  };

  const validateMenuItem = async (itemId: string) => {
    return await MenuValidationService.validateMenuItem(itemId);
  };

  const validateMenuItems = async (itemIds: string[]) => {
    return await MenuValidationService.validateMenuItems(itemIds);
  };

  return {
    hasMenuData,
    isLoading,
    checkMenuData,
    validateMenuItem,
    validateMenuItems
  };
};
