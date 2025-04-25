
import React from 'react';
import { RestaurantLayout } from '@/components/restaurant/RestaurantLayout';
import { MenuManagement } from '@/components/restaurant/menu/MenuManagement';

const RestaurantMenu = () => {
  return (
    <RestaurantLayout>
      <MenuManagement />
    </RestaurantLayout>
  );
};

export default RestaurantMenu;
