
import React from 'react';
import { RestaurantLayout } from '@/components/restaurant/RestaurantLayout';
import RestaurantFinancials from '@/components/restaurant/financials/RestaurantFinancials';

const Financials = () => {
  return (
    <RestaurantLayout>
      <RestaurantFinancials />
    </RestaurantLayout>
  );
};

export default Financials;
