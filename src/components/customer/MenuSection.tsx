
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ViewToggle } from '@/components/customer/ViewToggle';
import { CustomerMealGrid } from '@/components/customer/CustomerMealGrid';
import EmptyState from '@/components/EmptyState';
import { MenuItem } from '@/types/menu';
import { MealType } from '@/types/meal';

interface MenuSectionProps {
  selectedRestaurant: string | null;
  menus?: MenuItem[];
  mealTypeMenus: MealType[];
  viewMode: 'grid' | 'map';
  onViewToggle: (mode: 'grid' | 'map') => void;
  isLoading: boolean;
  error?: Error | null;
  onLocationRequest: () => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  selectedRestaurant,
  menus,
  mealTypeMenus,
  viewMode,
  onViewToggle,
  isLoading,
  error,
  onLocationRequest
}) => {
  if (!selectedRestaurant) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Menu</CardTitle>
        <CardDescription>
          View the menu for the selected restaurant.
          <ViewToggle 
            currentView={viewMode} 
            onToggle={onViewToggle} 
          />
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading menu...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error.message}</p>
        ) : menus && menus.length > 0 ? (
          <CustomerMealGrid 
            menuItems={mealTypeMenus} 
            isLoading={isLoading}
            error={error}
            onLocationRequest={onLocationRequest}
          />
        ) : (
          <EmptyState message="No menu items found." />
        )}
      </CardContent>
    </Card>
  );
};
